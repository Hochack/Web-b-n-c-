const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js", // File khởi đầu, Dẫn tới file index.js ta đã tạo
  output: {
    filename: "bundle.js", // Tên file được build ra
    path: path.join(__dirname, "/build"), // Thư mục chứa file được build ra
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Sẽ sử dụng babel-loader xử lý cả .js và .jsx
        exclude: /node_modules/, // Loại trừ thư mục node_modules
        use: ["babel-loader"]
      },
      {
        test: /\.css$/, // Sử dụng style-loader, css-loader cho file .css
        use: ["style-loader", "css-loader"]
      },
      {
        test: /.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource', // xử lý ảnh
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],    // giúp Webpack hiểu các file đuôi .jsx
  },
  // Chứa các plugins sẽ cài đặt trong tương lai
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "public"), /* thư mục chứa các file tĩnh */
    },
    historyApiFallback: true, // ùng cho các ứng dụng SPA (Single Page Application) dùng routing phía client (như React Router). Khi bạn truy cập URL như /about, nếu không có file vật lý tương ứng, server sẽ tự động trả về index.html để client router xử lý.
    compress: true, // Bật gzip nén response, giúp giảm dung lượng khi gửi file từ server tới trình duyệt. Tăng tốc độ tải trang
    port: 8080, // Cổng mà Webpack Dev Server sẽ lắng nghe
    hot: true, // Bật tính năng Hot Module Replacement (HMR), cho phép cập nhật module mà không cần tải lại toàn bộ trang
    liveReload: true, // Đảm bảo reload toàn trang khi HMR fail

    // ✅ Cấu hình proxy:
    // proxy: [
    //   {
    //     context: ["/api", "/uploads"], // Proxy tất cả các yêu cầu đến /api, /uploads tới backend
    //     target: "http://localhost:5000", // Địa chỉ backend, có thể là IP hoặc localhost
    //     secure: false, // Tắt kiểm tra SSL, cần thiết nếu backend không dùng HTTPS
    //     changeOrigin: true,
    //   },
      // { 
      //   context: ["/uploads"], // Proxy tải proxy ảnh avatar từ backend
      //   target: "http://localhost:5000",
      //   changeOrigin: true,
      // }
    // ],
  },
};
