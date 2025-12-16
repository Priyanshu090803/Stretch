import {z} from 'zod'


export const userSchema= z.object({
    email:z.string().min(3).max(50),
    password:z.string().min(5).max(15),
    name:z.string().min(3).max(50),
    photo:z.string().min(2).max(1000).optional()
})
export const userSignSchema=z.object({
    email:z.email().min(3).max(50),
    password:z.string().min(5).max(15)
})
export const createRoomSchema=z.object({
    name:z.string().min(3).max(20)
})