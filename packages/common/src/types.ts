import {z} from 'zod'


export const userSchema= z.object({
    username:z.string().min(3).max(50),
    password:z.string().min(5).max(15),
    name:z.string().min(3).max(50)
})

export const userSignSchema=z.object({
    username:z.string().min(3).max(50),
    password:z.string().min(5).max(15)
})
export const createRoomSchema=z.object({
    roomId:z.string().min(3).max(20)
})