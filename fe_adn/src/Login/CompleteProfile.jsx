import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios"; thay dong nay import axiosClient from "../config/AxiosClient";
import axiosClient from "../config/AxiosClient";
import { AuthContext } from "../Context/AuthContext"; // them dong nay no do thieu
import logo from "../assets/logo.png"; // Đường dẫn đến logo của bạn
export default function CompleteProfile() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        // username: "",
        email: "",
        fullName: "",
        phoneNumber: ""
    });

    useEffect(() => {
        const googleUser = JSON.parse(localStorage.getItem("googleUser"));
        if (googleUser) {
            setFormData(prev => ({
                ...prev,
                email: googleUser.email || "",
                fullName: googleUser.fullName || ""
            }));
        } else {
            navigate("/login"); // nếu chưa login Google → quay lại login
        }
    }, [navigate]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.phoneNumber || !formData.email || !formData.fullName) {
            alert("❌ Vui lòng điền đầy đủ thông tin!");
            return;
        }
        try {
            const res = await axiosClient.post("/api/v1/auth/google-register", formData);

            // Nếu backend trả user mới → đăng nhập lại
            if (res.data?.result) {
                // Optional: call login API lại nếu muốn auto đăng nhập
                alert("✅ Hoàn tất đăng ký. Vui lòng đăng nhập lại!");
                localStorage.removeItem("googleUser");
                navigate("/login");
            }
        } catch (err) {
            alert("❌Lỗi gửi thông tin: " + (err.response?.data?.message || err.message));
        }
    };


    return (
        <div className="auth-root">
            <img src={logo} alt="GENEX MEDICAL CENTER" className="auth-logo" />
            <div className="auth-box">
                <h2 style={{ textAlign: "center", color: "#fff", marginBottom: "20px" }}>
                    Hoàn tất hồ sơ
                </h2>

                <form onSubmit={handleSubmit}>
                    <label>Họ và tên</label>
                    <input
                        type="text"
                        name="fullName"
                        className="auth-input"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        className="auth-input"
                        value={formData.email}
                        disabled
                        required
                    />

                    <label>Số điện thoại</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        className="auth-input"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" className="auth-btn main">
                        HOÀN TẤT
                    </button>
                </form>
            </div>
        </div>
    );
}
