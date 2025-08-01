import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../config/AxiosClient";
import { uploadToCloudinary } from "../config/cloudinaryUpload";
import AdminSidebar from "./components/AdminSidebar";
import "./index.css";

const BlogEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [blog, setBlog] = useState({
    title: "",
    shortDescription: "",
    content: "",
    thumbnailUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lấy dữ liệu blog theo id
  useEffect(() => {
    axiosClient
      .get(`/api/blogs/${id}`)
      .then((res) => {
        setBlog({
          title: res.data.title || "",
          shortDescription: res.data.shortDescription || "",
          content: res.data.content || "",
          thumbnailUrl: res.data.thumbnailUrl || "",
        });
      })
      .catch((err) => {
        console.error("❌ Lỗi khi lấy blog:", err);
        alert("Không tìm thấy blog!");
        navigate("/blog-manage");
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    setBlog({ ...blog, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBlog((prev) => ({ ...prev, thumbnailUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!blog.title || !blog.shortDescription || !blog.content) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = blog.thumbnailUrl;

      if (imageFile) {
        const uploadedUrl = await uploadToCloudinary(imageFile);
        if (!uploadedUrl) {
          alert("Tải ảnh thất bại!");
          setLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const dto = {
        title: blog.title,
        shortDescription: blog.shortDescription,
        content: blog.content,
        thumbnailUrl: imageUrl,
      };

      await axiosClient.put(`/api/blogs/${id}`, dto);
      setSuccess(true);
      setTimeout(() => {
        navigate("/blog-manage");
      }, 1200);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật blog:", err);
      alert("Cập nhật blog thất bại!");
    } finally {
      setLoading(false);
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
      <AdminSidebar activeMenu="blog" />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 mb-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                CHỈNH SỬA BLOG
              </h1>
              <p className="text-white/70">Cập nhật nội dung blog</p>
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
               Chỉnh sửa blog 
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto"></div>
          </div>

          {/* Form */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Title Input */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <label className="block text-white font-semibold mb-3 text-lg">
                <i className="bi bi-fonts mr-2"></i>
                Tiêu đề blog
              </label>
              <input
                type="text"
                name="title"
                value={blog.title || ""}
                onChange={handleChange}
                placeholder="Nhập tiêu đề blog..."
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
              />
            </div>

            {/* Short Description Input */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <label className="block text-white font-semibold mb-3 text-lg">
                <i className="bi bi-text-paragraph mr-2"></i>
                Mô tả ngắn
              </label>
              <input
                type="text"
                name="shortDescription"
                value={blog.shortDescription || ""}
                onChange={handleChange}
                placeholder="Nhập mô tả ngắn..."
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
              />
            </div>

            {/* Image Upload */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <label className="block text-white font-semibold mb-3 text-lg">
                <i className="bi bi-image mr-2"></i>
                Ảnh thumbnail
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 transition-all duration-300"
                />
                {blog.thumbnailUrl && (
                  <div className="relative">
                    <img
                      src={blog.thumbnailUrl}
                      alt="Preview"
                      className="max-h-64 w-full object-cover rounded-2xl border border-white/20 shadow-lg"
                    />
                    <div className="absolute top-2 right-2 bg-white/10 backdrop-blur-sm rounded-full p-2">
                      <i className="bi bi-image text-white"></i>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Textarea */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <label className="block text-white font-semibold mb-3 text-lg">
                <i className="bi bi-file-text mr-2"></i>
                Nội dung blog
              </label>
              <textarea
                name="content"
                value={blog.content || ""}
                onChange={handleChange}
                rows="12"
                placeholder="Nhập nội dung blog..."
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={() => navigate("/blog-manage")}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <i className="bi bi-arrow-left"></i>
                Quay lại
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className={`${
                  loading
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                } text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 text-center">
                <div className="text-green-400 text-2xl mb-2">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <p className="text-green-400 font-semibold text-lg">
                  ✔ Đã cập nhật blog thành công!
                </p>
                <p className="text-white/70 mt-2">Đang chuyển hướng...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div
        className="absolute top-10 right-10 w-20 h-20 border-2 border-cyan-400/30 rounded-full animate-spin"
        style={{ animationDuration: "20s" }}
      ></div>
      <div
        className="absolute bottom-10 left-10 w-16 h-16 border-2 border-purple-400/30 rounded-full animate-spin"
        style={{ animationDuration: "15s" }}
      ></div>
    </div>
  );
};

export default BlogEdit;
