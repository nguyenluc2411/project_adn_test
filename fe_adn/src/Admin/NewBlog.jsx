import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../config/AxiosClient";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { uploadToCloudinary } from "../config/cloudinaryUpload";
import AdminSidebar from "./components/AdminSidebar";
import "./index.css";

const NewBlog = () => {
  const [blog, setBlog] = useState({ title: "", content: "", thumbnailUrl: "" });
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setBlog({ ...blog, [e.target.name]: e.target.value });
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadToCloudinary(file);
    setUploading(false);
    if (url) {
      setBlog((prev) => ({ ...prev, thumbnailUrl: url }));
    } else {
      alert("Lỗi khi upload ảnh!");
    }
  };

  const handleSubmit = async () => {
    if (!blog.title.trim() || !blog.content.trim()) return;

    try {
      await axiosClient.post(
        "/api/blogs",
        {
          title: blog.title,
          content: blog.content,
          thumbnailUrl: blog.thumbnailUrl,
        },
        {
          params: {
            userId: 1,
          },
        }
      );
      setSuccess(true);
      setTimeout(() => navigate("/blog-manage"), 1200);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đăng blog!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-blue-600 to-blue-600 flex relative overflow-hidden">
      {/* Custom CSS for Word-like icons */}
      <style jsx>{`
        .w-md-editor {
          background: transparent !important;
          border: none !important;
        }
        
        .w-md-editor-toolbar {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px 12px 0 0 !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
        }
        
        .w-md-editor-toolbar-divider {
          background: rgba(255, 255, 255, 0.2) !important;
          width: 1px !important;
          height: 20px !important;
          margin: 0 8px !important;
        }
        
        .w-md-editor-toolbar ul > li button {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 6px !important;
          color: #e2e8f0 !important;
          padding: 6px 8px !important;
          margin: 0 2px !important;
          transition: all 0.3s ease !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          min-width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .w-md-editor-toolbar ul > li button:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
          border-color: rgba(59, 130, 246, 0.5) !important;
          color: white !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Bold"] {
          font-weight: 700 !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Italic"] {
          font-style: italic !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Strikethrough"] {
          text-decoration: line-through !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Link"] {
          color: #60a5fa !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Image"] {
          color: #34d399 !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Code"] {
          background: rgba(168, 85, 247, 0.1) !important;
          border-color: rgba(168, 85, 247, 0.3) !important;
          color: #c084fc !important;
          font-family: 'Courier New', monospace !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Quote"] {
          color: #fbbf24 !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Table"] {
          color: #06b6d4 !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Help"] {
          color: #f472b6 !important;
          border-radius: 50% !important;
        }
        
        .w-md-editor-text-textarea,
        .w-md-editor-text {
          background: rgba(15, 23, 42, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-top: none !important;
          color: #e2e8f0 !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          padding: 16px !important;
          border-radius: 0 0 12px 12px !important;
        }
        
        .w-md-editor-text-textarea:focus,
        .w-md-editor-text:focus {
          border-color: rgba(59, 130, 246, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        .w-md-editor-text-textarea::placeholder {
          color: rgba(226, 232, 240, 0.5) !important;
        }
        
        .w-md-editor-preview {
          background: rgba(15, 23, 42, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-left: none !important;
          border-radius: 0 0 12px 0 !important;
          padding: 16px !important;
        }
        
        .w-md-editor-preview h1,
        .w-md-editor-preview h2,
        .w-md-editor-preview h3,
        .w-md-editor-preview h4,
        .w-md-editor-preview h5,
        .w-md-editor-preview h6 {
          color: #60a5fa !important;
        }
        
        .w-md-editor-preview p {
          color: #e2e8f0 !important;
        }
        
        .w-md-editor-preview code {
          background: rgba(168, 85, 247, 0.2) !important;
          color: #c084fc !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
        }
        
        .w-md-editor-preview blockquote {
          border-left: 4px solid #fbbf24 !important;
          background: rgba(251, 191, 36, 0.1) !important;
          color: #fbbf24 !important;
        }
        
        .w-md-editor-preview table {
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        .w-md-editor-preview th {
          background: rgba(59, 130, 246, 0.2) !important;
          color: #60a5fa !important;
        }
        
        .w-md-editor-preview td {
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #e2e8f0 !important;
        }
        
        /* Custom hover effects cho từng icon */
        .w-md-editor-toolbar ul > li button[aria-label*="Bold"]:hover {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3) !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Italic"]:hover {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%) !important;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3) !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Link"]:hover {
          background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%) !important;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3) !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Image"]:hover {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3) !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Code"]:hover {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%) !important;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3) !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Quote"]:hover {
          background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%) !important;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3) !important;
        }
        
        .w-md-editor-toolbar ul > li button[aria-label*="Table"]:hover {
          background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%) !important;
          box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3) !important;
        }
        
        /* Active state */
        .w-md-editor-toolbar ul > li button[data-active="true"] {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
          border-color: rgba(59, 130, 246, 0.8) !important;
          color: white !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4) !important;
        }
        
        /* Scrollbar styling */
        .w-md-editor-text-textarea::-webkit-scrollbar,
        .w-md-editor-preview::-webkit-scrollbar {
          width: 8px;
        }
        
        .w-md-editor-text-textarea::-webkit-scrollbar-track,
        .w-md-editor-preview::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }
        
        .w-md-editor-text-textarea::-webkit-scrollbar-thumb,
        .w-md-editor-preview::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 4px;
        }
        
        .w-md-editor-text-textarea::-webkit-scrollbar-thumb:hover,
        .w-md-editor-preview::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
        }
      `}</style>

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
              <h1 className="text-3xl font-bold text-white mb-2">VIẾT BLOG MỚI</h1>
              <p className="text-white/70">Tạo bài viết blog mới</p>
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
               Viết Blog Mới 
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto"></div>
          </div>

          {/* Image Upload Section */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative group">
              {blog.thumbnailUrl && (
                <div className="relative overflow-hidden rounded-2xl mb-4 group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={blog.thumbnailUrl}
                    alt="Ảnh Blog"
                    className="w-64 h-40 object-cover border-2 border-white/30 shadow-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              )}
              
              <label className="relative cursor-pointer">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  <i className="bi bi-cloud-upload text-xl"></i>
                  {uploading ? "Đang tải..." : "Tải ảnh lên"}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>
            
            {uploading && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/80 text-sm">Đang tải ảnh lên...</p>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="mb-8 relative">
            <input
              type="text"
              name="title"
              value={blog.title}
              onChange={handleChange}
              placeholder="💎 Tiêu đề bài viết..."
              className="w-full text-2xl font-bold px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-500 shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>

          {/* Content Editor - WORD-STYLE */}
          <div className="mb-8 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-white/80 text-sm font-medium">Editor</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping delay-300"></div>
                </div>
              </div>
              
              <div className="relative">
                <MDEditor
                  value={blog.content}
                  onChange={(val) => setBlog({ ...blog, content: val || "" })}
                  height={400}
                  data-color-mode="dark"
                  preview="edit"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                />
                
                {/* Overlay hiệu ứng */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6">
            <button
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group"
              onClick={() => navigate("/blog-manage")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <i className="bi bi-arrow-left"></i>
              Quay lại
            </button>
            
            <button
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group"
              onClick={handleSubmit}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <i className="bi bi-send"></i>
              Đăng bài
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl backdrop-blur-sm animate-pulse">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <i className="bi bi-check-lg text-white"></i>
                </div>
                <p className="text-green-400 font-semibold text-lg">
                  ✅ Đăng bài viết thành công!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 border-2 border-cyan-400/30 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 border-2 border-purple-400/30 rounded-full animate-spin" style={{animationDuration: '15s'}}></div>
      
      {/* Thêm hiệu ứng tia sáng */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
    </div>
  );
};

export default NewBlog;