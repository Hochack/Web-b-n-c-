// src/components/TopBar/index.jsx
import React, { useState, useRef, useEffect } from "react";
import "./TopBar.css";
import { MdOutlineConstruction } from "react-icons/md";
import { GiStonePile, GiSteelClaws } from "react-icons/gi";
import { FaCubes } from "react-icons/fa";
import AuthModal from "../AuthModal";
import logo from "../../assets/images/logo.png";
import { useAuth } from "../../context/AuthContext";
import { confirmBox } from "../../utils/message";
import ModalProduct from "../ProductModal"; // Import ModalProduct cần sử dụng
import { useNavigate } from "react-router-dom";

function TopBar({ loginButtonRef }) {
  const [menuOpen, setMenuOpen] = useState(false); // Trạng thái menu bên trái
  const [userMenuOpen, setUserMenuOpen] = useState(false); // Trạng thái menu người dùng
  const menuRef = useRef(null); // Tham chiếu đến menu bên trái
  const userMenuRef = useRef(null); // Tham chiếu đến menu người dùng
  const searchRef = useRef(null); // Tham chiếu đến ô tìm kiếm
  const [showMobileSearch, setShowMobileSearch] = useState(false); // Trạng thái ô tìm kiếm trên di động

  const { setUser, user } = useAuth(); // Lưu và Lấy thông tin người dùng từ context
  const [showProductModal, setShowProductModal] = useState(false); // Trạng thái hiển thị modal thêm sản phẩm
  // useEffect(() => {
  //   console.log("🔁 TopBar context updated, user:", user);
  // }, [user]);

  // console.log("User info:", user); // Log thông tin người dùng
  const goHome = () => (window.location.href = "/"); // Chuyển hướng về trang chủ
  const toggleMenu = () => setMenuOpen((prev) => !prev); // Hàm để mở/đóng menu bên trái
  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev); // Hàm để mở/đóng menu người dùng
  const [modalOpen, setModalOpen] = useState(false);

  // Ẩn menu khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false); // Ẩn menu bên trái
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false); // Ẩn menu người dùng
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowMobileSearch(false); // Ẩn ô tìm kiếm trên di động
    };
    document.addEventListener("mousedown", handler); // Thêm sự kiện click ngoài
    return () => document.removeEventListener("mousedown", handler); // Xoá sự kiện khi component unmount
  }, []);

  const logout = async () => {
    const ok = await confirmBox("Đăng xuất khỏi tài khoản của bạn?");
    if (!ok) return;
    // Hàm đăng xuất
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    window.location.reload();
  };

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Hàm xử lí tìm kiếm
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar__left">
          <div className="menu-btn" onClick={toggleMenu}>
            ☰
          </div>
          <img src={logo} alt="Trang chủ" className="logo" onClick={goHome} />
          <div className="home" onClick={goHome}>
            TrangChủ
          </div>
        </div>

        <div className="topbar__center">
          <div
            className={`search-container ${showMobileSearch ? "show" : ""}`}
            ref={searchRef}
          >
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{ display: showMobileSearch ? "block" : "" }}
            />
            <button
              className="search-btn"
              onClick={handleSearch}
              style={{ display: showMobileSearch ? "block" : "" }}
            >
              🔍
            </button>
          </div>
        </div>

        <div className="topbar__right">
          {!showMobileSearch && (
            <>
              {user && (user.role === "admin" || user.role === "vendor") && (
                <button
                  className="menu-btn add_btn"
                  onClick={() => setShowProductModal(true)}
                >
                  ➕
                </button>
              )}

              <button
                className="menu-btn search_btn"
                onClick={() => setShowMobileSearch(true)}
              >
                🔍
              </button>
              <button className="menu-btn shopping_btn">🛒</button>
              <button className="menu-btn notification_btn">🔔</button>
            </>
          )}
          {user ? (
            <button className="menu-btn usrename" onClick={toggleUserMenu}>
              <svg width="40" height="40" viewBox="0 0 40 40">
                <defs>
                  <path
                    id="circlePath"
                    d="M 20, 20 m -15, 0 a 15,15 0 1,1 30,0 a 15,15 0 1,1 -30,0"
                  />
                </defs>
                <text fontSize="8" fill="#000" className="rotating-text">
                  <textPath
                    href="#circlePath"
                    startOffset="30%"
                    textAnchor="middle"
                  >
                    {user.username}
                  </textPath>
                </text>
              </svg>
              <img src={`/uploads/avatars/${user.avatar}`} alt="avatar" />
            </button>
          ) : (
            <button
              popovertarget="modalLogin"
              className="menu-btn user_btn"
              ref={loginButtonRef}
            >
              👤
            </button>
          )}
          <AuthModal /> {/* Modal đăng nhập/đăng ký */}
        </div>
      </header>

      {menuOpen && (
        <nav className="side-menu open" ref={menuRef}>
          <div className="topbar__left">
            <button className="menu-btn" onClick={toggleMenu}>
              ☰
            </button>
            <img src={logo} alt="Trang chủ" className="logo" onClick={goHome} />
            <div className="home" onClick={goHome}>
              TrangChủ
            </div>
          </div>
          <ul>
            <h3>Danh mục</h3>
            <li>
              <MdOutlineConstruction /> Xi măng
            </li>
            <li>
              <GiStonePile /> Cát & Đá
            </li>
            <li>
              <GiSteelClaws /> Thép
            </li>
            <li>
              <FaCubes /> Gạch & Khối
            </li>
          </ul>
          {/* <h3></h3> */}
        </nav>
      )}

      {userMenuOpen && (
        <nav className="side-menu user-menu open" ref={userMenuRef}>
          <div className="topbar__left">
            <button className="menu-btn user-info" onClick={() => setModalOpen(true)}>
              <img
              src={`/uploads/avatars/${user.avatar}`}
              className="logo"
              alt="avatar"
            />
            <p>{user.username}</p>
            </button>
            <button className="menu-btn shopping_btn">🛒</button>
            <button className="menu-btn messenger">💬</button>
          </div>

          <h3></h3>
          <ul>
            {user?.role === "admin" || user?.role === "vendor" ? (
              <li>📊 Bảng điều khiển</li>
            ) : null}
            {user?.role === "customer" ? <li>📊 Đăng ký bán hàng</li> : null}
            <li>
              <ul className="sub-orders">
                <div className="main_controls">
                  🛍 Đơn mua
                  <div className="menu_btn" id="historyOrder">
                    📦 Lịch sử mua
                  </div>
                  <div className="menu_btn">📥 Chờ xác nhận</div>
                  <div className="menu_btn">📦 Chờ lấy hàng</div>
                  <div className="menu_btn">🚚 Chờ giao hàng</div>
                  <div className="menu_btn">⭐ Đánh giá</div>
                </div>
              </ul>
            </li>
            <li onClick={() => console.log('Logout')}>🚪 Đăng xuất</li>
          </ul>
        </nav>
      )}

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Thông tin cá nhân</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form>
              <label>Họ và tên:</label>
              <input type="text" name="fullname" />

              <label>Email:</label>
              <input type="email" name="email" />

              <label>Số điện thoại:</label>
              <input type="tel" name="phone" />

              <label>Giới tính:</label>
              <select name="gender">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>

              <label>Ngày sinh:</label>
              <input type="date" name="birthday" />

              <button type="submit">Lưu</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal thêm sản phẩm */}
      {showProductModal && (
        <ModalProduct onClose={() => setShowProductModal(false)} />
      )}
    </>
  );
}

export default TopBar;
