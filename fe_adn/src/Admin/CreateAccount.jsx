import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../config/AxiosClient";
import AdminSidebar from "./components/AdminSidebar";
import "./index.css";

// Upload ảnh lên Cloudinary
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "blog_unsigned");
  formData.append("folder", "blog-thumbnails");

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dbihuiif1/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) throw new Error(`Upload thất bại với status ${res.status}`);
    const data = await res.json();
    return data.secure_url;
  } catch (err) {
    console.error("Upload ảnh thất bại:", err);
    return null;
  }
};

const CreateAccount = () => {
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    password: "",
    confirm: "",
    email: "",
    phoneNumber: "",
    gender: "Nam",
    role: "Nhân viên xét nghiệm",
    authProvider: "SYSTEM",
  });

  const [fingerprintFile, setFingerprintFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Thêm function retry
  const retryCreateAccount = async (payload, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await axiosClient.post("/api/admin/staff", payload);
        return response;
      } catch (error) {
        // Nếu đã hết lần thử, throw error
        if (i === maxRetries - 1) {
          throw error;
        }

        // Nếu là lỗi concurrency, đợi rồi thử lại
        if (
          error.response?.status === 400 &&
          error.response?.data?.message?.includes(
            "Row was updated or deleted by another transaction"
          )
        ) {
          const waitTime = 1000 * (i + 1); // Đợi 1s, 2s, 3s
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        // Lỗi khác thì không retry
        throw error;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ngăn không cho submit nhiều lần
    if (isLoading) return;

    // Validate form
    if (form.password !== form.confirm) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Thêm validation cho số điện thoại
    if (form.phoneNumber && form.phoneNumber.trim() !== "") {
      // Check định dạng số điện thoại Việt Nam
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(form.phoneNumber)) {
        alert(
          "Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)"
        );
        return;
      }
    }

    setIsLoading(true); // Bắt đầu loading

    const mappedRole =
      form.role === "Nhân viên ghi nhận" ? "RECORDER_STAFF" : "LAB_STAFF";

    // Upload fingerprint if exists
    let fingerprintUrl = null;
    if (fingerprintFile) {
      fingerprintUrl = await uploadToCloudinary(fingerprintFile);
      if (!fingerprintUrl) {
        alert("Tải ảnh vân tay thất bại. Vui lòng thử lại.");
        setIsLoading(false);
        return;
      }
    }

    // Tạo payload
    const payload = {
      username: form.username,
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      role: mappedRole,
      phoneNumber: form.phoneNumber,
      gender: form.gender,
      authProvider: form.authProvider,
      fingerprintImageUrl: fingerprintUrl,
    };

    try {
      // Sử dụng retry mechanism
      const response = await retryCreateAccount(payload);

      alert("Tạo tài khoản thành công!");
      navigate("/account-manage");
    } catch (error) {
      console.error("❌ Lỗi khi tạo tài khoản:", error);

      if (error.response?.status === 400) {
        const errorMessage =
          error.response.data?.message || "Dữ liệu không hợp lệ!";
        console.log("🔍 Error message từ backend:", errorMessage);

        if (
          errorMessage.includes("for key 'user.phone_number'") ||
          errorMessage.includes("for key 'user.UK4bgmpi98dylab6qdvf9xyaxu4'")
        ) {
          alert("Số điện thoại đã tồn tại!");
        } else {
          alert(`Lỗi: ${errorMessage}`);
        }
      } else if (error.response?.status === 409) {
        alert("Tên đăng nhập hoặc email đã tồn tại!");
      } else if (error.response?.status === 403) {
        alert("Bạn không có quyền thực hiện hành động này!");
      } else if (error.response?.status === 422) {
        alert("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!");
      } else {
        alert("Tạo tài khoản thất bại. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false); // Tắt loading
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-blue-600 to-blue-600 flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Sidebar */}
      <AdminSidebar activeMenu="account" />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 mb-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                TẠO TÀI KHOẢN
              </h1>
              <p className="text-white/70">Tạo tài khoản nhân viên mới</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-sm">Hoạt động</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
               Tạo tài khoản mới 
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            {/* Họ và tên */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                <i className="bi bi-person mr-2"></i>
                Họ và tên <span className="text-red-400">(*)</span>
              </label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
                placeholder="Nhập họ và tên đầy đủ"
                required
              />
            </div>

            {/* Username + Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  <i className="bi bi-person-badge mr-2"></i>
                  Tên người dùng <span className="text-red-400">(*)</span>
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">
                  <i className="bi bi-briefcase mr-2"></i>
                  Vai trò
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
                >
                  <option
                    value="Nhân viên xét nghiệm"
                    className="bg-gray-800 text-white"
                  >
                    Nhân viên xét nghiệm
                  </option>
                  <option
                    value="Nhân viên ghi nhận"
                    className="bg-gray-800 text-white"
                  >
                    Nhân viên ghi nhận
                  </option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  <i className="bi bi-lock mr-2"></i>
                  Mật khẩu <span className="text-red-400">(*)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">
                  <i className="bi bi-shield-lock mr-2"></i>
                  Xác nhận mật khẩu <span className="text-red-400">(*)</span>
                </label>
                <input
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
                  placeholder="Xác nhận mật khẩu"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                <i className="bi bi-envelope mr-2"></i>
                Email <span className="text-red-400">(*)</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
                placeholder="Nhập địa chỉ email"
                required
              />
            </div>

            {/* Phone + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  <i className="bi bi-telephone mr-2"></i>
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
                  placeholder="Nhập số điện thoại (tùy chọn)"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">
                  <i className="bi bi-gender-ambiguous mr-2"></i>
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
                >
                  <option value="Nam" className="bg-gray-800 text-white">
                    Nam
                  </option>
                  <option value="Nữ" className="bg-gray-800 text-white">
                    Nữ
                  </option>
                  <option value="Khác" className="bg-gray-800 text-white">
                    Khác
                  </option>
                </select>
              </div>
            </div>

            {/* Ảnh vân tay */}
            <div className="mb-8">
              <label className="block text-white font-semibold mb-2">
                <i className="bi bi-fingerprint mr-2"></i>
                Ảnh vân tay
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFingerprintFile(e.target.files[0])}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white focus:border-cyan-400 focus:bg-white/20 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <i className="bi bi-upload text-white/60"></i>
                </div>
              </div>
              {fingerprintFile && (
                <p className="text-cyan-400 text-sm mt-2">
                  <i className="bi bi-check-circle mr-1"></i>
                  Đã chọn: {fingerprintFile.name}
                </p>
              )}
            </div>

            {/* Submit buttons */}
            <div className="flex justify-center gap-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-4 rounded-2xl font-semibold shadow-lg transform transition-all duration-300 flex items-center gap-2 ${
                  isLoading
                    ? "bg-gray-500/50 text-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:scale-105"
                }`}
              >
                {isLoading ? (
                  <>
                    <i className="bi bi-hourglass-split animate-spin"></i>
                    ĐANG TẠO...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus"></i>
                    TẠO TÀI KHOẢN
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isLoading}
                className={`px-8 py-4 rounded-2xl font-semibold shadow-lg transform transition-all duration-300 flex items-center gap-2 ${
                  isLoading
                    ? "bg-gray-500/50 text-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white hover:scale-105"
                }`}
                onClick={() => navigate("/account-manage")}
              >
                <i className="bi bi-x-circle"></i>
                HỦY BỎ
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Decorative Elements */}
      <div
        className="absolute top-10 right-10 w-20 h-20 border-2 border-cyan-400/30 rounded-full animate-spin"
        style={{ animationDuration: "20s" }}
      ></div>
    </div>
  );
};

export default CreateAccount;
