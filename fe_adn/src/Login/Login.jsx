
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import logo from "../assets/logo.png";
import logogoogle from "../assets/logogoogle.png";
import { useState, useContext, useEffect } from "react";
import "./Auth.css";
// import API_BASE_URL from "../config/api";
// const API_BASE_URL = "https://4cd2-118-69-70-166.ngrok-free.app";


import axiosClient from "../config/AxiosClient";
const GOOGLE_REDIRECT_URI = `https://accounts.google.com/o/oauth2/v2/auth?client_id=443615178916-5p9djk25jon368lljhovev11s40p19j1.apps.googleusercontent.com&redirect_uri=${import.meta.env.VITE_GOOGLE_REDIRECT}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;
export default function Login() {
  const navigate = useNavigate();
  const { login, isLoggedIn, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  useEffect(() => {
    const handleStorageChange = () => {
      // Khi localStorage thay đổi (login/logout ở tab khác), kiểm tra lại trạng thái đăng nhập
      if (localStorage.getItem("user")) {
        alert("Bạn đã đăng nhập ở tab khác. Vui lòng reload trang!");
        // Có thể tự động reload hoặc chuyển hướng
        window.location.reload();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  // Chặn vào trang login khi đã đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      switch (user?.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'RECORDER_STAFF':
          navigate('/staff/dashboard');
          break;
        case 'LAB_STAFF':
          navigate('/lab/dashboard');
          break;
        case 'CUSTOMER':
        default:
          navigate('/');
      }
    }
  }, [isLoggedIn, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      //const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, formData);
      const response = await axiosClient.post("/api/v1/auth/login", formData);

      // Lưu token và thông tin user vào context
      login(response.data);

      // Chuyển hướng theo role
      switch (response.data.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'RECORDER_STAFF':
          navigate('/staff/dashboard');
          break;
        case 'LAB_STAFF':
          navigate('/lab/dashboard');
          break;
        case 'CUSTOMER':
          navigate('/');
          break;
        default:
          setError("Tài khoản không có quyền truy cập!");
          navigate('/login');
      }
      localStorage.removeItem("redirectUrl");
    } catch (err) {
      setError(err.response?.data?.message || "Tên đăng nhập hoặc mật khẩu không chính xác!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <img src={logo} alt="GENEX MEDICAL CENTER" className="auth-logo" />
      <div className="auth-box">
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Tên đăng nhập</label>
          <input
            type="text"
            name="username"
            className="auth-input"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            className="auth-input"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="auth-forgot">
            <a href="/forgot" className="auth-link">QUÊN MẬT KHẨU?</a>
          </div>

          <div className="auth-btn-row">
            <button
              type="submit"
              className="auth-btn main"
              disabled={loading}
            >
              {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
            </button>
            <span>Hoặc</span>
            <a
              href={GOOGLE_REDIRECT_URI}
              className="auth-btn google"
            >
              <img src={logogoogle} alt="Google" className="google-icon" />
              GOOGLE
            </a>
          </div>
        </form>

        <div className="auth-bottom">
          CHƯA CÓ TÀI KHOẢN? <a href="/register" className="auth-link">ĐĂNG KÝ</a>
        </div>
      </div>
    </div>
  );
}
