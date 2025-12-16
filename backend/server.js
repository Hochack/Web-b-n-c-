// server.js
import app from './src/index.js';
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

// 🚀 Khởi chạy server và kết nối mongoosedb
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
});
