// middlewares/upload.js
import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Thư mục upload (dưới public/uploads/product)
// const uploadDir = path.join("public", "uploads", "product");

// // Tạo thư mục nếu chưa có
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// Dùng memoryStorage để không lưu file ngay
const storage = multer.memoryStorage();

// Nếu bạn muốn chặn file lạ, có thể bật fileFilter
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|webm/;
//   const extname = allowedTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );
//   const mimetype = allowedTypes.test(file.mimetype);
//   if (extname && mimetype) return cb(null, true);
//   cb(new Error("File không hợp lệ!"));
// };

const upload = multer({
  storage,
  // fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB mỗi file
});

export default upload;
