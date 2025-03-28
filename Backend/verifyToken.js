import jwt from "jsonwebtoken";
import { createError } from "./err.js";

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]
    console.log("Received Token:", token); // Debugging line


    if (!token) {
        return next(createError(401, "You are not authenticated!"));
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET, 
        (err, user) => {
            if (err) {
                console.error("JWT Verification Error:", err.message);
                return next(createError(403, "Token is not valid!"));
            }
            console.log("Decoded User:", user);  // 🔍 Check the decoded token
            req.user = user;
            next();
        }
    );
}    