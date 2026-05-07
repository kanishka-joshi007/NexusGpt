import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded); // 👈 MUST CHECK

    // 🔥 handle all possible keys
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
        debugUserId: userId
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.log("AUTH ERROR:", error.message);
    return res.status(401).json({
      message: "Unauthorized",
      error: error.message
    });
  }
};