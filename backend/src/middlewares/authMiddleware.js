// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Middleware để xác thực token
export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ" });
    }
    req.user = decoded.userId; // Lưu id người dùng vào req.user
    console.log("✅User authenticated:", req.user); // Log thông tin người dùng đã xác thực
    next();
  });
};
