// Import Dependencies
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import Routers
import userRouter from "./router/user.js";
import videoRouter from "./router/video.js";
import commentsRouter from "./router/comment.js";
import authRouter from "./router/auth.js";
import uploadRoutes from "./router/uploadRoutes.js";
import channelRouter from "./router/channel.js";

// Import Database Connection
import connectDB from "./db.js";

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 4000;

// Initialize App
const app = express();

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // Allow frontend requests
  credentials: true, // Allow cookies and auth headers
}));

// Serve Static Files (uploaded videos/images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Debugging log for incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/videos", videoRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/upload", uploadRoutes);
app.use("/api/channels", channelRouter);

// Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  console.error(`❌ Error: ${message}`);
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

// Connect to DB and Start Server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
  });






