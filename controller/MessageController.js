//backend/controller/MessageController.js
import { Message } from "../models/MessagesModel.js";
import {mkdirSync, renameSync} from 'fs';
export const GetMessages = async (request, response, next) => {
    try {
        const user1 = request.userId;
        const user2 = request.body.id;

        if(!user1 || !user2) {
            return response.status(400).send("Both User1 Id & User2 Id Required!");   
        }
        const messages = await Message.find({
            $or:[
                {sender:user1, receiver:user2},
                {sender:user2, receiver:user1},
            ]
        }).sort({timestamp: 1});
        return response.status(200).json({messages})
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
}

export const uploadFile = async (request, response, next) => { 
    try {
        if (!request.file) {
            return response.status(400).send("File is required!");
        }
        console.log("Received file metadata:", request.file);

        const date = Date.now();
        const fileDir = `uploads/files/${date}`;
        const filename = `${fileDir}/${request.file.originalname}`;

        mkdirSync(fileDir, { recursive: true });
        renameSync(request.file.path, filename);

        return response.status(200).json({ filePath: filename });
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }
}