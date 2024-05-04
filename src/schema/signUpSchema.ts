import {z} from 'zod';

export const usernameValidation = z
        .string()
        .min(3, "Username must contain atleast 3 characters")
        .max(20, "Username must contain atmost 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/,"Username must not contain special character")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(8, "Password must contain atleast 8 characters")
})