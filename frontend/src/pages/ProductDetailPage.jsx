// src/pages/ProductDetailPage.jsx
// Hiển thị thông tin chi tiết của một sản phẩm dựa trên `id` được lấy từ URL.
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom"; // ⬅️ Thêm useLocation
import ProductDetail from "../components/ProductDetail";
import apiRequest from "../service/apiFetch";

const ProductDetailPage = () => {
  const { id } = useParams(); // Lấy tham số `id` từ URL thông qua hook `useParams`
  const [product, setProduct] = useState(null); // Khởi tạo state `product` để lưu thông tin chi tiết sản phẩm
  const location = useLocation();
  const relatedProducts = location.state?.products || [];

  useEffect(() => {
    if (id) {
      window.scrollTo({ top: 0, behavior: "smooth" });// cuộn lên đầu trang
    }
    // Gọi API để lấy thông tin chi tiết sản phẩm khi component được render
    apiRequest({
      endpoint: `/products/${id}`, // Endpoint API với `id` của sản phẩm
      method: "GET", // Phương thức HTTP GET
      onSuccess: (data) => setProduct(data), // Cập nhật state `product` với dữ liệu trả về từ API
    });
  }, [id]); // Chỉ chạy lại effect khi `id` thay đổi

  if (!product) return <div>Đang tải...</div>; // Hiển thị thông báo "Đang tải..." khi dữ liệu chưa được tải xong

  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts} // ✅ truyền đúng vào đây
    />
  ); // Hiển thị component `ProductDetail` với dữ liệu sản phẩm
};

export default ProductDetailPage;
