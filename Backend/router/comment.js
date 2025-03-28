import express from "express";
import { addComment, deleteComment, getComments } from "../controllers/comment.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();

// Add Comment
router.post("/", verifyToken, addComment);

// Delete Comment
router.delete("/:id", verifyToken, deleteComment);

// Get Comments
router.get("/:videoId", getComments);

export default router;
