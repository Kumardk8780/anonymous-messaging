/**
 * Verifies a user's account using a verification code.
 * 
 * @param {Request} request - The incoming request object.
 * @returns {Response} A JSON response indicating whether the verification was successful or not.
 * 
 * @example
 *  Request body
 * {
 *   "username": "johnDoe",
 *   "code": "123456"
 * }
 * 
 *  Response (200 OK)
 * {
 *   "success": true,
 *   "message": "User Verified Successfully!"
 * }
 * 
 *  Response (404 Not Found)
 * {
 *   "success": false,
 *   "message": "User Not Found"
 * }
 * 
 *  Response (500 Internal Server Error)
 * {
 *   "success": false,
 *   "message": "Invalid Verification Code"
 * }
 */
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request) {
    /**
     * Connects to the database.
     */
    await dbConnect()
    try {
        /**
         * Extracts the username and verification code from the request body.
         */
        const { username, code } = await request.json()
        const decodedUsername = decodeURIComponent(username);

        /**
         * Finds the user with the provided username.
         */
        const user = await UserModel.findOne({ username: decodedUsername })

        if (!user) {
            /**
             * Returns a 404 response if the user is not found.
             */
            return Response.json({
                success: false,
                message: "User Not Found"
            }, { status: 404 })
        }

        /**
         * Checks if the verification code is valid and not expired.
         */
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            /**
             * Sets the user's verified status to true and saves the changes.
             */
            user.isVerified = true
            await user.save();

            /**
             * Returns a 200 response if the verification is successful.
             */
            return Response.json({
                success: true,
                message: "User Verified Successfully!",
            }, { status: 200 })
        } else if (!isCodeNotExpired) {
            /**
             * Returns a 500 response if the verification code has expired.
             */
            return Response.json({
                success: false,
                message: "Verification code has expired. Please signup again to get a new code."
            }, { status: 500 })
        } else {
            /**
             * Returns a 500 response if the verification code is invalid.
             */
            return Response.json({
                success: false,
                message: "Invalid Verification Code",
            }, { status: 500 })
        }
    } catch (error) {
        /**
         * Returns a 500 response if an error occurs during the verification process.
         */
        return Response.json({
            success: false,
            message: "Error Veridying User",
        }, {
            status: 500,
        })
    }
}