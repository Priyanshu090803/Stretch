import express from "express"
import jwt from "jsonwebtoken"
import { SECRET } from "@repo/backend-common/config"
import middleware from "./middleware"
import {userSchema,userSignSchema,createRoomSchema} from "@repo/common/types" 
import {prismaClient} from "@repo/db/client"

const app= express()
app.use(express.json())

app.post("/signup", async (req, res) => {
  try {
    // Input validation
    const data = userSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(400).json({
        message: "Invalid data",
        errors: data.error
      });
    }

    const { username, password, name, photo } = data.data;

    // Check for existing user
    const existingUser = await prismaClient.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    // TODO: Hash password before storing
    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        username,
        password, // Replace with hashedPassword
        name,
        photo
      }
    });

    return res.status(201).json({
      message: "User registered successfully",
      data: {
        id: user.id,
        username: user.username,
        name: user.name
        // Don't return password
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    
    return res.status(500).json({
      message: "Internal server error during signup"
    });
  }
});

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