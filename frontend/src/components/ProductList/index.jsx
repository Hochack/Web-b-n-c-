// src/ProductList/index.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiRequest from "../../service/apiFetch";
import { defaultCategories } from "../../data/category";
import MiniProductList from "./MiniProductList";
import "./ProductList.css";

const productFilters = {
  newest: "/products/newest",
  featured: "/products/featured",
  bestSellers: "/products/bestSellers",
};

const ProductList = ({
  title,
  products: externalProducts,
  showCategory = true,
  isSearchPage,
}) => {
  const [products, setProducts] = useState(externalProducts || []);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const [miniNewest, setMiniNewest] = useState([]);
  const [miniFeatured, setMiniFeatured] = useState([]);
  const [miniBestSellers, setMiniBestSellers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const filterFromURL = query.get("filter");

  useEffect(() => {
    if (externalProducts) return;

    if (filterFromURL && productFilters[filterFromURL]) {
      fetchProductsByFilter(filterFromURL);
    } else {
      fetchAllProducts();
    }
  }, [externalProducts, filterFromURL]);

  useEffect(() => {
    if (!externalProducts && !filterFromURL) {
      fetchMini("/products/newest", setMiniNewest);
      fetchMini("/products/featured", setMiniFeatured);
      fetchMini("/products/bestSellers", setMiniBestSellers);
    }
  }, [externalProducts, filterFromURL]);

  const fetchAllProducts = () => {
    apiRequest({
      endpoint: "/products",
      method: "GET",
      onSuccess: (data) => {
        setProducts(data);
        setActiveFilter(null);
      },
      onError: (errMsg) => setError(errMsg),
    });
  };

  const fetchProductsByFilter = (filterKey) => {
    const endpoint = productFilters[filterKey];
    if (!endpoint) return;

    apiRequest({
      endpoint,
      method: "GET",
      onSuccess: (data) => {
        setProducts(data);
        setActiveFilter(filterKey);
        setSelectedCategory(null);
        navigate(`?filter=${filterKey}`);
      },
      onError: (errMsg) => setError(errMsg),
    });
  };

  const fetchProductsByCategory = (category) => {
    apiRequest({
      endpoint: `/products/category?category=${encodeURIComponent(category)}`,
      method: "GET",
      onSuccess: (data) => {
        setProducts(data);
        setSelectedCategory(category);
        setActiveFilter(null);
        navigate(`?category=${encodeURIComponent(category)}`);
      },
      onError: (errMsg) => setError(errMsg),
    });
  };

  const handleClick = (productId) => {
    navigate(`/product/${productId}`, { state: { products } });
  };

  const fetchMini = (endpoint, setter) => {
    apiRequest({
      endpoint,
      method: "GET",
      onSuccess: (data) => setter(data),
      onError: (err) => console.warn("Mini list error:", err),
    });
  };

  // Cập nhật lại kết quả tìm kiếm
  useEffect(() => {
    if (externalProducts) {
      setProducts(externalProducts);
    }
  }, [externalProducts]);

  return (
    <div className="product-list">
      {title && <h3 className="product-list-title">{title}</h3>}
      {error && <p className="error">{error}</p>}

      {!isSearchPage && (
        <>
          {/* Danh mục sản phẩm */}
          {showCategory && !activeFilter && (
            <div className="main_controls">
              {defaultCategories.map((cat) => (
                <button
                  key={cat}
                  className={`menu_btn ${
                    selectedCategory === cat ? "active" : ""
                  }`}
                  onClick={() => fetchProductsByCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Mini list khi chưa chọn danh mục hoặc bộ lọc */}
          {showCategory && !activeFilter && !selectedCategory && (
            <>
              <MiniProductList
                title="🆕 Hàng hóa mới nhất"
                products={miniNewest}
                filterKey="newest"
                onFilterClick={fetchProductsByFilter}
              />
              <MiniProductList
                title="🔥 Sản phẩm bán chạy"
                products={miniFeatured}
                filterKey="featured"
                onFilterClick={fetchProductsByFilter}
              />
              <MiniProductList
                title="⭐ Sản phẩm nổi bật"
                products={miniBestSellers}
                filterKey="bestSellers"
                onFilterClick={fetchProductsByFilter}
              />
            </>
          )}

          {/* 🆕 Hàng hóa mới nhất + 🔥 Sản phẩm bán chạy + ⭐ Sản phẩm nổi bật*/}
          {!isSearchPage && showCategory && !selectedCategory && (
            <div className="main_controls">
              <button
                className={`menu_btn ${
                  activeFilter === "newest" ? "active" : ""
                }`}
                onClick={() => fetchProductsByFilter("newest")}
              >
                🆕 Hàng hóa mới nhất
              </button>
              <button
                className={`menu_btn ${
                  activeFilter === "featured" ? "active" : ""
                }`}
                onClick={() => fetchProductsByFilter("featured")}
              >
                🔥 Sản phẩm bán chạy
              </button>
              <button
                className={`menu_btn ${
                  activeFilter === "bestSellers" ? "active" : ""
                }`}
                onClick={() => fetchProductsByFilter("bestSellers")}
              >
                ⭐ Sản phẩm nổi bật
              </button>
            </div>
          )}
        </>
      )}

      {/* Danh sách sản phẩm chính */}
      <div className="product-grid">
        {products.map((product) => {
          const isVideo =
            typeof product.media === "string" && product.media.endsWith(".mp4");
          const discount = parseFloat(product.discount?.percentDiscount?.percent) || 2;
          const finalPrice =
            discount > 0
              ? Math.round(product.price * (1 - discount / 100))
              : product.price;

          return (
            <div
              key={product._id}
              className="product-card"
              onClick={() => handleClick(product._id)}
            >
              <div className="product-media">
                {isVideo ? (
                  <video
                    src={product.media}
                    className="product-image"
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={product.media}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                  />
                )}
                {discount > 0 && (
                  <span className="product-badge discount right">-{discount}%</span>
                )}
                <span className="product-badge left">{product.sold}/{product.warehouse}</span>
              </div>
              <div className="product-infos">
                <h4 className="product-name">{product.name}</h4>
                <div className="info-meta">
                  {product.discount?.codes?.code && (
                    <span className="discount-code">{product.discount.codes.code}</span>
                  )}
                  <div className="shop">
                    <img
                      src={product.shop.avatar}
                      alt={product.shop.name}
                      className="shop-avatar"
                    />
                    <span>{product.shop.name}</span>
                  </div>
                </div>
                <div className="info-price">
                  <span className="price">{finalPrice.toLocaleString()} đ</span>
                  <span className="sentFrom">{product.sentFrom}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
