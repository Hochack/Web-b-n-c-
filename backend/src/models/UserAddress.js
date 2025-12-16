import mongoose from "mongoose";

const userAddressSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // Liên kết đến User._id
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true }, // Địa chỉ chi tiết
  street: { type: String }, // Tên đường, Tòa nhà, Số nhà, không bắt buộc
  districtId: { type: String }, // Thêm id quận huyện
  isDefault: { type: Boolean, default: false },// Địa chỉ mặc định
  isPickup: { type: Boolean, default: false }, // Địa chỉ lấy hàng
  isReturn: { type: Boolean, default: false }, // Địa chỉ trả hàng
  createdAt: { type: Date, default: Date.now }, // Thời điểm tạo địa chỉ
});

export default mongoose.model("UserAddress", userAddressSchema);
