import { createError } from "../err.js";
import User from "../models/User.js";
import Video from "../models/Video.js";

export const update = async (req, res, next) => {
    if (req.params.id === req.user.id) {
        try {
            const userUpdate = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            }, {
                new: true
            });
            res.status(200).json({
                success: true,
                status: 200,
                message: "User has been Updaded.",
                user: userUpdate
            });
        }
        catch (err) {
            next(err);
        }
    } else {
        return next(createError(403, "You can update only your account!"))
    }
}
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ username: user.username }); // ✅ Send only username
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error });
    }
};

  
export const deleteUser = async (req, res, next) => {
    if (req.params.id === req.user.id) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json({
                success: true,
                status: 200,
                message: "User has been deleted.",
            });
        } catch (err) {
            next(err);
        }
    } else {
        return next(createError(403, "You can delete only your account!"));
    }
};

export const subscribe = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $push: { subscribedUsers: req.params.id }
        });
        await User.findByIdAndUpdate(req.params.id, {
            $inc: { subscribers: 1 },
        });
        res.status(200).json({
            success: true,
            status: 200,
            message: "Subscription successful."
        });
    } catch (err) {
        next(err);
    }
};

export const unsubscribe = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { subscribedUsers: req.params.id }
        });
        await User.findByIdAndUpdate(req.params.id, {
            $inc: { subscribers: -1 },
        });
        res.status(200).json({
            success: true,
            status: 200,
            message: "Unsubscription successful."
        })
    } catch (err) {
        next(err);
    }
};
export const like = async (req, res, next) => {
    const id = req.user.id;
    const videoId = req.params.videoId;
    try {
        await Video.findByIdAndUpdate(videoId, {
            $addToSet: { likes: id },
            $pull: { dislikes: id }
        })
        res.status(200).json({
            success: true,
            status: 200,
            message: "The video has been liked.",
        })
    } catch (err) {
        next(err);
    }
};
export const dislike = async (req, res, next) => {
    const id = req.user.id;
    const videoId = req.params.videoId;
    try {
        await Video.findByIdAndUpdate(videoId, {
            $addToSet: { dislikes: id },
            $pull: { likes: id }
        })
        res.status(200).json(
            {
                success: true,
                status: 200,
                message: "The video has been disliked.",
            }
        )
    } catch (err) {
        next(err);
    }
};

// Get Like and Dislike Count
export const getLikesDislikes = async (req, res, next) => {
    const videoId = req.params.videoId;
    try {
        const video = await Video.findById(videoId);
        if (!video) return next(createError(404, "Video not found"));

        res.status(200).json({
            success: true,
            status: 200,
            message: "Likes and Dislikes fetched successfully.",
            likes: video.likes.length,
            dislikes: video.dislikes.length
        });
    } catch (err) {
        next(err);
    }
};