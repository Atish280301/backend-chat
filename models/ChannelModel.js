//backend\models\ChannelModel.js
import mongoose from "mongoose";
const channelSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true,
    },
    members: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        }
    ],
    admin: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    messages:[
        {
            type: mongoose.Schema.ObjectId,
            ref: "Message",
            required: false,
        }
    ],
    createdat: {
        type:Date,
        default: Date.now,
    },
    updatedat: {
        type:Date,
        default: Date.now,
    },
})

channelSchema.pre("save",function(next){
    this.updatedat = Date.now();
    next();
})

channelSchema.pre("findOneAndUpdate",function(next){
    this.set({updatedat: Date.now()})
    next();
})

export const Channel = mongoose.model("Channel",channelSchema);