import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../config/AxiosClient";
import AdminSidebar from "./components/AdminSidebar";
import "./index.css";

const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

const BlogManage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchBlogsAndRatings = async () => {
      try {
        const res = await axiosClient.get(`/api/blogs?page=${page}&size=5`);
        const blogList = res.data.content || [];

        const ratings = await Promise.all(
          blogList.map((blog) => fetchRatingStats(blog.id))
        );

        const blogsWithRatings = blogList.map((blog, index) => ({
          ...blog,
          ratingStats: ratings[index],
        }));

        setBlogs(blogsWithRatings);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("Lỗi khi load blogs:", err);
        setBlogs([]);
        setTotalPages(0);
      }
    };

    fetchBlogsAndRatings();
  }, [page]);

  const handleDelete = async (blogId) => {
    if (!window.confirm("Bạn có chắc muốn xóa blog này?")) return;
    try {
      await axiosClient.delete(`/api/blogs/${blogId}`);
      const res = await axiosClient.get(`/api/blogs?page=${page}&size=5`);
      setBlogs(res.data.content || []);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      alert("Lỗi khi xóa blog!");
    }
  };

  const fetchRatingStats = async (blogId) => {
    try {
      const res = await axiosClient.get(`/api/blogs/${blogId}/ratings-stats`);
      return res.data;
    } catch (err) {
      console.error("Lỗi khi lấy rating:", err);
      return {
        averageRating: 0,
        totalVotes: 0,
        oneStarVotes: 0,
        twoStarVotes: 0,
        threeStarVotes: 0,
        fourStarVotes: 0,
        fiveStarVotes: 0,
      };
    }
  };

  const filteredBlogs = blogs.filter((b) =>
    removeVietnameseTones(b.title || "").includes(removeVietnameseTones(search))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-blue-600 to-blue-600 flex relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
                QUẢN LÝ BLOG
              </h1>
              <p className="text-white/70">Quản lý blog hệ thống</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-sm">Hoạt động</span>
            </div>
          </div>
        </div>

        {/* Blog Management Content */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">
               Quản lý blog 
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto"></div>
          </div>

          {/* Search & Add Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="relative flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm blog..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <i className="bi bi-search text-white/60"></i>
              </div>
            </div>

            <button
              onClick={() => navigate("/new-blog")}
              className="ml-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <i className="bi bi-plus-circle text-xl"></i>
              Tạo blog mới
            </button>
          </div>

          {/* Blog List */}
          <div className="space-y-4 p-6 mb-8">
            {[...filteredBlogs]
              .filter((b) => b.id)
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((b) => (
                <div
                  key={b.id}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {b.title}
                      </h3>
                      <div className="text-white/80 mb-4 leading-relaxed">
                        {b.content?.length > 150
                          ? b.content.slice(0, 150) + "..."
                          : b.content}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-white/60 justify-between">
                        {/* Author & Date */}
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-2">
                            <i className="bi bi-person"></i>
                            {b.authorName}
                          </span>
                          <span className="flex items-center gap-2">
                            <i className="bi bi-calendar"></i>
                            {b.createdAt?.slice(0, 10)}
                          </span>
                        </div>
                        {/* Rating summary + detail */}
                        <div className="relative flex items-center ml-auto group">
                          {/* Summary: trung bình + tổng vote */}
                          <div className="flex items-center gap-2 font-bold text-yellow-400 select-none">
                            {b.ratingStats?.averageRating?.toFixed(1) || 0}
                            <i className="bi bi-star-fill"></i>
                            <span className="text-white/80 font-semibold ml-2">
                              ({b.ratingStats?.totalVotes || 0} votes)
                            </span>
                          </div>
                          {/* Detail: hiện khi hover */}
                          <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200">
                            {[5, 4, 3, 2, 1].map((star) => (
                              <span
                                key={star}
                                className="flex items-center gap-1 px-3 py-1 rounded-full font-semibold text-xs border border-yellow-200"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #fffbe8 100%)", // vàng nhạt nổi bật
                                  color: "#b45309",
                                }}
                              >
                                {star}
                                <i className="bi bi-star-fill"></i>
                                :{" "}
                                <span
                                  style={{
                                    color: "#b45309",
                                    borderRadius: "6px",
                                    padding: "0 6px",
                                    fontWeight: 700,
                                    minWidth: 18,
                                    display: "inline-block",
                                    textAlign: "center",
                                  }}
                                >
                                  {b.ratingStats?.[
                                    `${["zero", "one", "two", "three", "four", "five"][star]}StarVotes`
                                  ] ?? 0}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <button
                        onClick={() => navigate(`/blog-edit/${b.id}`)}
                        className="mb-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-semibold shadow-md hover:scale-105 transition-all duration-300 flex items-center gap-2"
                      >
                        <i className="bi bi-pencil-fill"></i>
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="px-4 py-2 bg-red-500 rounded-full font-semibold shadow-md hover:scale-105 transition-all duration-300 flex items-center gap-2"
                      >
                        <i className="bi bi-trash-fill"></i>
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 py-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold shadow-md hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
            >
              <i className="bi bi-chevron-left"></i>
              Trước
            </button>
            <span className="text-white/80">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold shadow-md hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
            >
              Tiếp theo
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogManage;
