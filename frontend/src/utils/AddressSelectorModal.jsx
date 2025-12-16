// src/utils/AddressSelector.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import vietnamProvinces from "../data/vietnamProvinces";
import "./AddressSelector.css";

let globalResolve = null;

export const AddressSelectorModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [detail, setDetail] = useState("");

  const [showProvinceSuggestions, setShowProvinceSuggestions] = useState(false);
  const [showDistrictSuggestions, setShowDistrictSuggestions] = useState(false);

  const wrapperProvinceRef = useRef(null);
  const wrapperDistrictRef = useRef(null);

  const districts =
    vietnamProvinces.find((p) => p.name === province)?.districts || [];

  const open = useCallback(() => {
    return new Promise((resolve) => {
      globalResolve = resolve;
      setProvince("");
      setDistrict("");
      setWard("");
      setDetail("");
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    const full = `${detail}, ${ward}, ${district}, ${province}`;
    setIsOpen(false);
    globalResolve?.(full);
  };

  // ✅ Lọc danh sách tỉnh duy nhất và sort giảm dần
  const filteredProvinces = Array.from(
    new Map(
      vietnamProvinces
        .filter((p) => p.name.toLowerCase().includes(province.toLowerCase()))
        .map((p) => [p.name, p])
    ).values()
  ).sort((a, b) => b.name.localeCompare(a.name));

  // ✅ Lọc danh sách quận/huyện từ tỉnh đã chọn
  const filteredDistricts = Array.from(
    new Set(
      districts.filter((d) =>
        d.toLowerCase().includes(district.toLowerCase())
      )
    )
  ).sort((a, b) => b.localeCompare(a));

  // ✅ Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperProvinceRef.current &&
        !wrapperProvinceRef.current.contains(event.target)
      ) {
        setShowProvinceSuggestions(false);
      }
      if (
        wrapperDistrictRef.current &&
        !wrapperDistrictRef.current.contains(event.target)
      ) {
        setShowDistrictSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ================= Modal UI ==================
  const ModalUI = isOpen ? (
    <div className="address-modal">
      <div className="modal-content">
        <h3>Chọn địa chỉ</h3>

        {/* ==== Tỉnh/Thành phố ==== */}
        <div
          className="container-input address-input custom-select"
          style={{ position: "relative" }}
          ref={wrapperProvinceRef}
        >
          <label className="custom-label">Tỉnh/Thành phố*</label>
          <input
            type="text"
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setShowProvinceSuggestions(true);
              setDistrict("");
              setWard("");
              setDetail("");
            }}
            onFocus={() => setShowProvinceSuggestions(true)}
            placeholder="Nhập tên Tỉnh/Thành phố"
            autoComplete="off"
            style={{
              width: "100%",
              padding: "8px 32px 8px 8px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
          <span className="icon">
            <i>🏙️</i>
          </span>
          {showProvinceSuggestions && (
            <ul className="suggestion-dropdown">
              {filteredProvinces.map((p) => (
                <li
                  key={p.name}
                  onClick={() => {
                    setProvince(p.name);
                    setShowProvinceSuggestions(false);
                    setDistrict("");
                    setWard("");
                    setDetail("");
                  }}
                >
                  {p.name}
                </li>
              ))}
              {filteredProvinces.length === 0 && <li>Không tìm thấy</li>}
            </ul>
          )}
        </div>

        {/* ==== Quận/Huyện ==== */}
        {province && (
          <div
            className="container-input address-input custom-select"
            style={{ position: "relative" }}
            ref={wrapperDistrictRef}
          >
            <label className="custom-label">Quận/Huyện*</label>
            <input
              type="text"
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setShowDistrictSuggestions(true);
                setWard("");
                setDetail("");
              }}
              onFocus={() => setShowDistrictSuggestions(true)}
              placeholder="Nhập tên Quận/Huyện"
              autoComplete="off"
              style={{
                width: "100%",
                padding: "8px 32px 8px 8px",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
            <span className="icon">
              <i>🏘️</i>
            </span>
            {showDistrictSuggestions && (
              <ul className="suggestion-dropdown">
                {filteredDistricts.map((d) => (
                  <li
                    key={d}
                    onClick={() => {
                      setDistrict(d);
                      setShowDistrictSuggestions(false);
                      setWard("");
                      setDetail("");
                    }}
                  >
                    {d}
                  </li>
                ))}
                {filteredDistricts.length === 0 && <li>Không tìm thấy</li>}
              </ul>
            )}
          </div>
        )}

        {/* ==== Xã/Phường ==== */}
        {district && (
          <div className="container-input address-input">
            <input
              type="text"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder=" "
            />
            <label>Xã/Phường*</label>
            <span className="icon">
              <i>🏡</i>
            </span>
          </div>
        )}

        {/* ==== Số nhà, đường ==== */}
        {ward && (
          <div className="container-input address-input">
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder=" "
            />
            <label>Số nhà, đường*</label>
            <span className="icon">
              <i>📦</i>
            </span>
          </div>
        )}

        {/* ==== Nút bấm ==== */}
        <div className="modal-buttons">
          <button onClick={() => setIsOpen(false)}>Hủy</button>
          <button
            onClick={handleConfirm}
            disabled={!province || !district || !ward || !detail}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // ================= Return Hook ==================
  return {
    open,
    render: ModalUI,
  };
};

export default AddressSelectorModal;
