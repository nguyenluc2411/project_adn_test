import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../config/AxiosClient";
import logo from "../assets/logo.png";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Mật khẩu không khớp!" });
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      };

      await axiosClient.post("/api/v1/auth/register", dataToSend);
      alert("Đăng ký thành công!");
      navigate("/login");

    } catch (err) {
      const res = err.response?.data;
      if (res?.code === 1002 && typeof res.result === "object") {
        setErrors(res.result);
      } else {
        setErrors({ general: res?.message || "Đăng ký thất bại!" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <img src={logo} alt="GENEX MEDICAL CENTER" className="auth-logo" />
      <div className="auth-box">
        {errors.general && <div className="auth-error">{errors.general}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-columns">
            <div className="form-col">
              <label>
                Tên đăng nhập <span className="auth-required">*</span>
              </label>
              <input
                type="text"
                name="username"
                className="auth-input"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && <div className="auth-error">{errors.username}</div>}

              <label>Họ và tên</label>
              <input
                type="text"
                name="fullName"
                className="auth-input"
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <div className="auth-error">{errors.fullName}</div>}

              <label>
                Mật khẩu <span className="auth-required">*</span>
              </label>
              <input
                type="password"
                name="password"
                className="auth-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <div className="auth-error">{errors.password}</div>}
            </div>

            <div className="form-col">
              <label>
                Email <span className="auth-required">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="auth-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="auth-error">{errors.email}</div>}

              <label>Số điện thoại</label>
              <input
                type="tel"
                name="phoneNumber"
                className="auth-input"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              {errors.phoneNumber && <div className="auth-error">{errors.phoneNumber}</div>}

              <label>
                Xác nhận mật khẩu <span className="auth-required">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="auth-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <div className="auth-error">{errors.confirmPassword}</div>}
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn main"
            disabled={loading}
          >
            {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
          </button>
        </form>

        <div className="auth-bottom">
          BẠN ĐÃ CÓ TÀI KHOẢN?{" "}
          <a href="/login" className="auth-link">
            ĐĂNG NHẬP
          </a>
        </div>
      </div>
    </div>
  );
}