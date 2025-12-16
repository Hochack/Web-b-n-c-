// src/router/productRoutes.js
import express from "express";
import { searchProducts , getAllProducts, getNewestProducts, getFeaturedProducts, getBestSellingProducts, getProductsByCategory, saveProduct, addProductReview, getProductById } from "../controllers/productController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // Middleware xác thực người dùng
import upload from "../middlewares/upload.js"; // Middleware upload file

const router = express.Router();

router.get("/search", searchProducts); // 📌 /api/products/search?q=abc&category=Gạch&sortBy=price-desc
router.get("/", getAllProducts); // Lấy tất cả sản phẩm
router.get("/newest", getNewestProducts);  // Lấy sản phẩm mới nhất
router.get("/featured", getFeaturedProducts); // Lấy sản phẩm nổi bật
router.get("/bestSellers", getBestSellingProducts); // Lấy sản phẩm bán chạy
router.get("/category", getProductsByCategory); // Lấy sản phẩm theo danh mục
router.get("/:id", getProductById)

// ✅ Middleware xác thực áp dụng cho toàn bộ route trong productRoutes
router.use(authMiddleware);

// Các route bên dưới tự động được bảo vệ
router.post("/save",
    upload.fields([
      { name: "cover", maxCount: 1 },
      { name: "gallery", maxCount: 10 },
      { name: "video", maxCount: 1 }
    ]), // media là tên field upload, cho phép tối đa 15 file
    saveProduct); // Lưu sản phẩm mới
// router.post("/edit", editProduct);
// router.post("/delete", deleteProduct);
router.post("/reviews", addProductReview); // Chức năng đánh giá sản phẩm

export default router;
