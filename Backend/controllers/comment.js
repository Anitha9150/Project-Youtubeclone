import Comment from "../models/Comment.js";
import Video from "../models/Video.js";

// Add Comment
export const addComment = async (req, res, next) => {
  try {
    const comment = new Comment({ userId: req.user.id, ...req.body });
    await comment.save();

    // Push comment ID into the Video's comments array (optional)
    await Video.findByIdAndUpdate(req.body.videoId, { $push: { comments: comment._id } });

    res.status(200).json({
      success: true,
      message: "The comment has been added.",
      comment,  
    });
  } catch (error) {
    next(error);
  }
};

// Delete Comment
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found!" });

    const video = await Video.findById(comment.videoId);
    if (req.user.id === comment.userId.toString() || req.user.id === video.userId) {
      await Comment.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "The comment has been deleted." });
    } else {
      return res.status(403).json({ message: "You can delete only your comment!" });
    }
  } catch (error) {
    next(error);
  }
};

// Get Comments (with user details)
export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ videoId: req.params.videoId })
      .populate("userId", "name img")  
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    next(error);
  }
};




