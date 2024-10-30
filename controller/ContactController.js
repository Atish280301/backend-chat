//backend/controller/ContactController.js

import mongoose from "mongoose";
import { User } from "../models/UserModel.js";
import { Message } from "../models/MessagesModel.js";

export const SearchContacts = async (request, response, next) => {
    try {
        const {searchterm} = request.body;
        if(!searchterm === undefined || searchterm === null) {
            return response.status(400).send("Search Term Is Required!")
        }
        const sanitizedSearchTerm = searchterm.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
        const regex = new RegExp(sanitizedSearchTerm,"i");
        const contacts = await User.find({$and: [{_id:{$ne:request.userId}},{$or:[{firstname:regex},{lastname:regex},{email:regex}]},]});
        return response.status(200).json({contacts});
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
}

export const GetContactsDM = async (request, response, next) => {
    try {
        let {userId} = request;

        userId = new mongoose.Types.ObjectId(userId);

        const contacts = await Message.aggregate([
            {
                $match: {
                    $or:[
                        {sender: userId},
                        {receiver: userId},
                    ]
                },
            },
            {
                $sort:{timestamp: -1}
            },
            {
                $group: {
                    _id: {
                       $cond: {
                            if:{$eq:["$sender",userId]},
                            then:"$receiver",
                            else:"$sender",
                       } ,
                    },
                    lastmessagetime : {$first:"$timestamp"},
                },
            },
            {
                $lookup : {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactinfo",
                },
            },
            {
                $unwind:"$contactinfo",
            },
            {
                $project: {
                    _id:1,
                    lastmessagetime: 1,
                    email:"$contactinfo.email",
                    firstname:"$contactinfo.firstname",
                    lastname:"$contactinfo.lastname",
                    image:"$contactinfo.image",
                    color:"$contactinfo.color",
                },
            },
            {
                $sort: {lastmessagetime: -1},
            }
        ]);
        return response.status(200).json({contacts});
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
}

export const GetAllContacts = async (request, response, next) => {
    try {
        const users = await User.find({_id:{$ne:request.userId}}, "firstname lastname email _id");
        const contacts = users.map((user) =>({
            label: user.firstname ? `${user.firstname} ${user.lastname}` : `${user.email}`,
            value: user._id,
        }))
        return response.status(200).json({contacts});
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
}
