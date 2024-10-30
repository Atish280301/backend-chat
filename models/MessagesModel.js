//backend/models/MessagesModel.js
import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    messagetype:{
        type:String,
        enum:["text","file"],
        required: true,
    },
    content:{
        type:String,
        required: function(){
            return this.messagetype === "text";
        },
    },
    fileurl:{
        type:String,
        required: function(){
            return this.messagetype === "file";
        },
    },
    timestamp: {
        type:Date,
        default: Date.now,
    },
})
export const Message = mongoose.model("Message",messageSchema);