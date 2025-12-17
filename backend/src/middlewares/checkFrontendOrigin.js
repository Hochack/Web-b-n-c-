// src/middlewares/checkFrontendOrigin.js
// Kiểm soát CORS và chặn các yêu cầu không đến từ frontend hợp lệ

// Danh sách origin frontend được phép truy cập backend
const allowedOrigins = [
  "https://webappshop.onrender.com",
  "https://b-60172334-29682.web.app/",
  "https://silver-fortnight-97rq9p96p6pj3xvxq-8080.app.github.dev",
  "https://8080-firebase-b-1765957478125.cluster-d5vecjrg5rhlkrz6nm4jty7avc.cloudworkstations.dev",
  "http://localhost:8081",
  "http://localhost:8080",
];

function isAllowed(origin) {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

// Hàm dùng cho thư viện cors({ origin })
// Signature theo cors: (origin, callback) => void
export function corsOrigin(origin, callback) {
  // Cho phép các request không có Origin (ví dụ: curl, server-to-server)
  if (!origin) return callback(null, true);
  if (isAllowed(origin)) return callback(null, true);
  return callback(new Error("Not allowed by CORS"));
}

// Middleware Express để enforce nguồn gốc khi truy cập trực tiếp các route/static
export default function enforceFrontendOrigin(req, res, next) {
  const origin = req.get("Origin");
  const referer = req.get("Referer");

  // Lấy origin từ referer nếu có
  let refererOrigin = null;
  if (referer) {
    try {
      refererOrigin = new URL(referer).origin;
    } catch {}
  }

  const ok = isAllowed(origin) || isAllowed(refererOrigin);

  // Thiết lập header CORS cơ bản để trình duyệt hiểu phản hồi
  if (ok && (origin || refererOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || refererOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  if (req.method === "OPTIONS") return res.sendStatus(204);

  if (ok) return next();
  // Trả về lỗi giống Express default để ẩn thông tin backend
  return res.status(404).send(`Cannot ${req.method} ${req.path}`);
}
