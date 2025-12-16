import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema({
    keyword: String,
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    searchCount: { type: Number, default: 1 },
    viewCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    lastSearched: { type: Date, default: Date.now }
});

searchLogSchema.index({ keyword: 1, productId: 1 }, { unique: true });

export default mongoose.model("SearchLog", searchLogSchema);
