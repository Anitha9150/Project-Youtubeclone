import Video from "../models/Video.js";
import User from "../models/User.js";

// 🌟 Add a new video
export const addVideo = async (req, res) => {
    try {
        const newVideo = new Video({ ...req.body, uploader: req.user.id });
        const savedVideo = await newVideo.save();
        res.status(201).json(savedVideo);
    } catch (err) {
        res.status(500).json({ message: "Failed to add video", error: err.message });
    }
};

// 🌟 Update an existing video
export const updateVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: "Video not found" });

        if (video.uploader.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only update your own videos" });
        }

        const updatedVideo = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedVideo);
    } catch (err) {
        res.status(500).json({ message: "Failed to update video", error: err.message });
    }
};

// 🌟 Delete a video
export const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: "Video not found" });

        if (video.uploader.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own videos" });
        }

        await Video.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Video deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete video", error: err.message });
    }
};
export const getVideos = async (req, res) => {
    try {
        const videos = await Video.find()
            .populate("uploader", "username img")
            .exec();

        const formattedVideos = videos.map((video) => ({
            ...video.toObject(),
            channelName: video.uploader?.username || "Unknown Channel",
        }));

        res.status(200).json(formattedVideos);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch videos", error: err.message });
    }
};


// 🌟 Increment views for a video
export const addView = async (req, res) => {
    try {
        await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.status(200).json({ message: "View count updated" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update views", error: err.message });
    }
};

// 🌟 Get trending videos (sorted by views)
export const trend = async (req, res) => {
    try {
        const trendingVideos = await Video.find().sort({ views: -1 });
        res.status(200).json(trendingVideos);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch trending videos", error: err.message });
    }
};

// 🌟 Get random videos
export const random = async (req, res) => {
    try {
        const randomVideos = await Video.aggregate([{ $sample: { size: 10 } }]);
        res.status(200).json(randomVideos);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch random videos", error: err.message });
    }
};

// 🌟 Get subscribed channels' videos
export const sub = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const subscribedChannels = user.subscribedUsers;

        const videos = await Video.find({ uploader: { $in: subscribedChannels } }).sort({ createdAt: -1 });
        res.status(200).json(videos);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch subscription videos", error: err.message });
    }
};

// 🌟 Get videos by tag filtering
export const getByTag = async (req, res) => {
    const tags = req.query.tags.split(","); // e.g., ?tags=tech,education
    try {
        const videos = await Video.find({ tags: { $in: tags } }).limit(10);
        res.status(200).json(videos);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch videos by tag", error: err.message });
    }
};

// 🌟 Search videos by title or description
export const search = async (req, res) => {
    const { q } = req.query;
    try {
        if (!q) return res.status(400).json({ message: "Search query is required" });

        const videos = await Video.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } }
            ]
        });

        if (videos.length === 0) {
            return res.status(404).json({ message: "No videos found" });
        }

        res.status(200).json(videos);
    } catch (err) {
        res.status(500).json({ message: "Failed to search videos", error: err.message });
    }
};


  
