import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken"
import { SECRET } from "@repo/backend-common/config";
import {prismaClient} from "@repo/db/client"
const wss= new WebSocketServer({port:8080})

interface DecodedPayload extends jwt.JwtPayload{
    userId?:string
}

function checkUser(token:string):string|null{
 try {
       const decoded= jwt.verify(token,SECRET) as DecodedPayload
       console.log(decoded)
       console.log(decoded.userId)  
       if(decoded && decoded.userId && typeof decoded.userId==='string'){
             return decoded.userId 
       }
       return null
 } catch (error) {
        return null
 }     
}

interface User{
    userId: string
    ws: WebSocket
    rooms:string[]
}
const users:User[]=[]

wss.on("connection",(socket,request)=>{
    const url = request.url
    if(!url){
        return
    }
    const queryParam = new URLSearchParams(url?.split("?")[1])
    const token= queryParam.get("token")||""
    const userId=checkUser(token)
    if (userId===null){
        socket.close()
        return 
    }
    users.push({
        userId,
        rooms:[],
        ws:socket
    })
    socket.on("message",async(data)=>{
        const parsedData=JSON.parse(data as unknown as string)
        if(!parsedData){
            return 
        }
        if(parsedData.type==="join_room"){
            const user = users.find(x=>x.ws===socket)
            user?.rooms.push(parsedData.roomId)
        }
        if(parsedData.type==="leave_room"){
            const user = users.find(x=>x.ws===socket)
            if(!user){
                return
            }
            user.rooms=user.rooms.filter(x=>x!==parsedData.roomId)
        }
      
        if(parsedData.type==="chat"){
            const roomId=parsedData.roomId;
            const message=parsedData.message;
            await prismaClient.chat.create({
            data:{
                roomId,
                message,
                userId 
            }
        })
            users.forEach((user)=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({type:"chat",message,roomId }))
                }
            })
        }

    })
})