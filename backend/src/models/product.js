import mongoose from "mongoose";

// Schema đánh giá (rating + optional comment)
const reviewSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, required: true }, // 1–5 sao
  reviewMedia: [String], // Mảng URL của hình ảnh/video đánh giá
  comment: { type: String }, // Bình luận đánh giá, có thể để trống
  replies: [
    {
      user: { type: String, ref: "User", required: true }, // ID người dùng trả lời
      text: { type: String, required: true }, // Nội dung trả lời, bắt buộc
      createdAt: { type: Date, default: Date.now }, // Ngày tạo trả lời, mặc định là hiện tại
    },
  ],
  createdAt: { type: Date, default: Date.now }, // Ngày tạo đánh giá, mặc định là hiện tại
});

// Schema sản phẩm
const productSchema = new mongoose.Schema(
  {
    _id: { type: String }, // custom ID: 'sp' + timestamp + suffix
    media: [String], // Mảng URL của hình ảnh/video
    name: { type: String, required: true }, // Tên sản phẩm, bắt buộc
    price: { type: Number, required: true }, // Giá sản phẩm, bắt buộc
    category: { type: String, required: true }, // Danh mục sản phẩm, bắt buộc
    userId: {
      type: String,
      ref: "User", // Tham chiếu đến mô hình user, có thể dùng populate("userId") để lấy thông tin shop
      required: true, // ID người dùng sở hữu sản phẩm, bắt buộc
    }, // ID người dùng sở hữu sản phẩm, bắt buộc
    views: { type: Number, default: 0 }, // Số lượt xem sản phẩm, mặc định là 0
    warehouse: { type: Number, required: true }, // Kho hàng, bắt buộc
    warranty: { type: String, required: true }, // Thông tin bảo hành, bắt buộc
    manufactureDate: { type: Date, required: true }, // Ngày sản xuất, bắt buộc
    manufacturer: { type: String, required: true }, // Thương hiệu/Tổ chức sản xuất
    description: { type: String, required: true }, // Mô tả sản phẩm, bắt buộc
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // ✅ Các trường mở rộng
    sold: { type: Number, default: 0 }, // Đã bán sản phẩm, mặc định là 0
    discount: {
      percentDiscount: {
        percent: { type: Number, min: 0, max: 100, default: 0 }, // Phần trăm giảm
        limitQuantity: { type: Number, default: 0 }, // Giới hạn số lượng được giảm, số lần mua sản phẩm
        usedCount: { type: Number, default: 0 }, // Số lần đã sử dụng và luôn nhỏ hơn hoặc bằng limitQuantity, khi bằng limitQuantity thì hết giảm giá
        startDate: { type: Date }, // Thời gian bắt đầu
        endDate: { type: Date }, // Thời gian kết thúc
      },
      codes: [
        {
          code: { type: String, required: true }, // Mã giảm giá, ví dụ: GIAM20 50K là giảm 20% tối đa 50000, GIAM20k là giảm 20000
          type: { type: String, enum: ["percent", "fixed"], required: true }, // Loại mã: phần trăm hoặc cố định
          value: { type: Number, required: true }, // Phần trăm (%) hoặc số tiền (VND), Ví dụ: 20 (%) hoặc 50000 (vnđ)
          maxDiscount: { type: Number, default: 0 }, // Với mã percent, giới hạn số tiền giảm
          usageLimit: { type: Number, default: 0 }, // Số lần mã được sử dụng tối đa
          usedCount: { type: Number, default: 0 }, // Số lần đã sử dụng và luôn nhỏ hơn hoặc bằng usageLimit, nếu bằng usageLimit thì mã hết hạn
          startDate: { type: Date, default: Date.now }, // Thời gian bắt đầu, mặc định là ngày tạo
          expiresAt: { type: Date }, // Thời gian hết hạn mã
        },
      ],
    },
    reviews: [reviewSchema], // Đánh giá sản phẩm
  },
  { _id: false } // Tắt trường _id mặc định vì đang sử dụng ID tùy chỉnh
);

export default mongoose.model("Product", productSchema);
