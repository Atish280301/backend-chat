//backend/routes/MessageRoutes.js
import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { GetMessages, uploadFile } from "../controller/MessageController.js";
import multer from "multer";
import path from "path"; // Import path for file extension check

const router = Router();

// Set up memory storage with multer, file size limit, and document file filter
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Limit file size to 10MB
    fileFilter: (req, file, cb) => {
        // Update the file types regex to include text and document formats
        const filetypes = /txt|doc|docx|pdf|xls|xlsx|csv/;
        const mimetype = filetypes.test(file.mimetype); // Check MIME type
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Check file extension
        if (mimetype && extname) {
            return cb(null, true); // Accept the file
        }
        cb(new Error('Only document files are allowed (e.g., .txt, .docx, .pdf, .xls)')); // Reject other files
    }
}).single('file');

router
    .post("/getmessages", verifyToken, GetMessages)
    .post("/uploadfile", verifyToken, upload, uploadFile); // Updated route to use memory storage

export const MessageRoutes = router;
