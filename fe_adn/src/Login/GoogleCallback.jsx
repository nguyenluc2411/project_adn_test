import { useEffect, useContext, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";  thay dong nay bang import axiosClient from "../config/axiosClient";
import axiosClient from "../config/AxiosClient";
import { AuthContext } from "../Context/AuthContext";


export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // Ngăn gọi trùng (sử dụng ref vì không bị reset mỗi render)
  const hasCalledRef = useRef(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get("code");

    if (!code) {
      navigate("/login");
      return;
    }

    // Ngăn gọi lại nhiều lần
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    handleGoogleLogin(code);
  }, [location.search, navigate]);

  const handleGoogleLogin = async (code) => {
    setLoading(true);
    try {
      // const res = await axios.post(
      //   `${API_BASE_URL}/api/v1/auth/login-google`,
      //   { code }
      // );
      const res = await axiosClient.post("/api/v1/auth/login-google", { code });

      console.log("✅ Google login success:", res.data);
      const user = res.data;

      // Always store the user data first
      login(user);

      // Check if profile needs to be completed
      if (!user.username || !user.phoneNumber || !user.fullName) {
        // Store email for profile completion
        localStorage.setItem("googleUser", JSON.stringify({
          email: user.email,
          accessToken: user.accessToken
        }));
        navigate("/completeprofile");
      } else {
        // User has complete profile, redirect by role
        switch (user.role) {
          case "ADMIN":
            navigate("/admin/dashboard");
            break;
          case "RECORDER_STAFF":
            navigate("/staff/dashboard");
            break;
          case "LAB_STAFF":
            navigate("/lab/dashboard");
            break;
          case "CUSTOMER":
          default:
            navigate("/");
        }
        localStorage.removeItem("redirectUrl");
      }
    } catch (err) {
      console.error("❌ Google login error:", err?.response?.data || err.message);
      console.log("⛔ Mã code đã gửi:", code);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h4>🔄 Đang đăng nhập với Google...</h4>
      {loading && <p>Vui lòng đợi trong giây lát...</p>}
    </div>
  );
}
