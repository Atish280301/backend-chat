//backend/controller/AuthController.js

import { compare } from "bcrypt";
import { User } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import {renameSync, unlinkSync} from "fs";

const maxAge = 7 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
    return jwt.sign({email, userId}, process.env.JWT_KEY,{expiresIn: maxAge})
}

export const signup = async (request, response, next) => {
    try {
        const {email, password} = request.body;
        if(!email || !password) {return response.status(400).send("Email & Password Is Required!")}

        const user = await User.create({email, password});
        response.cookie("jwt",createToken(email, user.id),{
            maxAge, secure: true, sameSite: "None",
        })
        return response.status(201).json({user:{
            id: user.id,
            email: user.email,
            profilesetup: user.profilesetup,
        }})
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error!");
    }
}

export const login = async (request, response, next) => {
    try {
        const {email, password} = request.body;
        if(!email || !password) {return response.status(400).send("Email & Password Is Required!")}

        const user = await User.findOne({ email });
        if(!user) {
            return response.status(400).send("User With The Given Email Not Found!")
        }
        const auth = await compare(password, user.password);
        if(!auth){
            return response.status(400).send("Password Is Incorrect!")
        }

        response.cookie("jwt",createToken(email, user.id),{
            maxAge, secure: true, sameSite: "None",
        })
        return response.status(200).json({user:{
            id: user.id,
            email: user.email,
            profilesetup: user.profilesetup,
            firstname: user.firstname,
            lastname: user.lastname,
            image: user.image,
            color: user.color,
        }})
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error!");
    }
}

export const getUserInfo = async (request, response, next) => {
    try {
        const userData = await User.findById(request.userId);
        if(!userData){
           return response.status(404).send("User With The Given Id Is Not Found!"); 
        }
        return response.status(200).json({
            id: userData.id,
            email: userData.email,
            profilesetup: userData.profilesetup,
            firstname: userData.firstname,
            lastname: userData.lastname,
            image: userData.image,
            color: userData.color,
        })
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
}

export const updateProfile = async (request, response, next) => {
    try {
        const userId = request.userId;

        const { firstname, lastname, color } = request.body;

        if (!firstname || !lastname || color === undefined) {
            return response.status(400).send("Firstname, Lastname, & Color are required");
        }

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return response.status(400).send("Invalid User ID");
        }

        const userData = await User.findByIdAndUpdate(userId, {
            firstname,
            lastname,
            color,
            profilesetup: true
        }, { new: true, runValidators: true });

        if (!userData) {
            return response.status(404).send("User not found");
        }

        return response.status(200).json({
            id: userData.id,
            email: userData.email,
            profilesetup: userData.profilesetup,
            firstname: userData.firstname,
            lastname: userData.lastname,
            image: userData.image,
            color: userData.color,
        });
    } catch (error) {
        console.error({ error });
        return response.status(500).send("Internal Server Error");
    }
};

export const addProfileImage = async (request, response, next) => {
    try {
        if(!request.file){
            return response.status(400).send("Image File Is Required!");
        }
        const date = Date.now();
        let filename = "uploads/profiles/" + date + request.file.originalname;
        renameSync(request.file.path, filename);
        const updatedUser = await User.findByIdAndUpdate(request.userId,{image:filename},{new:true, runValidators: true})
        return response.status(200).json({
            image: updatedUser.image,
        });
    } catch (error) {
        console.error({ error });
        return response.status(500).send("Internal Server Error");
    }
}

export const removeprofileimage = async (request, response, next) => {
    try {
        const userId = request.userId;
        const user = await User.findById(userId);
        if(!user) {
            return response.status(404).send("User Not Found!");
        }
        if(user.image) {
            unlinkSync(user.image); 
        }
        user.image = null;
        await user.save();

        return response.status(200).send("Profile Image Removed Successfully!");
    } catch (error) {
        console.error({ error });
        return response.status(500).send("Internal Server Error");
    }
};

export const logoutcontroller = async (request, response, next) => {
    try {
        response.clearCookie("jwt", {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
        });
        return response.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal Server Error");
    }
}
