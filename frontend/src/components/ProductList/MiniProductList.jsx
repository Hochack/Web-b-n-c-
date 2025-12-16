import React from "react";
import { useNavigate } from "react-router-dom";

const MiniProductList = ({ title, products, filterKey, onFilterClick }) => {
  const navigate = useNavigate();

  const handleClick = (productId) => {
    navigate(`/product/${productId}`, { state: { products } });
  };

  return (
    <div className="mini-product-section">
      <h4
        className="mini-title"
        onClick={() => onFilterClick(filterKey)}
        style={{ cursor: "pointer" }}
      >
        {title}
      </h4>
      <div className="mini-scroll-container">
        {products.map((product) => {
          const isVideo =
            typeof product.media === "string" && product.media.endsWith(".mp4");
          const discount =
            parseFloat(product.discount?.percentDiscount?.percent) || 0.1;
          const finalPrice =
            discount > 0
              ? Math.round(product.price * (1 - discount / 100))
              : product.price;

          return (
            <div
              key={product._id}
              className="mini-product-card"
              onClick={() => handleClick(product._id)}
            >
              <div className="mini-media">
                {isVideo ? (
                  <video
                    src={product.media}
                    className="mini-image"
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={product.media}
                    alt={product.name}
                    className="mini-image"
                    loading="lazy"
                  />
                )}
                {discount > 0 && (
                  <span className="product-badge mini discount right">
                    -{discount}%
                  </span>
                )}
                <span className="product-badge mini left">
                  {product.discount?.codes?.code && (
                    <span className="discount-code">{product.discount.codes.code}</span>
                  )}
                </span>
              </div>
              <p className="mini-name">{product.name}</p>
              <div className="info-price">
                <span className="price">{finalPrice.toLocaleString()} đ</span>
                <span className="sentFrom">{product.sentFrom}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniProductList;
