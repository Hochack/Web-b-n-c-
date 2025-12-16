// src/components/AuthModal/RegisterForm.jsx
import React, { useEffect, useState, useRef } from "react";
import fieldSettings from "../../utils/validateFields";
import { messages, showSpotMessage } from "../../utils/message";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import apiFetch from "../../service/apiFetch";

const RegisterForm = ({ switchToLogin, switchToForgot }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    countryCode: "+84",
    phone: "",
    birthday: "",
    gender: "",
    password: "",
    repassword: "",
    captcha: "",
  });

  const [valid, setValid] = useState({
    username: null,
    email: null,
    phone: null,
    birthday: null,
    gender: null,
    password: null,
    repassword: null,
    captcha: null,
  });

  const [isHovering, setIsHovering] =
    useState(false); /* state Trạng thái cho mật khẩu  */
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const captchaImageRef = useRef(null);

  const generateCaptcha = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const generateCaptchaSVG = (text) => {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="60">
        <text x="10" y="40" font-size="30" fill="black">${text}</text>
        <line x1="10" y1="30" x2="105" y2="30" stroke="red" stroke-width="2" />
        <line x1="10" y1="20" x2="100" y2="40" stroke="blue" stroke-width="1" />
        <line x1="20" y1="40" x2="105" y2="20" stroke="green" stroke-width="1" />
      </svg>
    `)}`;
  };

  const refreshCaptcha = () => {
    const newCode = generateCaptcha();
    setCaptchaCode(newCode);
    if (captchaImageRef.current) {
      captchaImageRef.current.src = generateCaptchaSVG(newCode);
    }
    setForm((f) => ({ ...f, captcha: "" }));
    setValid((v) => ({ ...v, captcha: null }));
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const validateField = (id, value) => {
    const rule = fieldSettings.find(
      (f) => f.id === id || (id === "password" && f.id === "password")
    );
    if (!rule) return true;
    return rule.pattern ? rule.pattern.test(value) : true;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));

    if (id === "captcha") {
      if (value === "") {
        setValid((prev) => ({ ...prev, captcha: null }));
      } else {
        const isValid = value === captchaCode;
        setValid((prev) => ({ ...prev, captcha: isValid }));
        if (!isValid) showSpotMessage({ id }, false);
      }
    } else if (id === "repassword") {
      const isValid =
        value === form.password && validateField("password", form.password);
      setValid((prev) => ({ ...prev, repassword: isValid }));
      if (!isValid) showSpotMessage({ id }, false);
    } else {
      const isValid = validateField(id, value);
      setValid((prev) => ({ ...prev, [id]: isValid }));
      if (!isValid) showSpotMessage({ id }, false);
    }
  };

  // Hàm xử lý thay đổi mã quốc gia
  const [countryCode, setCountryCode] = useState("+84");

  const handleCountryCodeChange = (e) => {
    const code = e.target.value;
    setCountryCode(code);

    // Cập nhật số điện thoại đầy đủ nếu người dùng đã nhập
    const rawPhone = form.phone.replace(/^\+\d+/, ""); // loại mã cũ
    const fullPhone = code + rawPhone;
    setForm((f) => ({ ...f, phone: fullPhone }));
  };

  // lịch
  const [birthdayDate, setBirthdayDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (date) => {
    setBirthdayDate(date);
    const formatted = format(date, "yyyy-MM-dd");
    setForm((f) => ({ ...f, birthday: formatted }));
    setValid((v) => ({ ...v, birthday: true }));
    setShowDatePicker(false); // ẩn lại lịch sau khi chọn
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    apiFetch({
      endpoint: "/auth/register",
      data: form,
      onSuccess: (result) => {
        messages(result.message);
        // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
        switchToLogin();
      },
      onError: (msg) => messages(msg),
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="container-input input-username">
          <span
            className={`check ${
              valid.username === false
                ? "invalid"
                : valid.username
                ? "valid"
                : ""
            }`}
          />
          <input
            type="text"
            id="username"
            placeholder=" "
            required
            value={form.username}
            onChange={handleChange}
          />
          <label htmlFor="username">Username</label>
          <span className="icon">
            <i>👤</i>
          </span>
        </div>

        <div className="container-input input-email">
          <span
            className={`check ${
              valid.email === false ? "invalid" : valid.email ? "valid" : ""
            }`}
          />
          <input
            type="text"
            id="email"
            placeholder="example@gmail.com"
            required
            value={form.email}
            onChange={handleChange}
          />
          <label htmlFor="email">Email</label>
          <span className="icon">
            <i>📧</i>
          </span>
        </div>

        <div className="container-input input-left input-phone">
          <span
            className={`check ${
              valid.phone === false ? "invalid" : valid.phone ? "valid" : ""
            }`}
          />
          {/* Select mã quốc gia */}
          <select
            id="country-code"
            name="country_code"
            className="form-select"
            value={countryCode}
            onChange={handleCountryCodeChange}
          >
            <option value="+84">+84</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+91">+91</option>
            <option value="+86">+86</option>
            {/* Thêm các mã khác nếu cần */}
          </select>

          {/* Input số điện thoại */}
          <input
            type="text"
            id="phone"
            placeholder="0123456789"
            required
            value={form.phone}
            onChange={handleChange}
          />
          <label htmlFor="phone">Phone</label>
          <span className="icon">
            <i>📞</i>
          </span>
        </div>

        <div className="container-input input-left input-birthday">
          <span
            className={`check ${
              valid.birthday === false
                ? "invalid"
                : valid.birthday
                ? "valid"
                : ""
            }`}
          />
          <span
            className="icon icons"
            onClick={() => setShowDatePicker((prev) => !prev)}
            style={{ cursor: "pointer" }}
          >
            📅
          </span>

          <input
            type="text"
            id="birthday"
            required
            value={form.birthday}
            onChange={handleChange}
            placeholder="YYYY-MM-DD or DD/MM/YYYY"
          />
          <label htmlFor="birthday">Birthday</label>
          <span className="icon">
            <i>🎂</i>
          </span>

          {showDatePicker && (
            <div style={{ position: "absolute", top: "100%", zIndex: 1000 }}>
              <DatePicker
                selected={birthdayDate}
                onChange={handleDateChange}
                inline // hiện trực tiếp lịch, không phải popup mặc định
              />
            </div>
          )}
        </div>

        <div className="container-input input-gender">
          <span
            className={`check ${
              valid.gender === false ? "invalid" : valid.gender ? "valid" : ""
            }`}
          />
          <input
            type="text"
            id="gender"
            placeholder=" "
            required
            value={form.gender}
            onChange={handleChange}
          />
          <label htmlFor="gender">Gender</label>
          <span className="icon">
            <i>⚧️</i>
          </span>
        </div>

        <div className="container-input input-left input-password">
          <span
            className={`check ${
              valid.password === false
                ? "invalid"
                : valid.password
                ? "valid"
                : ""
            }`}
          />
          <div
            className="icon icons"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => setShowPassword((s) => !s)}
          >
            <span
              className="svg-default"
              style={{
                display: showPassword || isHovering ? "none" : "inline",
              }}
            >
              👁️
            </span>
            <span
              className="svg-replacement"
              style={{
                display: showPassword || isHovering ? "inline" : "none",
              }}
            >
              🙈
            </span>
          </div>
          <input
            type={showPassword || isHovering ? "text" : "password"}
            id="password"
            placeholder=" "
            required
            value={form.password}
            onChange={handleChange}
          />
          <label htmlFor="password">Password</label>
          <span className="icon">
            <i>🔒</i>
          </span>
        </div>

        <div className="container-input input-left input-repassword">
          <span
            className={`check ${
              valid.repassword === false
                ? "invalid"
                : valid.repassword
                ? "valid"
                : ""
            }`}
          />
          <div
            className="icon icons"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => setShowPassword((s) => !s)}
          >
            <span
              className="svg-default"
              style={{
                display: showPassword || isHovering ? "none" : "inline",
              }}
            >
              👁️
            </span>
            <span
              className="svg-replacement"
              style={{
                display: showPassword || isHovering ? "inline" : "none",
              }}
            >
              🙈
            </span>
          </div>
          <input
            type={showPassword || isHovering ? "text" : "password"}
            id="repassword"
            placeholder=" "
            required
            value={form.repassword}
            onChange={handleChange}
          />
          <label htmlFor="repassword">Repassword</label>
          <span className="icon">
            <i>🔒</i>
          </span>
        </div>

        <div className="container-input input-left input-captcha">
          <span
            className={`check ${
              valid.captcha === false ? "invalid" : valid.captcha ? "valid" : ""
            }`}
          />
          <button
            className="menu_btn"
            id="refresh-captcha-btn"
            type="button"
            style={{ width: "24px", height: "24px", marginLeft: "5px" }}
            onClick={refreshCaptcha}
          >
            🔄
          </button>
          <input
            type="text"
            id="captcha"
            placeholder=" "
            required
            value={form.captcha}
            onChange={handleChange}
          />
          <label htmlFor="captcha">
            Captcha:{" "}
            <img
              ref={captchaImageRef}
              id="captchaImage"
              className="captcha-image"
              alt="captcha"
            />
          </label>
          <span className="icon">
            <i>🛡️</i>
          </span>
        </div>

        <div className="container-input input-submit">
          <input
            type="submit"
            value="Register"
            disabled={
              !(
                valid.username &&
                valid.email &&
                valid.phone &&
                valid.birthday &&
                valid.gender &&
                valid.password &&
                valid.repassword &&
                valid.captcha
              )
            }
          />
          <button
            type="button"
            className="forgotpassword"
            onClick={switchToForgot}
          >
            Forgot the password?
          </button>
          <button className="menu_btn" onClick={switchToLogin}>
            Login
          </button>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;
