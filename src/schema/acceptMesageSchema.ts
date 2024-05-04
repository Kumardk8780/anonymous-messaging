import {z} from 'zod'

export const acceptMesssageSchema = z.object({
    acceptMessages: z.boolean(),
})