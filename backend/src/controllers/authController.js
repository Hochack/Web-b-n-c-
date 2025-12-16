// src/controllers/authController.js
import User from "../models/user.js";
import mongoose from 'mongoose';
import bcrypt from "bcrypt";
import fieldSettings from "../utils/fieldSettings.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Hàm validate
const validateFields = (data) => {
  const errors = [];

  for (const field of fieldSettings) {
    const value = data[field.id];
    if (typeof value !== "string" || value.trim().length < field.min) {
      errors.push(`${field.id} is too short`);
    } else if (field.pattern && !field.pattern.test(value)) {
      errors.push(`${field.id} is invalid`);
    }
  }

  return errors;
};

// Hàm tạo token
function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" } // Thời gian hết hạn token là 1h , hoặc 10 phút 
  );
}

// 📌 Hàm chuẩn hóa số điện thoại về dạng +84
function normalizePhone(phone) {
  if (phone.startsWith("+84")) return phone;
  if (phone.startsWith("0")) return "+84" + phone.slice(1);
  if (phone.startsWith("84")) return "+84" + phone.slice(2);
  return phone; // fallback nếu không đúng định dạng
}

//// Hàm đăng nhập người dùng
export const loginUser = async (req, res) => {
  try {
    const { user, password } = req.body;

    // console.log("Received login data:", req.body); // 👈 Log body nhận được

    // Kiểm tra user là email hay số điện thoại
    let query = {};

    if (user.includes("@")) {
      query = { email: user };
    } else {
      const normalizedPhone = normalizePhone(user);
      query = { phone: normalizedPhone };
    }

    const isUser = await User.findOne(query);

    if (!isUser) {
      return res.status(400).json({ message: "❌ Email hoặc số điện thoại không tồn tại" });
    }
    console.log("✅ Input password:", password);
    console.log("✅ Stored hash:", isUser.password);
    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, isUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "❌Mật khẩu không chính xác" });
    }

    // Tạo token
    const token = generateToken(isUser._id, isUser.role);
    const id = isUser._id; // Lấy _id từ user đã tìm thấy
    const username = isUser.username; // Lấy username từ user đã tìm thấy

    console.log("✅User logged in:", user); // 👈 Log user đã đăng nhập
    res.cookie("token", token, {
      httpOnly: true, // Bảo mật cookie, không cho phép truy cập từ client-side script
      secure: process.env.NODE_ENV === "production", // Chỉ gửi cookie qua HTTPS trong môi trường production
      sameSite: "Lax", // Ngăn chặn CSRF, hoặc 'Strict' nếu backend và frontend cùng domain
      maxAge: 24 * 60 * 60 * 1000, // Cookie hết hạn sau 24 giờ
    }).json({ message: "✅Login successful", id, username });

  } catch (err) {
    console.error("❌Error logging in user:", err); // 👈 Log lỗi
    res.status(500).json({ message: "❌Login failed", error: err.message });
  }
};

// Hàm đăng xuất người dùng
export const logoutUser = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    }).json({ message: "✅Logout successful" });
  } catch (err) {
    console.error("❌Error logging out user:", err); // 👈 Log lỗi
    res.status(500).json({ message: "❌Logout failed", error: err.message });
  }
};

// Hàm kiểm tra trạng thái đăng nhập từ cookie
export const getCurrentUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.userId).select("id username avatar role");

    if (!currentUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.json({
      id: currentUser._id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      role: currentUser.role
    });
  } catch (err) {
    console.error("❌Error verifying token:", err);
    res.status(403).json({ message: "Token không hợp lệ" });
  }
};

// Tạo tên shop duy nhất: Shop1, Shop2,...
async function generateUniqueShopName() {
  let counter = 1;
  let shopName;
  let exists;

  do {
    shopName = `Shop${counter}`;
    exists = await mongoose.models.User.findOne({ 'shop.shopName': shopName });
    counter++;
  } while (exists);

  return shopName;
}

//// Hàm đăng ký người dùng mới
export const registerUser = async (req, res) => {
  try {
    const {
      username, email, countryCode, phone, birthday, gender, password
    } = req.body;

    // Hàm loại bỏ dấu tiếng Việt
    const removeVietnameseTones = (str) => {
      return str
        .normalize("NFD") // chuyển ký tự có dấu thành tổ hợp: é => e + ́
        .replace(/[\u0300-\u036f]/g, "") // loại bỏ dấu
        .replace(/đ/g, "d") // thay thế chữ đ thành d
        .replace(/Đ/g, "d"); // thay thế chữ Đ thành D
    };
    // Chuẩn hóa username: chỉ chữ thường, loại bỏ khoảng trắng
    const cleanUsername = removeVietnameseTones(username.toLowerCase().replace(/\s+/g, ''));

    // Tạo _id duy nhất: username_cleaned + timestamp + random suffix
    const _id = `${cleanUsername}${Date.now()}${Math.random().toString(36).substring(2, 8)}`;

    // console.log("Received register data:", req.body); // 👈 Log body nhận được
    // console.log("📦 Raw body:", req.body);
    // console.log("📂 Content-Type:", req.headers['content-type']);
    // console.log("📄 Body is object:", typeof req.body);

    // Validate input fields (Kiểm tra tính hợp lệ của các trường)
    const validationErrors = validateFields(req.body);
    if (validationErrors.length > 0) {
      console.error("❌Validation errors:", validationErrors); // 👈 Log lỗi xác thực
      return res.status(400).json({ message: `❌Invalid input ${validationErrors}`, errors: validationErrors });
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      // console.error("❌Email already exists:", existingEmail); // 👈 Log email đã tồn tại
      return res.status(400).json({ message: "❌Email already exists" });
    }

    // Số điện thoại
    const isPhone = `${countryCode}${phone}`;
    // Kiểm tra số điện thoại đã tồn tại
    const existingPhone = await User.findOne({ phone: isPhone });
    if (existingPhone) {
      // console.error("❌Phone number already exists:", existingPhone); // 👈 Log số điện thoại đã tồn tại
      return res.status(400).json({ message: "❌Phone number already exists" });
    }

    // Tạo tên shop mặc định
    const shopName = await generateUniqueShopName();

    // mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      _id, // Sử dụng _id đã tạo
      username,
      email,
      phone: isPhone, // Lưu số điện thoại đã chuẩn hóa
      birthday,
      gender,
      password: hashedPassword,
      shop: {
        shopName: shopName
        // shopAvatars và shopCreatedAt sẽ tự động được set
      },
    });

    await user.save();
    console.log("✅User saved:", user); // 👈 Log user đã lưu
    res.status(201).json({ message: "✅User registered successfully!" });

  } catch (err) {
    console.error("❌Error saving user:", err); // 👈 Log lỗi
    res.status(500).json({ message: "❌Registration failed", error: err.message });
  }
};

