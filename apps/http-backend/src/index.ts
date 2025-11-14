import express from "express"
import jwt from "jsonwebtoken"
import { SECRET } from "@repo/backend-common/config"
import middleware from "./middleware"
import {userSchema,userSignSchema,createRoomSchema} from "@repo/common/types" 

const app= express()
app.use(express.json())


app.post("/signup",async(req,res)=>{
    const data=userSchema.safeParse(req.body)
    if(!data.success){
        return res.json({
            status:403,
            message:"Invalid Data"
        })
    }
    const username= req.body.username
    const password= req.body.password

})

app.post("/signin",async(req,res)=>{
        const data=userSignSchema.safeParse(req.body)
    if(!data.success){
        return res.json({
            status:403,
            message:"Invalid Data"
        })
    }
    const userId=1

    const token= jwt.sign({userId},SECRET)
    res.json({token:token})
})
//@ts-ignore
app.post("/room",middleware,async(req,res)=>{
        const data=createRoomSchema.safeParse(req.body)
    if(!data.success){
        return res.json({
            status:403,
            message:"Invalid Data"
        })
    }
    res.json({
        roomID:134   
    })
}) 

app.listen(3001)