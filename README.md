# Web thương mại điện tử đồ cũ

Mô tả ngắn: ứng dụng fullstack (Node.js + Express backend, React frontend) để quản lý và bán hàng trong lĩnh vực xây dựng.

Thư mục chính:

- `backend/` - API server (Node.js, Express, Mongoose)
  - `server.js` - Entry point để khởi động server và kết nối MongoDB
  - `src/` - mã nguồn server (routes, controllers, models, middlewares, config)
  - `.env` - biến môi trường (không commit lên remote nếu chứa secrets)
    - `MONGO_URI` - URI kết nối MongoDB
    - `JWT_SECRET` - Khóa bí mật để sign JWT
    - `PORT` - (tùy chọn) cổng server (mặc định 5000)

- `frontend/` - React ứng dụng (webpack)
  - `src/` - mã nguồn React
  - `public/` - tài nguyên tĩnh
  - `webpack.config.js` - cấu hình dev server (mặc định lắng nghe trên port 8080 và proxy `/api` tới `http://localhost:5000`)

- `public/` - (nếu có) tài nguyên tĩnh dùng chung
- `package.json` (root) - script tiện lợi để khởi động cả frontend và backend cùng lúc

Yêu cầu tối thiểu

- Node.js >= 16 (khuyến nghị 18+)
- npm
- MongoDB instance (local hoặc Atlas). Nếu dùng Atlas, đảm bảo `MONGO_URI` trong `backend/.env` là chính xác.

Cách cài đặt và khởi chạy (PowerShell trên Windows)

1) Cài dependencies cho cả 3 nơi (root, backend, frontend)

```powershell
cd "D:\ICDingHoc\CN Web\Bán Hàng Trong Lĩnh Vực Xây Dựng"
npm install
cd .\backend
npm install
cd ..\frontend
npm install
```

2) Cấu hình biến môi trường

- Kiểm tra `backend/.env`. Nếu chưa có, tạo file `.env` trong `backend/` với các biến tối thiểu:

```
MONGO_URI=mongodb://<user>:<pass>@host:port/DatabaseName
JWT_SECRET=some-very-secret-value
PORT=5000
```

- Lưu ý: Không commit `.env` nếu chứa secret.

3) Khởi chạy ứng dụng (từ thư mục gốc)

```powershell
cd "D:\ICDingHoc\CN Web\Bán Hàng Trong Lĩnh Vực Xây Dựng"
npm start
```

- Điều này sẽ dùng `npm-run-all` để chạy song song frontend (webpack-dev-server trên `http://localhost:8080`) và backend (Express trên `http://localhost:5000`).

4) Truy cập

- Frontend: http://localhost:8080
- Backend API: http://localhost:5000 (ví dụ: http://localhost:5000/api/products)

## Deploy web
#Bước 1: Cài đặt công cụ (Chỉ làm 1 lần đầu tiên)
npm install -g firebase-tools

Lưu ý: nếu lỗi gõ "sudo" trước

firebase login

