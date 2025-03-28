import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: String,
    desc: String,
    imgUrl: String,
    videoUrl: String,
    views: { type: Number, default: 0 },
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    channelName: { type: String, required: true }
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", VideoSchema);
export default Video;




