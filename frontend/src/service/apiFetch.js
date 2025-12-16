// src/service/apiFetch.js

/**
 * Hàm gọi API dùng chung cho mọi method: GET, POST, PUT, DELETE.
 * Tự động xử lý JSON hoặc FormData, gửi cookie nếu cần.
 * 
 * @param {string} endpoint - Đường dẫn API, ví dụ: "/products"
 * @param {string} [method="POST"] - Phương thức HTTP: "GET", "POST", "PUT", "DELETE"
 * @param {Object|FormData|null} [data=null] - Dữ liệu gửi lên (object hoặc FormData)
 * @param {Function} [onSuccess=()=>{}] - Callback khi gọi API thành công
 * @param {Function} [onError=()=>{}] - Callback khi gọi API thất bại
 */
const apiRequest = async ({
  endpoint,
  method = "POST",
  data = null,
  onSuccess = () => {},
  onError = () => {},
}) => {
  try {
    const isFormData = data instanceof FormData;

    // Cấu hình request gửi lên server
    const config = {
      method,                  // Phương thức HTTP
      headers: {},             // Header (có thể thêm sau)
      credentials: "include",  // Gửi cookie (cho auth HTTP-only, CSRF, v.v.)
    };

    // Xử lý phần thân (body) nếu có dữ liệu
    if (data) {
      config.body = isFormData ? data : JSON.stringify(data);

      // Nếu không phải FormData và không phải GET thì thêm Content-Type
      if (!isFormData && method !== "GET") {
        config.headers["Content-Type"] = "application/json";
      }
    }

    // Gửi request tới API (mặc định sẽ gọi /api/endpoint)
    const response = await fetch(`/api${endpoint}`, config);

    // Parse kết quả trả về từ JSON
    const result = await response.json();

    // Xử lý theo kết quả phản hồi
    if (response.ok) {
      onSuccess(result);  // Thành công → gọi callback
    } else {
      onError(result.message || "Request failed"); // Lỗi có thông báo
    }
  } catch (error) {
    console.error(`❌ Lỗi khi gọi API [${method} ${endpoint}]:`, error);
    onError("Something went wrong"); // Lỗi hệ thống không rõ
  }
};

export default apiRequest;
