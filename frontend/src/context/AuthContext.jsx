// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect  } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => { 
    // Tạo context để quản lý trạng thái đăng nhập
    // AuthProvider sẽ bao bọc các component cần truy cập trạng thái đăng nhập
    // với cung cấp hàm setUser để lưu hoặc cập nhật thông tin người dùng
    //và hàm useAuth để sử dụng context này trong các component con
const [user, setUser] = useState(undefined); // Ban đầu là undefined (chưa xác định)
const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Cờ kiểm tra

  useEffect(() => {
  fetch("/api/auth/me", { method: "GET", credentials: "include" })
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(setUser)
    .catch(() => setUser(null))
    .finally(() => setIsCheckingAuth(false)); // ✅ xác thực xong
}, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isCheckingAuth  }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
