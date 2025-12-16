// src/utils/validateFields.js

const fieldSettings = [
  { id: "user", pattern: /^(?:\d{8,16}|[^\s@]+@[^\s@]+\.[^\s@]+)$/, min: 8 }, // User đăng nhập: có thể là số điện thoại (8-16 ký tự) hoặc email hợp lệ
  { id: "password", pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/, min: 8 }, // Mật khẩu: ít nhất 8 ký tự, có chữ thường, chữ hoa, số và ký tự đặc biệt
  { id: "username", pattern: /^(?=.*[a-z])(?=.*[A-Z]).{5,}$/, min: 5 }, // Tên người dùng: ít nhất 5 ký tự, có chữ thường và chữ hoa
  { id: "email", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, min: 1 }, // Email: định dạng email hợp lệ là có ít nhất một ký tự trước và sau dấu @, và có dấu chấm sau dấu @
  { id: "phone", pattern: /^(?=.*[0-9]).{8,16}$/, min: 8 }, // Số điện thoại: ít nhất 8 ký tự, chỉ chứa số
  { id: "birthday", pattern: /^(\d{4}-\d{2}-\d{2}|(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4})$/, min: 1 }, // Ngày sinh: định dạng YYYY-MM-DD hoặc DD/MM/YYYY
  { id: "gender", pattern: /^[a-zA-Z\u00C0-\u1EF9]{2,6}$/, min: 2 }, // Giới tính: ít nhất 2 ký tự, chỉ chứa chữ cái (bao gồm cả chữ có dấu)
];

export default fieldSettings;
