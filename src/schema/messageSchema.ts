import {z} from 'zod'

export const messageSchema = z.object({
    content: z.string()
    .min(10, {message: "Content must be at least of 10 charcters"})
    .max(300, {message: 'Content can be at most 300 characters'})
})