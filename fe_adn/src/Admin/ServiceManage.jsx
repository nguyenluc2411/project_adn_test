import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../config/AxiosClient";
import AdminSidebar from "./components/AdminSidebar";
import "./index.css";

const ServiceManage = () => {
  const navigate = useNavigate();
  
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({ name: "", price: 0, caseType: "ADMINISTRATIVE" });

  const removeDiacritics = (str) =>
    str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axiosClient.get("/api/services");
      const formatted = res.data.map((s) => ({
        id: s.id,
        name: s.name || "Không tên",
        price: s.price || 0,
        caseType: s.caseType || "ADMINISTRATIVE",
        enabled: s.enabled !== undefined ? s.enabled : true
      }));
      setServices(formatted);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách dịch vụ:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá dịch vụ này?")) return;
    try {
      await axiosClient.delete(`/api/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Lỗi khi xoá dịch vụ:", err);
    }
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditRow({ ...services[idx] });
  };

  const handleSave = async (idx) => {
    const row = services[idx];
    const dto = {
      name: editRow.name,
      price: Number(editRow.price),
      caseType: editRow.caseType
    };
    try {
      if (row.id) {
        await axiosClient.put(`/api/services/${row.id}`, dto);
      } else {
        const res = await axiosClient.post("/api/services", dto);
        dto.id = res.data.id;
      }
      const updated = [...services];
      updated[idx] = { ...dto, id: row.id || dto.id, enabled: row.enabled };
      setServices(updated);
      setEditIdx(null);
      setEditRow({ name: "", price: 0, caseType: "ADMINISTRATIVE" });
    } catch (err) {
      console.error("Lỗi khi lưu dịch vụ:", err);
    }
  };

  const handleAdd = () => {
    setServices([...services, { id: null, name: "", price: 0, caseType: "ADMINISTRATIVE", enabled: true }]);
    setEditIdx(services.length);
    setEditRow({ name: "", price: 0, caseType: "ADMINISTRATIVE" });
  };

  const filteredServices = services.filter((s) =>
    removeDiacritics(s.name).includes(removeDiacritics(search))
  );

  const canAdd = search.trim() === "";

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
      <AdminSidebar activeMenu="service" />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 mb-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">QUẢN LÝ DỊCH VỤ - GÓI DỊCH VỤ</h1>
              <p className="text-white/70">Quản lý gói dịch vụ hệ thống</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-sm">Hoạt động</span>
            </div>
          </div>
        </div>

        {/* Service Management Content */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">
               Quản lý dịch vụ 
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto"></div>
          </div>

          {/* Search & Add Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="relative flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm dịch vụ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl outline-none text-white placeholder-white/60 focus:border-cyan-400 focus:bg-white/20 transition-all duration-300"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <i className="bi bi-search text-white/60"></i>
              </div>
            </div>
            
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className={`ml-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 ${!canAdd && "opacity-50 cursor-not-allowed"}`}
            >
              <i className="bi bi-plus-circle text-xl"></i>
              Thêm dịch vụ
            </button>
          </div>

          {/* Table */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-white/10">
                    <th className="px-6 py-4 text-left text-white font-semibold">ID</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Tên gói dịch vụ</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Giá (VND)</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Phân loại</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((s, idx) => {
                    const isEditing = editIdx === idx;
                    return (
                      <tr key={s.id || idx} className="border-b border-white/10 hover:bg-white/5 transition-colors duration-300">
                        <td className="px-6 py-4 text-white/90">{s.id || "-"}</td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input 
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:border-cyan-400 transition-colors"
                              value={editRow.name}
                              onChange={e => setEditRow({ ...editRow, name: e.target.value })}
                            />
                          ) : (
                            <span className="text-white/90">{s.name}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input 
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:border-cyan-400 transition-colors"
                              value={editRow.price}
                              onChange={e => setEditRow({ ...editRow, price: e.target.value })}
                            />
                          ) : (
                            <span className="text-white/90">{s.price.toLocaleString("vi-VN")}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select 
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:border-cyan-400 transition-colors"
                              value={editRow.caseType}
                              onChange={e => setEditRow({ ...editRow, caseType: e.target.value })}
                            >
                              <option value="ADMINISTRATIVE" className="bg-gray-800 text-white">Hành chính</option>
                              <option value="CIVIL" className="bg-gray-800 text-white">Dân sự</option>
                            </select>
                          ) : (
                            <span className="text-white/90">
                              {s.caseType === "ADMINISTRATIVE" ? "Hành chính" : "Dân sự"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${s.enabled ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                            {s.enabled ? "Đang mở" : "Đã khóa"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <button 
                                onClick={() => handleSave(idx)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleEdit(idx)}
                                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(s.id)}
                              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                            <button
                              onClick={async () => {
                                const action = s.enabled ? "khóa" : "mở";
                                if (!window.confirm(`Bạn có chắc chắn muốn ${action} dịch vụ này không?`)) return;
                                try {
                                  await axiosClient.put(`/api/services/${s.id}/enabled?enabled=${!s.enabled}`);
                                  const updated = [...services];
                                  updated[idx].enabled = !s.enabled;
                                  setServices(updated);
                                } catch (err) {
                                  console.error(`Lỗi khi ${action} dịch vụ:`, err);
                                }
                              }}
                              className={`${s.enabled ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700" : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"} text-white px-4 py-2 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300`}
                            >
                              {s.enabled ? <i className="bi bi-lock"></i> : <i className="bi bi-unlock"></i>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {filteredServices.length === 0 && (
            <div className="text-center py-12 mb-8">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-gear text-white/60 text-3xl"></i>
              </div>
              <p className="text-white/70 text-lg">
                {search ? "Không tìm thấy dịch vụ nào" : "Chưa có dịch vụ nào"}
              </p>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-400 font-semibold">Tổng dịch vụ</p>
                  <p className="text-3xl font-bold text-white">{services.length}</p>
                </div>
                <div className="w-12 h-12 bg-cyan-500/30 rounded-full flex items-center justify-center">
                  <i className="bi bi-list-task text-cyan-400 text-xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-semibold">Đang hoạt động</p>
                  <p className="text-3xl font-bold text-white">{services.filter(s => s.enabled).length}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center">
                  <i className="bi bi-check-circle text-green-400 text-xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-400 font-semibold">Đã khóa</p>
                  <p className="text-3xl font-bold text-white">{services.filter(s => !s.enabled).length}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center">
                  <i className="bi bi-x-circle text-red-400 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 border-2 border-cyan-400/30 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
    </div>
  );
};

export default ServiceManage;