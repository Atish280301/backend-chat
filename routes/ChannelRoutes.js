//backend/routes/ChannelRoutes
import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { CreateChannel, GetUserChannels, GetChannelsMessages } from "../controller/ChannelController.js";
const router = Router();

router
    .post("/createchannel",verifyToken, CreateChannel)
    .get("/getuserchannels",verifyToken, GetUserChannels)
    .get("/getchannelmessages/:channelId",verifyToken, GetChannelsMessages)
export const ChannelRoutes = router;