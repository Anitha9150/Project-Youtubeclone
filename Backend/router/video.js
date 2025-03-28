import express from "express";
import {
  addVideo,
  updateVideo,
  deleteVideo,
  getVideos,
  addView,
  getByTag,
  random,
  search,
  sub,
  trend,
} from "../controllers/video.js";
import { verifyToken } from "../verifyToken.js";
import Video from "../models/Video.js"; 

const router = express.Router();

// 🌟 Create a video
router.post("/", verifyToken, addVideo);

// 🌟 Update a video
router.put("/:id", verifyToken, updateVideo);

// 🌟 Delete a video
router.delete("/:id", verifyToken, deleteVideo);

// 🌟 Add a view
router.put("/view/:id", addView);

// 🌟 Get random videos
router.get("/random", random);

// 🌟 Get trending videos
router.get("/trend", trend);

// ✅ Get all videos
router.get("/", getVideos);

// 🌟 Get subscribed channels' videos (requires auth)
router.get("/sub", verifyToken, sub);

// 🌟 Get videos by tags (filtering by tags)
router.get("/tags", getByTag);

// 🌟 Search videos (by title or description)
router.get("/search", async (req, res) => {
  const { q } = req.query; 

  try {
    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Use regex to search in the title and description (case-insensitive)
    const videos = await Video.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    });

    console.log("Search query:", q, "Found videos:", videos.length);

    if (videos.length === 0) {
      return res.status(404).json({ message: "No videos found" });
    }

    res.status(200).json(videos);
  } catch (err) {
    console.error("Error searching videos:", err.message);
    res.status(500).json({ message: "Failed to search videos", error: err.message });
  }
});

// 🌟 Filter videos (by category or "all")
router.get("/filter", async (req, res) => {
  const { filter } = req.query;
  console.log("Filter requested:", filter);

  try {
    let videos;
    if (!filter || filter.toLowerCase() === "all") {
      videos = await Video.find();
    } else {
      videos = await Video.find({
        title: { $regex: filter, $options: "i" },
      });
    }

    console.log("Fetched videos:", videos.length);
    res.status(200).json({ videos });
  } catch (err) {
    console.error("Error fetching videos:", err.message);
    res.status(500).json({ message: "Failed to fetch videos", error: err.message });
  }
});
// ✅ Get a single video by ID (including channelName)
router.get("/find/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    res.status(200).json(video); 
  } catch (err) {
    console.error("❌ Error fetching video:", err.message);
    res.status(500).json({ message: "Failed to fetch video", error: err.message });
  }
});


export default router;


  







