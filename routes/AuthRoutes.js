// Import Statements
import { Router } from "express";
import { login, signup, getUserInfo, updateProfile, addProfileImage, removeprofileimage, logoutcontroller } from "../controller/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    }
}).single('userimage');

router
    .post("/signup", signup)
    .post("/login", login)
    .get("/userinfo", verifyToken, getUserInfo)
    .post("/updateprofile", verifyToken, updateProfile)
    .post("/addprofileimage", verifyToken, upload, addProfileImage)
    .delete("/removeprofileimage", verifyToken, removeprofileimage)
    .post("/logout", logoutcontroller);

export const AuthRoutes = router;
