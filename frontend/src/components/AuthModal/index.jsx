// src/components/AuthModal/index.jsx
import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotThePasswordForm from "./ForgotThePasswordForm";
import "./AuthModal.css";

const AuthModal = () => {
  const [mode, setMode] = useState("login");

  return (
    <div className="container-login" id="modalLogin" popover="auto">
      <div className="login-box" onClick={(e) => e.stopPropagation()}>
        <div className="login-header">
          <h1 className="login-title">
            <span id="log-btn-label">
              {mode === "login"
                ? "Login"
                : mode === "register"
                ? "Register"
                : "Forgot Password"}
            </span>
          </h1>
        </div>

        {mode === "login" && (
          <LoginForm
            switchToRegister={() => setMode("register")}
            switchToForgot={() => setMode("forgot")}
          />
        )}
        {mode === "register" && (
          <RegisterForm
            switchToLogin={() => setMode("login")}
            switchToForgot={() => setMode("forgot")}
          />
        )}
        {mode === "forgot" && (
          <ForgotThePasswordForm
            switchToLogin={() => setMode("login")}
            switchToRegister={() => setMode("register")}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
