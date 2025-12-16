// src/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import checkFrontendOrigin from "./middlewares/checkFrontendOrigin.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
// ✅ Bật CORS TRƯỚC các route, Cho phép tất cả (hoặc chỉnh sửa cho phù hợp)
app.use(cors({
  origin: 'http://localhost:8080', // hoặc '*' nếu dev
  credentials: true,
}));

app.use(express.json()); // 👈 bắt buộc để req.body có dữ liệu
app.use(cookieParser()); // 👈 để đọc cookie từ request
// ✅ Bật cookie-parser để đọc cookie từ request
// ✅ Bật dotenv để sử dụng biến môi trường từ file .env
// ✅ Bật express.json() để parse JSON body từ request
// ✅ Bật express.static() để phục vụ file tĩnh từ thư mục public
// ✅ Bật express.urlencoded() để parse URL-encoded body từ request
// ✅ Bật express.Router() để định nghĩa các route
cors({origin: 'http://localhost:8080', credentials: true}); // Cho phép CORS từ frontend

// ✅ Bật middleware kiểm tra nguồn gốc của frontend cho ảnh avatar
app.use("/uploads", checkFrontendOrigin, express.static("public/uploads"));

// 🚀 Định nghĩa route đăng nhập/đăng ký
app.use("/api/auth", authRoutes);
// 🚀 Định nghĩa route sản phẩm
app.use("/api/products", productRoutes);
// Route xử lí dành cho nggười dùng
app.use("/api/users", userRoutes);

export default app;
