// src/components/AuthModal/LoginForm.jsx
import React, { useEffect, useState, useRef } from "react";
import fieldSettings from "../../utils/validateFields";
import { messages, showSpotMessage } from "../../utils/message";
import apiFetch from "../../service/apiFetch";

const LoginForm = ({ switchToForgot, switchToRegister }) => {
  const [form, setForm] = useState({ user: "", password: "", captcha: "" });
  const [valid, setValid] = useState({
    user: null,
    password: null,
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
      (f) => f.id === id || (id === "password" && f.id === "passwords")
    );
    if (!rule) return true; // Nếu không có pattern thì chấp nhận luôn
    if (rule.pattern) return rule.pattern.test(value);
    return true;
  };

  const handleChange = (e) => {
    // Hàm xử lý thay đổi input
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));

    if (id === "captcha") {
      if (value === "") {
        setValid((prev) => ({ ...prev, captcha: null }));
      } else {
        const isValid = value === captchaCode;
        setValid((prev) => ({
          ...prev,
          captcha: value === captchaCode,
          isValid,
        }));
        if (!isValid) showSpotMessage({ id }, false);
      }
    } else {
      const isValid = validateField(id, value);
      setValid((prev) => ({
        ...prev,
        [id]: validateField(id, value),
      }));
      if (!isValid) showSpotMessage({ id }, false);
    }
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    apiFetch({
      endpoint: "/auth/login",
      data: form,
      onSuccess: (result) => {
        messages(result.message);
        // console.log("result", result)
        // Tải lại trang sau khi đăng nhập thành công
        window.location.reload();
      },
      onError: (msg) => messages(msg),
    });
  };

  return (
    <>
      <form className="form-login" onSubmit={handleSubmit}>
        <div className="container-input input-user">
          <span
            className={`check ${
              valid.user === false ? "invalid" : valid.user ? "valid" : ""
            }`}
          />
          <input
            type="email || tel"
            id="user"
            placeholder=" "
            required
            value={form.user}
            onChange={handleChange}
          />
          <label htmlFor="user">Phone or Email</label>
          <span className="icon">
            <i>👤</i>
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
            value="Login"
            disabled={!(valid.user && valid.password && valid.captcha)}
          />
          <div className="btn">
            <button className="forgotpassword" onClick={switchToForgot}>Forgot the password?</button>
            <button className="menu_btn" onClick={switchToRegister}>
              Register
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
