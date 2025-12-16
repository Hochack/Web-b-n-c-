// src/routes/aythRoutes.js
import express from "express";
import { loginUser, registerUser, logoutUser, getCurrentUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser ); // Đăng nhập
router.post("/register", registerUser);// Đăng ký 
router.post("/logout", logoutUser); // Đăng xuất 
router.get("/me", getCurrentUser); // ✅ API kiểm tra login từ cookie

export default router;
