import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Notification from "../Header/Notification";

const navItems = [
  { text: "Tổng quan", path: "/staff/dashboard", icon: "bi-house-door" },
  { text: "Các đơn đăng ký", path: "/staff/bookings", icon: "bi-journal-text" },
  { text: "Ghi nhận mẫu", path: "/staff/collection", icon: "bi-clipboard-check" },
  { text: "Lịch sử thu mẫu", path: "/staff/history", icon: "bi-clock-history" },
  { text: "Hồ sơ", path: "/staff/profile", icon: "bi-person-circle" },
];

export default function StaffSidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav>
      <div className="staff-header mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <i className="bi bi-house-door-fill fs-2 text-primary me-2"></i>
            <span className="fs-4 fw-bold text-primary">
              Gene<span style={{ color: "#ff9800" }}>X</span>
            </span>
            <span className="badge bg-secondary ms-2 mt-1 d-block text-center">
              Recorder<br />Staff
            </span>
          </div>
          <Notification />
        </div>
      </div>
      <ul className="staff-nav">
        {navItems.map((item) => (
          <li className="staff-nav-item" key={item.text}>
            <Link
              className={`staff-nav-link fs-6${location.pathname === item.path ? " active" : ""
                }`}
              to={item.path}
            >
              <i className={`bi ${item.icon} me-2 fs-5`}></i>
              {item.text}
            </Link>
          </li>
        ))}
        <li className="staff-nav-item mt-4">
          <button
            className="btn btn-primary px-4 rounded-pill w-100"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}