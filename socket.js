//backend/socket.js
import {Server as SocketIoServer} from "socket.io";
import { Message } from "./models/MessagesModel.js";
import {Channel} from "./models/ChannelModel.js";
export const setupSocket = (server) => {
    const io = new SocketIoServer(server,{
        cors: {
            origin: "https://vercel.com/lipun-sahus-projects/frontend-chat/ESB2Ksu7CvXeYb98Fov6Zy88UAvK",
            methods: ["GET","POST"],
            credentials: true,
        }
    });
    const userSocketMap = new Map();
    const disconnect = (socket) => {
        console.log(`Client Disconnected: ${socket.id}`)
        for(const [userId, socketId] of userSocketMap.entries()){
            if(socketId === socket.id){
                userSocketMap.delete(userId);
                break;
            }
        }
    }
    const sendMessage = async (message) => {
        const senderSocketId = userSocketMap.get(message.sender);
        const receiverSocketId = userSocketMap.get(message.receiver);

        const createdMessage = await Message.create(message);

        const messageData = await Message.findById(createdMessage._id)
        .populate("sender","id email firstname lastname image color")
        .populate("receiver","id email firstname lastname image color");

        if(receiverSocketId){
            io.to(receiverSocketId).emit("receiveMessage",messageData);
        }
        if(senderSocketId){
            io.to(senderSocketId).emit("receiveMessage",messageData);
        }
    }
    const SendChannelMessage = async (message) => {
        const {channelId, sender, content, messagetype, fileurl} = message;
        const createdMessage = await Message.create({
            sender, receiver:null, content, messagetype, 
            timestamp: new Date(), fileurl
        });
        const messageData = await Message.findById(createdMessage._id).populate("sender","id email firstname lastname image color").exec();

        await Channel.findByIdAndUpdate(channelId, {
            $push:{messages:createdMessage._id}
        });

        const channel = await Channel.findById(channelId).populate("members");

        const finalData = {...messageData._doc,channelId: channel._id};

        if(channel && channel.members) {
            channel.members.forEach((member) => {
                const memberSocketId = userSocketMap.get(member._id.toString());
                if(memberSocketId) {
                    io.to(memberSocketId).emit("receivechannelmessage", finalData);
                }
            });
            const adminSocketId = userSocketMap.get(channel.admin._id.toString());
            if(adminSocketId) {
                io.to(adminSocketId).emit("receivechannelmessage", finalData);
            }
        }
    }

    io.on("connection",(socket) => {
        const userId = socket.handshake.query.userId;
        if(userId) {
            userSocketMap.set(userId, socket.id);
            console.log(`User Connected: ${userId} With Socket Id: ${socket.id}`)
        } else {
            console.log("User Id Not Provided During Connection!")
        }
        socket.on("sendMessage",sendMessage)
        socket.on("sendchannelmessage",SendChannelMessage)
        socket.on("disconnect",()=>disconnect(socket))
    })
}