//backend/routes/MessageRoutes.js
import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { GetMessages, uploadFile } from "../controller/MessageController.js";
import multer from "multer";
const router = Router();
const upload = multer({dest:"uploads/files/"})
router
    .post("/getmessages",verifyToken, GetMessages)
    .post("/uploadfile",verifyToken,upload.single("file"),uploadFile)

export const MessageRoutes = router;