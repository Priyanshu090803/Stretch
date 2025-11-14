import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "@repo/backend-common/config"

export default function middleware(req:Request,res:Response,next:NextFunction){
    //@ts-ignore
    const token = req.headers["authorization"];
    const decoded=jwt.verify(token,SECRET)
    if(decoded){
        //@ts-ignore
        req.userId=decoded.userId
        next()
    }else{
        //@ts-ignore
        res.status(403).json({
            message:"Unauthorized"
        })
    }
}