import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import { SECRET } from "@repo/backend-common/config";
const wss= new WebSocketServer({port:8080})


wss.on("connection",(socket,request)=>{
    const url = request.url
    if(!url){
        return
    }
    const queryParam = new URLSearchParams(url?.split("?")[1])
    const token= queryParam.get("token")||""
    const decode= jwt.verify(token,SECRET)
    if(!decode || !(decode as JwtPayload).userId){
        socket.close()
        return
    }
    socket.on("message",()=>{
        socket.send("Pong")
    })
})