import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import axiosClient from "../config/AxiosClient";
import AdminSidebar from "./components/AdminSidebar";
import "./index.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState([]); // Thêm state cho doanh thu hàng ngày

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const fetchStats = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const res = await axiosClient.get("/api/admin/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setDashboard(res.data); // res.data cần có .monthlyRevenue
  } catch (err) {
    console.error("Lỗi lấy dashboard:", err);
  }
};


  useEffect(() => {
  fetchStats(); // Gọi khi component mount
}, []);

useEffect(() => {
  const fetchMonthlyRevenue = async () => {
    const token = localStorage.getItem("authToken");
    try {
      

      // Nếu đang xem tháng hiện tại và dashboard đã sẵn sàng, dùng dữ liệu từ dashboard
      if (
        selectedMonth === currentMonth &&
        selectedYear === currentYear &&
        dashboard && dashboard.monthlyRevenue !== undefined
      ) {
        setMonthlyRevenue(dashboard.monthlyRevenue);
      } else {
        // Ngược lại, gọi API lấy dữ liệu riêng cho tháng đó
        const res = await axiosClient.get(
          `/api/admin/dashboard/revenue?month=${selectedMonth}&year=${selectedYear}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const revenue =
          typeof res.data === "object"
            ? res.data.monthlyRevenue ?? 0
            : Number(res.data);
        setMonthlyRevenue(revenue);
      }
    } catch (err) {
      console.error("Lỗi lấy doanh thu tháng:", err);
      setMonthlyRevenue(0);
    }
  };

  fetchMonthlyRevenue();
}, [selectedMonth, selectedYear, dashboard]);


  useEffect(() => {
    const fetchDailyRevenue = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const dailyData = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const res = await axiosClient.get(
            `/api/admin/dashboard/revenue?day=${day}&month=${selectedMonth}&year=${selectedYear}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          dailyData.push({ day, revenue: res.data || 0 });
        }
        setDailyRevenue(dailyData);
      } catch (err) {
        setDailyRevenue([]);
      }
    };
    fetchDailyRevenue();
  }, [selectedMonth, selectedYear]);

  // Chuẩn bị data cho biểu đồ đường
  const lineData = {
    labels: dailyRevenue.map(item => `Ngày ${item.day}`),
    datasets: [
      {
        label: `Doanh thu từng ngày tháng ${selectedMonth}/${selectedYear}`,
        data: dailyRevenue.map(item => item.revenue),
        borderColor: 'rgb(34, 211, 238)',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 211, 238)',
        pointBorderColor: 'rgb(255, 255, 255)',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: 'rgb(168, 85, 247)',
        pointHoverBorderColor: 'rgb(255, 255, 255)',
        pointHoverBorderWidth: 3,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'white',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgb(34, 211, 238)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `Doanh thu: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: 'white',
          font: {
            size: 12
          },
          callback: function(value) {
            return formatCurrency(value);
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  // Format tiền VNĐ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-blue-600 to-blue-600 flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Sidebar */}
      <AdminSidebar activeMenu="dashboard" />

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

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 mb-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">TRANG CHỦ</h1>
              <p className="text-white/70">Bảng điều khiển quản trị</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-sm">Hoạt động</span>
            </div>
          </div>
        </div>

        {/* Stats Cards Container */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10 mb-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">
               Bảng điều khiển Admin 
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto"></div>
          </div>

          {/* Main Stats Cards - 4 columns */}
          {dashboard && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-400/20 backdrop-blur-sm rounded-2xl border border-blue-400/30 p-6 hover:bg-blue-400/30 transition-all duration-300">
                <div className="text-center">
                  <div className="bg-blue-500/30 p-4 rounded-full mb-4 mx-auto w-fit">
                    <i className="bi bi-cart text-blue-200 text-3xl"></i>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {dashboard.totalPayments}
                  </div>
                  <div className="text-blue-200 font-semibold">Đặt hàng</div>
                </div>
              </div>
              <div className="bg-green-400/20 backdrop-blur-sm rounded-2xl border border-green-400/30 p-6 hover:bg-green-400/30 transition-all duration-300">
                <div className="text-center">
                  <div className="bg-green-500/30 p-4 rounded-full mb-4 mx-auto w-fit">
                    <i className="bi bi-person-badge text-green-200 text-3xl"></i>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {dashboard.totalStaff}
                  </div>
                  <div className="text-green-200 font-semibold">Nhân viên</div>
                </div>
              </div>
              <div className="bg-orange-400/20 backdrop-blur-sm rounded-2xl border border-orange-400/30 p-6 hover:bg-orange-400/30 transition-all duration-300">
                <div className="text-center">
                  <div className="bg-orange-500/30 p-4 rounded-full mb-4 mx-auto w-fit">
                    <i className="bi bi-person-heart text-orange-200 text-3xl"></i>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {dashboard.totalCustomers}
                  </div>
                  <div className="text-orange-200 font-semibold">
                    Khách hàng
                  </div>
                </div>
              </div>
              <div className="bg-red-400/20 backdrop-blur-sm rounded-2xl border border-red-400/30 p-6 hover:bg-red-400/30 transition-all duration-300">
                <div className="text-center">
                  <div className="bg-red-500/30 p-4 rounded-full mb-4 mx-auto w-fit">
                    <i className="bi bi-journal-text text-red-200 text-3xl"></i>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {dashboard.totalBlogs}
                  </div>
                  <div className="text-red-200 font-semibold">Blog</div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Stats Cards */}
          {dashboard && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-4 rounded-full mr-4">
                    <i className="bi bi-people text-blue-400 text-3xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {dashboard.totalUsers}
                    </div>
                    <div className="text-blue-400 font-semibold">
                      Tổng người dùng
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center">
                  <div className="bg-cyan-500/20 p-4 rounded-full mr-4">
                    <i className="bi bi-gear text-cyan-400 text-3xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {dashboard.totalServices}
                    </div>
                    <div className="text-cyan-400 font-semibold">
                      Tổng dịch vụ
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-4 rounded-full mr-4">
                    <i className="bi bi-calendar-day text-blue-400 text-3xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {dashboard.todayRevenue
                        ? formatCurrency(dashboard.todayRevenue)
                        : "0 ₫"}
                    </div>
                    <div className="text-blue-400 font-semibold">
                      Doanh thu hôm nay
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center">
                  <div className="bg-yellow-500/20 p-4 rounded-full mr-4">
                    <i className="bi bi-calendar-month text-yellow-400 text-3xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(monthlyRevenue ?? 0)}
                    </div>
                    <div className="text-yellow-400 font-semibold">
                      Doanh thu tháng
                      <div className="flex gap-1 mt-1">
                        <select
                          value={selectedMonth}
                          onChange={(e) =>
                            setSelectedMonth(Number(e.target.value))
                          }
                          className="px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white backdrop-blur-sm"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (m) => (
                              <option
                                key={m}
                                value={m}
                                className="bg-gray-800 text-white"
                              >{`Tháng ${m}`}</option>
                            )
                          )}
                        </select>
                        <select
                          value={selectedYear}
                          onChange={(e) =>
                            setSelectedYear(Number(e.target.value))
                          }
                          className="px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white backdrop-blur-sm"
                        >
                          {Array.from(
                            { length: 5 },
                            (_, i) => new Date().getFullYear() - i
                          ).map((y) => (
                            <option
                              key={y}
                              value={y}
                              className="bg-gray-800 text-white"
                            >
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center">
                  <div className="bg-green-500/20 p-4 rounded-full mr-4">
                    <i className="bi bi-currency-dollar text-green-400 text-3xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {dashboard.totalRevenue
                        ? formatCurrency(dashboard.totalRevenue)
                        : "0 ₫"}
                    </div>
                    <div className="text-green-400 font-semibold">
                      Tổng doanh thu
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Line Chart - Thay thế Pie Chart */}
        {dailyRevenue.length > 0 ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                <i className="bi bi-graph-up mr-2"></i>
                Biểu đồ doanh thu tháng {selectedMonth}/{selectedYear}
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto"></div>
            </div>
            <div className="h-96">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                <i className="bi bi-graph-up mr-2"></i>
                Biểu đồ doanh thu tháng {selectedMonth}/{selectedYear}
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto"></div>
            </div>
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <i className="bi bi-exclamation-circle text-white/50 text-6xl mb-4"></i>
                <div className="text-white/70 text-xl">
                  Không có dữ liệu doanh thu cho tháng {selectedMonth} năm{" "}
                  {selectedYear}
                </div>
                <div className="text-white/50 text-sm mt-2">
                  Vui lòng kiểm tra lại API hoặc chọn tháng/năm khác
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div
        className="absolute top-10 right-10 w-20 h-20 border-2 border-cyan-400/30 rounded-full animate-spin"
        style={{ animationDuration: "20s" }}
      ></div>
    </div>
  );
};

export default AdminDashboard;
