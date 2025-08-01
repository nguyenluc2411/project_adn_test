import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function PrivateRouter({ children, allowedRole }) {
  const { isLoggedIn, loading, isRefreshing, role } = useAuth();

  // 1. Đợi AuthContext xử lý xong token và role
  if (loading || isRefreshing) {
    return <div className="loading">🔄 Đang kiểm tra quyền truy cập...</div>;
  }

  // 2. Nếu chưa đăng nhập → điều hướng về login
  if (!isLoggedIn) {
    console.log('🚫 PrivateRouter: Chưa đăng nhập hoặc token hết hạn');
    localStorage.setItem("redirectUrl", window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  // 3. Kiểm tra quyền truy cập (nếu có yêu cầu allowedRole)
  if (allowedRole && role !== allowedRole) {
    console.log(`🚫 PrivateRouter: Không đủ quyền. Yêu cầu: ${allowedRole}, hiện tại: ${role}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Truy cập hợp lệ
  console.log('✅ PrivateRouter: Truy cập hợp lệ');
  return children;
}
