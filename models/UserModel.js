//backend/models/UserModel.js
import { genSalt, hash } from "bcrypt";
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email: {type: String, required:[true, "User Email Is Required"], unique: true},
    password: {type: String, required:[true, "User Password Is Required"]},
    firstname: {type: String},
    lastname: {type: String},
    image: {type: String},
    color: {type: Number},
    profilesetup: {type: Boolean, default: false},
});

userSchema.pre("save",async function(next){
    const salt = await genSalt();
    this.password = await hash(this.password, salt);
    next();
})

export const User = mongoose.model("User",userSchema);