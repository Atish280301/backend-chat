//backend\controller\ChannelController.js
import mongoose from "mongoose";
import { Channel } from "../models/ChannelModel.js";
import { User } from "../models/UserModel.js";

export const CreateChannel = async(request, response, next) => {
    try {
        const {name, members} = request.body;
        const userId = request.userId;
        const admin = await User.findById(userId);
        if(!admin) {
            return response.status(400).send("Admin User Not Found!");
        }
        const validmembers = await User.find({_id: {$in: members}});
        if(validmembers.length !== members.length) {
            return response.status(400).send("Some Members Are Not Valid Users.");
        }
        const newChannel = new Channel({
            name, members, admin: userId,
        })
        await newChannel.save();
        return response.status(201).json({channel: newChannel})
    } catch (error) {
        console.error({ error });
        return response.status(500).send("Internal Server Error");
    }
}

export const GetUserChannels = async(request, response, next) => {
    try {
        let userId = new mongoose.Types.ObjectId(request.userId);
        const channels = await Channel.find({
            $or: [{admin:userId},{members: userId}],
        }).sort({updatedat: -1});

        return response.status(201).json({channels})
    } catch (error) {
        console.error({ error });
        return response.status(500).send("Internal Server Error");
    }
}

export const GetChannelsMessages = async(request, response, next) => {
    try {
        const {channelId} = request.params;
        const channel = await Channel.findById(channelId).populate({path: "messages",populate:{
            path: "sender",select:"firstname lastname email _id image color"
        }})

        if(!channel) {
            return response.status(404).send("Channel Not Found!")
        }
        const messages = channel.messages
        return response.status(201).json({messages});
    } catch (error) {
        console.error({ error });
        return response.status(500).send("Internal Server Error");
    }
}