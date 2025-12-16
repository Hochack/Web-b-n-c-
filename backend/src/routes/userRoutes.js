// File: /src/routes/userRoutes.js
import express from "express";
import { getAddresses, addAddress } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // Middleware xác thực người dùng

const router = express.Router();

router.get("/addresses", authMiddleware, getAddresses);   // ✅ Lấy danh sách địa chỉ
router.post("/addresses", authMiddleware, addAddress);     // ✅ Thêm địa chỉ mới

export default router;
