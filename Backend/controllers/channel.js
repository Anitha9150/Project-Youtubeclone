import Channel from "../models/Channel.js";
import Video from "../models/Video.js";
import User from "../models/User.js";
export const createChannel = async (req, res) => {
  try {
    // Check if the user already has a channel
    const existingChannel = await Channel.findOne({ owner: req.user.id });
    if (existingChannel) {
      return res.status(400).json({ message: "You already have a channel" });
    }

    // Create a new channel
    const newChannel = new Channel({
      name: req.body.name,
      owner: req.user.id,
      description: req.body.description,
      channelBanner: req.body.channelBanner,
    });

    await newChannel.save();

    // ✅ Ensure channelId is properly saved in the User model
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { channelId: newChannel._id },
      { new: true } // Returns the updated user
    );

    res.status(201).json({ newChannel, updatedUser }); 
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ message: "Error creating channel", error });
  }
};
export const updateChannel = async (req, res) => {
  try {
    const updatedChannel = await Channel.findByIdAndUpdate(
      req.params.channelId,
      { $set: req.body },
      { name: newName },
      { new: true }
    );

    if (!updatedChannel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // ✅ Update the channelName in all associated videos
    await Video.updateMany(
      { userId: updatedChannel.owner }, // Match videos belonging to this channel
      { $set: { channelName: updatedChannel.channelName } }
    );

    res.status(200).json(updatedChannel);
  } catch (error) {
    console.error("Error updating channel:", error);
    res.status(500).json({ message: "Error updating channel", error });
  }
};


export const getChannelVideos = async (req, res) => {
  try {
    const { channelId } = req.params;

    // Fetch channel with updated name and videos
    const channel = await Channel.findById(channelId).populate("videos");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.status(200).json(channel);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// Edit Video (Only Video Owner)
export const editVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your videos" });
    }

    const updatedVideo = await Video.findByIdAndUpdate(req.params.videoId, req.body, { new: true });
    res.status(200).json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: "Error updating video", error });
  }
};

// Delete Video (Only Video Owner)
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your videos" });
    }

    await Video.findByIdAndDelete(req.params.videoId);
    await Channel.updateOne(
      { videos: req.params.videoId },
      { $pull: { videos: req.params.videoId } }
    );

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting video", error });
  }
};
