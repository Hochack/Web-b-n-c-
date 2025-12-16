// File: /src/pages/CheckoutPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiRequest from "../service/apiFetch";
import AddressSelectorModal from "../utils/AddressSelectorModal";
import { useAuth } from "../context/AuthContext";
import { messages, showSpotMessage } from "../utils/message";
import fieldSettings from "../utils/validateFields";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isCheckingAuth } = useAuth();
  const { product, quantity = 1 } = state || {};

  const finalPrice = product?.discount?.percent
    ? Math.round(product.price * (1 - product.discount.percent / 100))
    : product?.price || 0;

  const [shippingMethod, setShippingMethod] = useState("normal");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressOptions, setShowAddressOptions] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [voucher, setVoucher] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Thanh toán khi nhận hàng");

  const addressModal = AddressSelectorModal();
  const modalRef = useRef(null);
  modalRef.current = addressModal;

  const shippingFees = {
    normal: 20000,
    express: 50000,
    bulky: 100000,
  };

  const shippingFee = shippingFees[shippingMethod];
  const totalPrice = finalPrice * quantity;
  const totalPayment = totalPrice + shippingFee;

  useEffect(() => {
    if (!product) {
      messages("Không tìm thấy sản phẩm để thanh toán", "error");
      navigate("/");
    }
  }, [product, navigate]);

  useEffect(() => {
    if (!isCheckingAuth && user === null) {
      messages("Vui lòng đăng nhập để tiếp tục thanh toán", "warning");
      document.querySelector("[popovertarget='modalLogin']")?.click();
    }
  }, [user, isCheckingAuth]);

  useEffect(() => {
    if (user) {
      apiRequest({
        endpoint: "/users/addresses",
        method: "GET",
        onSuccess: setAddresses,
      });
    }
  }, [user]);

  const handleAddAddress = async () => {
    const fullAddress = await modalRef.current.open();
    setShowInput(true);
    setSelectedAddress({ name: "", phone: "", fullAddress });
  };

  const handleSaveAddress = async () => {
    const nameRule = fieldSettings.find((f) => f.id === "username");
    const phoneRule = fieldSettings.find((f) => f.id === "phone");

    if (!nameRule.pattern.test(name)) {
      showSpotMessage({ id: "username" }, false);
      return;
    }
    if (!phoneRule.pattern.test(phone)) {
      showSpotMessage({ id: "phone" }, false);
      return;
    }

    await apiRequest({
      endpoint: "/users/addresses",
      method: "POST",
      body: { name, phone, fullAddress: selectedAddress.fullAddress },
    });

    const newAddress = { name, phone, fullAddress: selectedAddress.fullAddress };
    setAddresses([...addresses, newAddress]);
    setSelectedAddress(newAddress);
    setShowInput(false);
  };

  const handleApplyVoucher = () => {
    // Mock validate
    if (voucher === "GIAM10") {
      messages("Áp dụng voucher thành công: -10%", "success");
      setVoucherError("");
    } else {
      setVoucherError("Voucher không hợp lệ hoặc đã hết hạn.");
    }
  };

  if (!user || !product) return <div>Đang tải...</div>;

  return (
    <div className="checkout-container">
      <h2>Thanh toán</h2>

      {/* 🏠 Địa chỉ nhận hàng */}
      <section className="section">
        <h3>Địa chỉ nhận hàng</h3>
        {selectedAddress ? (
          <div
            className="selected-address-display"
            onClick={() => setShowAddressOptions((prev) => !prev)}
          >
            <strong>{selectedAddress.name}</strong> ({selectedAddress.phone})<br />
            {selectedAddress.fullAddress}
          </div>
        ) : (
          <button onClick={() => setShowAddressOptions(true)}>
            📍 Chọn địa chỉ nhận hàng
          </button>
        )}

        {showAddressOptions && (
          <>
            <ul className="address-list">
              {addresses.map((addr, idx) => (
                <li
                  key={idx}
                  className={addr === selectedAddress ? "selected" : ""}
                  onClick={() => {
                    setSelectedAddress(addr);
                    setShowAddressOptions(false);
                  }}
                >
                  <strong>{addr.name}</strong> ({addr.phone})<br />
                  {addr.fullAddress}
                </li>
              ))}
            </ul>
            <button onClick={handleAddAddress}>➕ Thêm địa chỉ mới</button>
          </>
        )}

        {showInput && selectedAddress && (
          <div className="new-address-form">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Họ và tên"
              className="input-username"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại"
              className="input-phone"
            />
            <p>{selectedAddress.fullAddress}</p>
            <button onClick={handleSaveAddress}>💾 Lưu địa chỉ</button>
          </div>
        )}
      </section>

      {/* 🏪 Sản phẩm */}
      <section className="section shop-section">
        <h3>Shop: {product.owner?.shop?.shopName || "Không rõ"}</h3>
        <div className="checkout-product">
          <div className="media">
            {product.media?.[0]?.endsWith(".mp4") ? (
              <video src={product.media[0]} width="80" controls />
            ) : (
              <img src={product.media?.[0]} alt={product.name} width="80" />
            )}
          </div>
          <div className="info">
            <div>{product.name}</div>
            <div>Giá: {finalPrice.toLocaleString()} đ</div>
            <div>Số lượng: x{quantity}</div>
          </div>
        </div>
      </section>

      {/* 💬 Ghi chú */}
      <section className="section">
        <h3>Lời nhắn cho shop</h3>
        <textarea placeholder="Nhập lời nhắn (nếu có)..." rows={3} />
      </section>

      {/* 🎫 Voucher */}
      <section className="section">
        <h3>Mã giảm giá</h3>
        <input
          type="text"
          value={voucher}
          onChange={(e) => setVoucher(e.target.value)}
          placeholder="Nhập mã giảm giá"
        />
        <button onClick={handleApplyVoucher}>Áp dụng</button>
        {voucherError && <p className="validation-error">{voucherError}</p>}
      </section>

      {/* 🚚 Vận chuyển */}
      <section className="section">
        <h3>Phương thức vận chuyển</h3>
        <select
          value={shippingMethod}
          onChange={(e) => setShippingMethod(e.target.value)}
        >
          <option value="normal">Nhanh (+20.000đ)</option>
          <option value="express">Hỏa tốc (+50.000đ)</option>
          <option value="bulky">Hàng cồng kềnh (+100.000đ)</option>
        </select>
      </section>

      {/* 💳 Thanh toán */}
      <section className="section">
        <h3>Phương thức thanh toán</h3>
        <p>
          {paymentMethod} <button onClick={() => messages("Chọn phương thức thanh toán sẽ hiển thị modal", "info")}>🔽</button>
        </p>
      </section>

      {/* 💰 Tổng tiền */}
      <section className="section total-box">
        <p>Tổng tiền hàng: {totalPrice.toLocaleString()} đ</p>
        <p>Phí vận chuyển: {shippingFee.toLocaleString()} đ</p>
        <p>Giảm giá: 0 đ</p>
        <hr />
        <h3>Tổng thanh toán: {totalPayment.toLocaleString()} đ</h3>
        <button className="btn-place-order">Đặt hàng</button>
      </section>

      {addressModal.render}
    </div>
  );
};

export default CheckoutPage;
