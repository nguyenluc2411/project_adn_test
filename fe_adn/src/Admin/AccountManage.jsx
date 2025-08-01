import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../config/AxiosClient";
import AdminSidebar from "./components/AdminSidebar";
import "./index.css";

const AccountManage = () => {
  const [allAccounts, setAllAccounts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 5;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const fullName = user.fullName || user.username || "Admin";

  // Fetch tất cả data một lần
  useEffect(() => {
    const fetchAllAccounts = async () => {
      try {
        const response = await axiosClient.get(
          `/api/admin/users/filter?page=0&size=1000`
        );
        const filtered = (response.data.content || []).filter(
          (acc) => acc.role !== "CUSTOMER" &&
            acc.accountNonLocked === true
        );
        console.log("Danh sách full tài khoản (bao gồm status=false):", filtered);
        setAllAccounts(filtered);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tài khoản:", error);
        setAllAccounts([]);
      }
    };

    fetchAllAccounts();
  }, []);

  // Xử lý pagination và search
  useEffect(() => {
    const searchFiltered = allAccounts.filter((u) =>
      u.username?.toLowerCase().includes(search.toLowerCase())
    );

    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = searchFiltered.slice(startIndex, endIndex);

    setAccounts(paginatedData);
    setTotalPages(Math.ceil(searchFiltered.length / itemsPerPage));
  }, [allAccounts, page, search]);

  // Reset về trang 0 khi search
  useEffect(() => {
    setPage(0);
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;
    try {
      await axiosClient.delete(`/api/admin/users/${id}`);
      const updated = allAccounts.filter((acc) => acc.id !== id);
      setAllAccounts(updated);
    } catch (err) {
      console.error("Xoá thất bại:", err);
      alert("Lỗi khi xóa tài khoản! " + (err?.response?.data?.message || ""));
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
                QUẢN LÝ TÀI KHOẢN - NHÂN VIÊN
              </h1>
              <p className="text-white/70">
                Quản lý tài khoản nhân viên hệ thống
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-sm">Hoạt động</span>
            </div>
          </div>
        </div>

        {/* Account Management Content */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">

              Quản lý tài khoản - Nhân viên
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto"></div>
          </div>

          {/* Search & Create Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="relative flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm theo tên đăng nhập..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <i className="bi bi-search text-white/60"></i>
              </div>
            </div>

            <button
              onClick={() => navigate("/create-account")}
              className="ml-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <i className="bi bi-plus-circle text-xl"></i>
              Tạo tài khoản
            </button>
          </div>

          {/* Table */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-white/10">
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      TÊN ĐĂNG NHẬP
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      EMAIL
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      VAI TRÒ
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      THAO TÁC
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((u, idx) => (
                    <tr
                      key={u.id || idx}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-white">{u.username}</td>
                      <td className="px-6 py-4 text-white/90 font-medium">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-400 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                          >
                            <i className="bi bi-trash"></i>
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {accounts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-person text-white/60 text-3xl"></i>
              </div>
              <p className="text-white/70 text-lg">
                {search
                  ? "Không tìm thấy tài khoản nào"
                  : "Chưa có tài khoản nào"}
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <button
              disabled={page <= 0}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <i className="bi bi-chevron-left"></i>
              Trang trước
            </button>

            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <span className="text-white font-semibold">
                Trang {page + 1} / {totalPages}
              </span>
            </div>

            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Trang sau
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-400 font-semibold">Tổng tài khoản</p>
                  <p className="text-3xl font-bold text-white">
                    {allAccounts.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-cyan-500/30 rounded-full flex items-center justify-center">
                  <i className="bi bi-people text-cyan-400 text-xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-semibold">Trang hiện tại</p>
                  <p className="text-3xl font-bold text-white">{page + 1}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center">
                  <i className="bi bi-file-earmark-text text-green-400 text-xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 font-semibold">Tổng trang</p>
                  <p className="text-3xl font-bold text-white">{totalPages}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center">
                  <i className="bi bi-files text-purple-400 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
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

export default AccountManage;
