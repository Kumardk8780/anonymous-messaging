import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect()

    try {

        //destructuring credentials
        const { email, password, username } = await request.json()

        //finding user by username and checking if it is verified
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        //if username is taken return false and tell user to take another username
        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "User already exists"
                },
                {
                    status: 400
                }
            )
        }

        //finding user by email
        const existingUserByEmail = await UserModel.findOne({ email })

        //generating verify code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exists with this email"
                },
                    {
                        status: 400
                    })
            }
            else {
                //updating user's credentials
                const hashedPassword = await bcrypt.hash(password,10)
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                
                //saving user's updated details 
                await existingUserByEmail.save()
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            //setting expiry code to one hour from current time
            expiryDate.setHours(expiryDate.getHours() + 1)

            //creating new user
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            //saving new user in the database
            await newUser.save()

            //send verification email
            const emailResponse = await sendVerificationEmail(
                email,
                username,
                verifyCode
            )

            //error in user registration
            if (!emailResponse.success) {
                return Response.json({
                    success: false,
                    message: emailResponse.message
                },
                    {
                        status: 500
                    })
            }

            //user registered successfully
            return Response.json({
                success: true,
                message: "User registered successfully. Plaese verify your email adrress."
            }, {
                status: 201
            })
        }

    } catch (error) {
        console.error('Error registering user', error);
        return Response.json(
            {
                success: false,
                message: "Error registering user"
            },
            {
                status: 500
            }
        )

    }
}