// File: src/models/UserProfile.js
import mongoose from "mongoose";

// Địa chỉ giao hàng cụ thể của người dùng
const addressSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },        // Tên người nhận
        phone: { type: String, required: true },       // Số điện thoại
        fullAddress: { type: String, required: true }, // Địa chỉ chi tiết đã chọn (được tạo từ AddressSelector)
        isDefault: { type: Boolean, default: false },  // Có phải địa chỉ mặc định không?
    },
    { _id: false } // Không cần _id riêng cho mỗi địa chỉ
);

// Hồ sơ người dùng
const userProfileSchema = new mongoose.Schema(
    {
        user: {
            type: String,
            ref: "User",
            required: true,
            unique: true,
        },

        description: {
            type: String,
            default: "No description provided.",
        },

        // 🏠 Danh sách địa chỉ giao hàng
        addresses: {
            type: [addressSchema],
            default: [],
        },

        // 💻 Thông tin thiết bị đang đăng nhập
        deviceInfo: {
            type: {
                isAtive: { type: Boolean, default: true }, // Trạng thái hoạt động với true là đang hoạt động, false là không hoạt động
                os: { type: String, default: '' }, // Hệ điều hành
                browser: { type: String, default: '' }, // Trình duyệt
                deviceType: { type: String, default: '' }, // Loại thiết bị (desktop, mobile, tablet)
                ip: { type: String, default: '' }, // Địa chỉ IP
                lasstLogin: { type: Date, default: Date.now } // Thời điểm đăng nhập lần cuối
            },
            default: {}
        },
    },
    {
        collection: "user_profiles",
        timestamps: true,
    }
);

export default mongoose.model("UserProfile", userProfileSchema);
