import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// Utility function to generate token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined!");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// User Registration (Sign Up)
export const SignUpController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error in SignUpController:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// User Login (Sign In)
export const SignInController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const accessToken = generateToken(user._id);
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(200).json({ accessToken, user: userWithoutPassword });
  } catch (error) {
    console.error("Error in SignInController:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// Google Authentication (Sign In/Sign Up)
export const GoogleController = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email || !name || !googleId) {
      return res.status(400).json({ message: "Invalid Google data!" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ name, email, googleId });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const accessToken = generateToken(user._id);
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(200).json({ accessToken, user: userWithoutPassword });
  } catch (error) {
    console.error("Error in GoogleController:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};




