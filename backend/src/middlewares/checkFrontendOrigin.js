// src/middlewares/checkFrontendOrigin.js
// Middleware để kiểm tra nguồn gốc của frontend hay chặn các yêu cầu từ nguồn khác (Check Referer/Origin)
export default function checkFrontendOrigin(req, res, next) {
  const origin = req.get("Origin");
  const referer = req.get("Referer");

  const allowedOrigin = "http://localhost:8080"; // frontend

  if (
    (origin && origin.startsWith(allowedOrigin)) ||
    (referer && referer.startsWith(allowedOrigin))
  ) {
    return next();
  }

  return res.status(403).json({ message: "Access denied from external request." });
}
