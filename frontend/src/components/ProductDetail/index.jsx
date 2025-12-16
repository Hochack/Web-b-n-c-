// File:/src/components/ProductDetail/index.jsx
import React, { useState } from "react";
import ProductList from "../ProductList"; // Dùng lại để hiển thị sản phẩm liên quan
import { useNavigate } from "react-router-dom";
import "./ProductDetail.css";

const ProductDetail = ({ product, relatedProducts = [] }) => {
  if (!product) return <div>Đang tải...</div>;

  // 🔍 Ghi log dữ liệu truyền vào để debug
  // console.log("🔍 Tổng số sản phẩm truyền vào:", relatedProducts);
  // console.log("📦 Sản phẩm hiện tại:", product);

  const discount = parseFloat(product.discount?.percent) || 0;
  const discountCode = product.discount?.code || null;
  const finalPrice =
    discount > 0
      ? Math.round(product.price * (1 - discount / 100))
      : product.price;

  const mediaList = Array.isArray(product.media)
    ? product.media
    : [product.media];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentMedia = mediaList[selectedIndex];
  const [quantity, setQuantity] = useState(1);

  const prevMedia = () => {
    setSelectedIndex(
      (prev) => (prev - 1 + mediaList.length) % mediaList.length
    );
  };

  const nextMedia = () => {
    setSelectedIndex((prev) => (prev + 1) % mediaList.length);
  };

  const shop = product.owner?.shop;

  // 🔍 Chia nhóm sản phẩm liên quan (được truyền từ ProductList)
  // 🔍 Chuẩn hóa danh mục thành mảng các tag
  const normalizeCategories = (input) =>
    String(input || "")
      .toLowerCase()
      .split(/[,&]/) // Tách bằng dấu phẩy hoặc &
      .map((s) => s.trim())
      .filter(Boolean); // Bỏ rỗng

  const currentTags = normalizeCategories(product.category); // → ['vật liệu xây dựng', 'xi măng']

  const relatedByCategory = relatedProducts.filter((p) => {
    const tags = normalizeCategories(p.category);
    // console.log(`📁 Danh mục sản phẩm: ${p.name}`, tags);
    return tags.some((tag) => currentTags.includes(tag));
  });

  const nameKeyword = product.name?.split(" ")[0]?.toLowerCase() || "";
  const relatedByName = relatedProducts.filter((p) =>
    p.name?.toLowerCase().startsWith(nameKeyword)
  );

  const popularProducts = relatedProducts
    .filter((p) => !relatedByCategory.includes(p) && !relatedByName.includes(p))
    .sort((a, b) => (parseInt(b.sold) || 0) - (parseInt(a.sold) || 0));
  // console.log("🔎 Tags hiện tại:", currentTags);
  // console.log("🧱 Danh sách liên quan cùng danh mục:", relatedByCategory);

  // Xử lí nút "Mua ngay"
  const navigate = useNavigate();

  const handleBuyNow = () => {
    navigate("/checkout", {
      state: { product, quantity },
    });
  };

  return (
    <div className="product-detail-wrapper">
      <div className="product-detail-content">
        {/* Media Preview */}
        <div className="product-media">
          <div className="media-display">
            {currentMedia?.endsWith(".mp4") ? (
              <video src={currentMedia} controls loop className="media" />
            ) : (
              <img
                src={currentMedia}
                alt="media"
                className="media"
                onError={(e) => (e.target.src = "/default-product.jpg")}
              />
            )}
            {mediaList.length > 1 && (
              <>
                <button className="media-nav-btn left" onClick={prevMedia}>
                  ←
                </button>
                <button className="media-nav-btn right" onClick={nextMedia}>
                  →
                </button>
              </>
            )}
          </div>
          <div className="media-thumbnails">
            {mediaList.map((url, idx) =>
              url?.endsWith(".mp4") ? (
                <video
                  key={idx}
                  src={url}
                  className={`thumbnail ${
                    idx === selectedIndex ? "selected" : ""
                  }`}
                  onClick={() => setSelectedIndex(idx)}
                />
              ) : (
                <img
                  key={idx}
                  src={url}
                  alt={`thumb-${idx}`}
                  className={`thumbnail ${
                    idx === selectedIndex ? "selected" : ""
                  }`}
                  onClick={() => setSelectedIndex(idx)}
                  onError={(e) => (e.target.src = "/default-product.jpg")}
                />
              )
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info-right">
          <h2>{product.name}</h2>
          <div className="price-group">
            <span className="final-price">{finalPrice.toLocaleString()} đ</span>
            {discount > 0 && (
              <>
                <span className="original-price">
                  {product.price.toLocaleString()} đ
                </span>
                <span className="discount-code">Mã giảm: {discountCode}</span>
              </>
            )}
          </div>

          <div className="quantity-input">
            <label>Số Lượng</label>
            <div className="quantity-control">
              <button
                className="quantity-btn"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={product.warehouse}
                value={quantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val)) {
                    setQuantity(Math.min(product.warehouse, Math.max(1, val)));
                  }
                }}
              />
              <button
                className="quantity-btn"
                onClick={() =>
                  setQuantity((prev) => Math.min(product.warehouse, prev + 1))
                }
                disabled={quantity >= product.warehouse}
              >
                +
              </button>
            </div>
            <span className="available-stock">
              {product.warehouse} sản phẩm có sẵn
            </span>
          </div>

          <div className="button-group">
            <button className="btn-add-cart">🛒 Thêm vào giỏ</button>
            <button className="btn-buy-now" onClick={handleBuyNow}>
              💰 Mua ngay
            </button>
          </div>
        </div>
      </div>

      <hr />

      {/* Shop Info */}
      <div className="shop-info">
        <img
          src={shop?.shopAvatars || "/default-shop.jpg"}
          alt="shop"
          className="shop-avatar"
        />
        <div className="shop-meta">
          <h3>{shop?.shopName || "Không rõ"}</h3>
          <p>
            Tham gia{" "}
            {shop?.shopCreatedAt
              ? new Date(shop.shopCreatedAt).toLocaleDateString()
              : "Không rõ"}
          </p>
        </div>
      </div>

      <hr />

      {/* Product Specs */}
      <div className="product-specs">
        <h4>CHI TIẾT SẢN PHẨM</h4>
        <ul>
          <li>
            Danh mục:{" "}
            {Array.isArray(product.category)
              ? product.category.join(", ")
              : product.category || "Không rõ"}
          </li>
          <li>Đã bán: {product.sold}</li>
          <li>Kho: {product.warehouse}</li>
          <li>Bảo hành: {product.warranty || "Không rõ"}</li>
          <li>Ngày sản xuất: {product.manufactureDate}</li>
          <li>Công ty chịu trách nhiệm: {product.manufacturer}</li>
          <li>Địa chỉ công ty: {product.manufacturerAddress || "Không rõ"}</li>
          <li>Gửi từ: {product.sentFrom || "Không rõ"}</li>
        </ul>
      </div>

      <hr />

      {/* Description */}
      <div className="product-description">
        <h4>MÔ TẢ SẢN PHẨM</h4>
        <p style={{ whiteSpace: "pre-line" }}>
          {product.description || "Chưa có mô tả."}
        </p>
      </div>

      {/* 📌 Các sản phẩm liên quan */}
      <div className="related-products">
        {/* 🧱 Cùng danh mục */}
        {relatedByCategory.length > 0 && (
          <ProductList
            title="🧱 Có thể bạn sẽ thích"
            products={relatedByCategory}
            showCategory={false}
          />
        )}

        {/* 🔍 Có tên gần giống */}
        {relatedByName.length > 0 && (
          <ProductList
            title="🔍 Các sản phẩm liên quan"
            products={relatedByName}
            showCategory={false}
          />
        )}

        {/* 🔥 Phổ biến khác theo số lượng đã bán */}
        {popularProducts.length > 0 && (
          <ProductList
            title="🔥 Phổ biến"
            products={popularProducts}
            showCategory={false}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
