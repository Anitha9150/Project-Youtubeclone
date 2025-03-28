import express from "express";
import { 
  createChannel, 
  deleteVideo, 
  editVideo, 
  getChannelVideos 
} from "../controllers/channel.js";
import { verifyToken } from "../verifyToken.js";
import { updateChannel } from "../controllers/channel.js";

const router = express.Router();

// Routes
router.post("/", verifyToken, createChannel);
router.get("/:channelId/videos", getChannelVideos); 
router.put("/videos/:videoId", verifyToken, editVideo);
router.put("/:channelId", verifyToken, updateChannel);

router.delete("/videos/:videoId", verifyToken, deleteVideo);

export default router;

