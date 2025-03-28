import express from "express";
import {
  SignUpController,
  SignInController,
  GoogleController,
} from "../controllers/auth.js";

const router = express.Router();

// User Registration
router.post("/signup", SignUpController);

// User Login
router.post("/signin", SignInController);

// Google Authentication (if needed)
router.post("/google", GoogleController);

export default router;


