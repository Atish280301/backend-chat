//backend/routes/ContactRoutes.js
import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { GetContactsDM, SearchContacts, GetAllContacts } from "../controller/ContactController.js";
const router = Router();
router
    .post("/search",verifyToken, SearchContacts)
    .get("/getcontactsdm",verifyToken,GetContactsDM)
    .get("/getallcontacts",verifyToken, GetAllContacts)
export const ContactRoutes = router;