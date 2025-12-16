import express from "express"
import jwt from "jsonwebtoken"
import { SECRET } from "@repo/backend-common/config"
import middleware from "./middleware"
import {userSchema,userSignSchema,createRoomSchema} from "@repo/common/types" 
import {prismaClient} from "@repo/db/client"
import bcrypt from "bcryptjs"

const app= express()
app.use(express.json())

app.post("/signup", async (req, res) => {
  try {
    // Input validation
    const data =   userSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(400).json({
        message: "Invalid data",
        errors: data.error
      });
    }

    const { email, password, name } =  data.data;

    // Check for existing user
    const existingUser = await prismaClient.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    // TODO: Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        email,
        password:hashedPassword, // Replace with hashedPassword
        name
      }
    });

    return res.status(201).json({
      message: "User registered successfully",
      data: {
        id: user.id,
        email: user.email,
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
try {
    const data=userSignSchema.safeParse(req.body)
    if(!data.success){
      return res.status(401).json({
        message:"Data is invalid"
      })
    }
    const email= data.data?.email
    const password=data.data?.password
    const user = await prismaClient.user.findUnique({where:{email}})
    if(!user){
     return  res.status(404).json({
        message:"User not found!"
      })
    }
    const checkPassword=await bcrypt.compare(password,user?.password||"")
    if(!checkPassword){
     return res.status(401).send("Password is incorrect")
    }
    const token = jwt.sign({userId:user.id},SECRET)
    res.status(200).json({
      message:"SignIn successful!",
      token
    })
} catch (error) {
    console.log("Error",error)
   return res.status(500).json({
    message:"Error while Signing In"
   })
}
})

  // if(!data.success){
    //     return res.json({
    //         status:403,
    //         message:"Invalid Data"
    //     })
    // }
    // const userId=1

    // const token= jwt.sign({userId},SECRET)
    // res.json({token:token})
//@ts-ignore
app.post("/room",middleware,async(req,res)=>{
  try {
    const parsedData= createRoomSchema.safeParse(req.body)
    if(!parsedData.success){
      return res.status(403).json({
        message:"Data is invalid"
      })
    }
    //@ts-ignore
    const userId=req.userId
    console.log("User Id",userId)

    const room=await prismaClient.room.create({
      data:{
        slug:parsedData.data.name,
        adminId:userId
      }
    })
    if(!room){
      return res.status(500).json({
        message:"Error while creating room!"
      })
    }
    return res.status(200).json({
      message:"Room created successfully",
      roomId:room.id
    })
  } catch (error) {
    console.log("Error:",error)
    return res.status(500).json({message:"Error while creating Room"})
  }
}) 
//@ts-ignore
app.get("/room/:roomId",middleware,async(req,res)=>{
  try {
    const roomId=Number(req.params.roomId) 
    const message= await prismaClient.chat.findMany({
      where:{
        roomId
      },
      orderBy:{
        id:"desc"
      },
      take:50
    })   
    return res.status(200).json({
       message
    })
  } catch (error) {
    console.log("Error:",error)
    return res.status(500).json({message:"Error while fetching Room"})
  }
})
app.listen(3001)