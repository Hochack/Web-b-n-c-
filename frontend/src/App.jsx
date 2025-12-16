// src/App.js
import React, { useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar";
import { AuthProvider } from "./context/AuthContext";
import ProductList from "./components/ProductList";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import SearchPage from './pages/SearchPage';
import "./App.css"; // Import CSS styles

function App() {
  const loginButtonRef = useRef(); // Ref để click nút đăng nhập

  return (
    <div>
      <AuthProvider>
        <Router>
          <TopBar loginButtonRef={loginButtonRef} />
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage loginButtonRef={loginButtonRef} />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </Router>
      </AuthProvider>
      <div className="messages"></div>
      <div style={{ padding: "2px", color: "white", background: "#181818", textAlign: "center" }}>
        <p>&copy; 2025</p>
      </div>
    </div>
  );
}

export default App;
// // FontEnd/src/App.js
