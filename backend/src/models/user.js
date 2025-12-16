// src/models/user.js
import mongoose from "mongoose";

// ✅ required: true Trường này bắt buộc phải có khi tạo hoặc lưu một tài liệu (document).
// ✅ unique: true Trường này phải có giá trị duy nhất trong toàn bộ tập hợp tài liệu (collection).

// Schema shop
const shopSchema = new mongoose.Schema({
  shopName: {
    type: String,
    unique: true,
    sparse: true
  },
  shopAvatars: { type: String, default: "/uploads/shopAvatars/shopAvatars.webp" },
  shopCreatedAt: { type: Date, default: Date.now },
}, { _id: false });

// Schema người dùng chứa thông tin đăng ký
const userSchema = new mongoose.Schema({
  // ID tùy chỉnh
  _id: { type: String, required: true, },
  // Tên người dùng, bắt buộc
  username: { type: String, required: true },
  // Email, bắt buộc và duy nhất
  email: { type: String, required: true, unique: true },
  // Số điện thoại là số và duy nhất, không bắt buộc
  phone: { type: Number, unique: true },
  // Ngày sinh
  birthday: Date,
  // Giới tính
  gender: String,
  // Mật khẩu (đã được mã hóa ở tầng xử lý)
  password: { type: String, required: true },
  // Thời điểm tạo tài khoản
  createdAt: { type: Date, default: Date.now },
  // Ảnh đại diện của người dùng
  avatar: { type: String, default: 'logo.png' }, // Đường dẫn đến ảnh đại diện
  // Trường shop - không bắt buộc, nhưng duy nhất nếu có
  shop: { type: shopSchema }, // 👈 sub-schema
  // Vai trò của người dùng (quản trị viên, người bán, người mua.)
  role: { type: String, enum: ['admin', 'Seller', 'customer'], default: 'customer' },
}, /* {
  // Vô hiệu hóa _id mặc định vì bạn đã định nghĩa riêng
  _id: false
} */);

export default mongoose.model("User", userSchema);
