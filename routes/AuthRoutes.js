//backend/routes/AuthRoutes.js
import { Router } from "express";
import { login, signup, getUserInfo, updateProfile, addProfileImage, removeprofileimage, logoutcontroller } from "../controller/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const router = Router();
const upload = multer({dest:"uploads/profiles/"})
router
    .post("/signup",signup)
    .post("/login",login)
    .get("/userinfo",verifyToken, getUserInfo)
    .post("/updateprofile",verifyToken, updateProfile)
    .post("/addprofileimage",verifyToken, upload.single("image"), addProfileImage)
    .delete("/removeprofileimage",verifyToken, removeprofileimage)
    .post("/logout",logoutcontroller)

export const AuthRoutes = router;