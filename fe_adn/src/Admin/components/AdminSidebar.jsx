import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminSidebar.css";
import { useAuth } from "../../Context/AuthContext";

const AdminSidebar = ({ activeMenu = "" }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const fullName = user.fullName || user.username || "Admin";
  const { logout } = useAuth();
  
  const handleLogout = async () => {
  try {
    await logout(); // Xoá accessToken, setUser(null)
    setTimeout(() => {
      navigate("/Login"); // Điều hướng sau 1 nhịp, tránh race-condition
    }, 10);
  } catch (err) {
    console.error("Logout error:", err);
  }
};

  return (
    <div className="admin-sidebar">
      {/* Logo */}
      <div className="logo-section">
        <h1 className="logo-title">GeneX</h1>
        <div className="logo-underline"></div>
      </div>

      {/* User Profile */}
      <div className="user-profile">
        <div className="user-info">
          <div className="avatar-container">
            <div className="avatar-bg">
              <img
                src="/src/assets/Admin/avt-customer.png"
                alt="avatar"
                className="avatar-img"
              />
            </div>
            <div className="online-indicator"></div>
          </div>
          <div>
            <div className="admin-badge">ADMIN</div>
            <h2 className="user-name">{fullName}</h2>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          Đăng xuất
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="nav-container">
        <nav className="nav-menu">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className={`nav-btn-dashboard ${
              activeMenu === "dashboard"
                ? "nav-btn-dashboard-active"
                : "nav-btn-dashboard-default"
            }`}
          >
            <i className="bi bi-house-door"></i>
            TRANG CHỦ
          </button>

        <div className="relative group">
  <button
    className={`w-full flex items-center gap-3 backdrop-blur-sm px-4 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 ${
      activeMenu === "account"
        ? "bg-white text-black"
        : "bg-white/10 hover:bg-black/20 text-black"
    }`}
  >
    <i className="bi bi-people"></i>
    QUẢN LÝ TÀI KHOẢN
    <i className="bi bi-chevron-down ml-auto group-hover:rotate-180 transition-transform duration-300"></i>
  </button>
  <div className="w-full bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-300 ease-in-out">
    <div className="p-3">
      <button
        onClick={() => navigate("/account-manage")}
        className="w-full text-left text-black  py-2 px-3 rounded-lg hover:bg-white/10 transition-colors duration-200 font-medium border-b border-white/20"
      >
        Nhân viên
      </button>
      <button
        onClick={() => navigate("/customer-manage")}
        className="w-full text-left text-black  py-2 px-3 rounded-lg hover:bg-white/10 transition-colors duration-200 font-medium"
      >
        Khách hàng
      </button>
    </div>
  </div>
</div>

         <div className="relative group">
  <button
    className={`w-full flex items-center gap-3 backdrop-blur-sm px-4 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 ${
      activeMenu === "service"
        ? "bg-white text-black"
        : "bg-white/10 hover:bg-black/20 text-black"
    }`}
  >
    <i className="bi bi-gear"></i>
    QUẢN LÝ DỊCH VỤ
    <i className="bi bi-chevron-down ml-auto group-hover:rotate-180 transition-transform duration-300"></i>
  </button>
  <div className="w-full bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-300 ease-in-out">
    <div className="p-3">
      <button
        onClick={() => navigate("/service-manage")}
        className="w-full text-left text-black py-2 px-3 rounded-lg hover:bg-white/10 transition-colors duration-200 font-medium border-b border-white/20"
      >
        Gói dịch vụ
      </button>
      <button
        onClick={() => navigate("/kit-manage")}
        className="w-full text-left text-black py-2 px-3 rounded-lg hover:bg-white/10 transition-colors duration-200 font-medium"
      >
        Quản lý KIT
      </button>
    </div>
  </div>
</div>

          <button
            onClick={() => navigate("/blog-manage")}
            className={`nav-btn-blog ${
              activeMenu === "blog"
                ? "nav-btn-blog-active"
                : "nav-btn-blog-default"
            }`}
          >
            <i className="bi bi-journal-text"></i>
            QUẢN LÝ BLOG
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
