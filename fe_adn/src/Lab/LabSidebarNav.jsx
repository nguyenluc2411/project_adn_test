// import React from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import Notification from "../Header/Notification";

// const navItems = [
//   { text: "Đơn chờ nhập kết quả", path: "/lab/dashboard", icon: "bi-clipboard-data" },
//   { text: "Nhập kết quả", path: "/lab/enter-result", icon: "bi-pencil-square" },
// ];

// export default function LabSidebarNav({ tab, setTab, setPage, onLogout }) {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     if (onLogout) {
//       onLogout();
//     } else {
//       localStorage.removeItem("accessToken");
//       navigate("/login");
//     }
//   };

//   return (
//     <nav>
//       {/* Header logo và role */}
//       <div className="staff-header mb-4">
//         <div className="d-flex align-items-center justify-content-between">
//           <div className="d-flex align-items-center">
//             <i className="bi bi-flask fs-2 text-primary me-2"></i>
//             <span className="fs-4 fw-bold text-primary">
//               Gene<span style={{ color: "#ff9800" }}>X</span>
//             </span>
//             <span className="badge bg-success ms-2 mt-1">Lab Staff</span>
//           </div>
//           <Notification />
//         </div>
//       </div>

//       {/* Menu item */}
//       <ul className="staff-nav">
//         {navItems.map((item) => (
//           <li className="staff-nav-item" key={item.text}>
//             <Link
//               className={`staff-nav-link${location.pathname === item.path ? " active" : ""}`}
//               to={item.path}
//             >
//               <i className={`bi ${item.icon} me-2 fs-5`}></i>
//               {item.text}
//             </Link>
//           </li>
//         ))}

//         {/* Logout */}
//         <li className="staff-nav-item mt-4">
//           <button
//             className="btn btn-primary px-4 rounded-pill w-100"
//             onClick={handleLogout}
//           >
//             <i className="bi bi-box-arrow-right me-2"></i>Logout
//           </button>
//         </li>
//       </ul>
//     </nav>
//   );
// }
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Notification from "../Header/Notification";
import { useAuth } from "../Context/AuthContext";

// Cập nhật menu với "Đơn đã xử lý"
const navItems = [
  {
    text: "Đơn chờ nhập kết quả",
    path: "/lab/dashboard?tab=PENDING",
    icon: "bi-clipboard-data",
  },
  {
    text: "Đơn đã xử lý",
    path: "/lab/dashboard?tab=COMPLETED",
    icon: "bi-check-circle",
  },
  {
    text: "Nhập kết quả",
    path: "/lab/enter-result",
    icon: "bi-pencil-square",
  },
];

export default function LabSidebarNav({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
  try {
    await logout(); // Xoá accessToken, setUser(null)
    setTimeout(() => {
      navigate("/login"); // Điều hướng sau 1 nhịp, tránh race-condition
    }, 10);
  } catch (err) {
    console.error("Logout error:", err);
  }
};

  // Hàm kiểm tra đường dẫn hiện tại có khớp với path không
  const isActive = (itemPath) => {
    const currentFullPath = location.pathname + location.search;
    return currentFullPath === itemPath;
  };

  return (
    <nav>
      {/* Header logo và role */}
      <div className="staff-header mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <i className="bi bi-flask fs-2 text-primary me-2"></i>
            <span className="fs-4 fw-bold text-primary">
              Gene<span style={{ color: "#ff9800" }}>X</span>
            </span>
            <span className="badge bg-success ms-2 mt-1">Lab Staff</span>
          </div>
          <Notification />
        </div>
      </div>

      {/* Menu item */}
      <ul className="staff-nav">
        {navItems.map((item) => (
          <li className="staff-nav-item" key={item.text}>
            <Link
              className={`staff-nav-link${isActive(item.path) ? " active" : ""}`}
              to={item.path}
            >
              <i className={`bi ${item.icon} me-2 fs-5`}></i>
              {item.text}
            </Link>
          </li>
        ))}

        {/* Logout */}
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
