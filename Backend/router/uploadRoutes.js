import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import Video from "../models/Video.js";  

const router = express.Router();

// Create uploads folder if not exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("✅ 'uploads/' folder created!");
}

// Multer setup to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload route
router.post(
  "/video",
  (req, res, next) => {
    upload.fields([
      { name: "video", maxCount: 1 },
      { name: "img", maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        console.error("Upload Error:", err.message);
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: "No video uploaded!" });
    }

    const originalVideoPath = path.join(uploadsDir, req.files.video[0].filename);
    const convertedVideoPath = originalVideoPath.replace(path.extname(originalVideoPath), "-converted.mp4");
    const imgUrl = req.files.img ? `/uploads/${req.files.img[0].filename}` : null;

    try {
      // Convert video to MP4 with audio support
      await new Promise((resolve, reject) => {
        ffmpeg(originalVideoPath)
          .output(convertedVideoPath)
          .videoCodec("libx264")
          .audioCodec("aac")
          .outputOptions(["-preset fast", "-crf 23", "-strict -2"])
          .on("end", async () => {
            console.log("✅ Video conversion complete!");

            // Remove the original file after conversion
            fs.unlink(originalVideoPath, (err) => {
              if (err) console.error("Failed to delete original video:", err);
            });

            // Save video details in MongoDB
            const newVideo = new Video({
              title: req.body.title || "Untitled Video",
              desc: req.body.desc || "No description",
              videoUrl: `/uploads/${path.basename(convertedVideoPath)}`,
              imgUrl,
              userId: req.body.userId,
            });

            await newVideo.save();
            res.status(201).json({ success: true, video: newVideo });
            resolve();
          })
          .on("error", (err) => {
            console.error("FFmpeg Error:", err);
            res.status(500).json({ success: false, message: "Video conversion failed", error: err.message });
            reject(err);
          })
          .run();
      });
    } catch (error) {
      console.error("Error saving video:", error);
      res.status(500).json({ success: false, message: "Failed to save video", error: error.message });
    }
  }
);

export default router;





