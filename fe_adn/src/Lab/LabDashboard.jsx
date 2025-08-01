import React, { useEffect, useState } from "react";
import axiosClient from "../config/AxiosClient";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import LabSidebarNav from "../Lab/LabSidebarNav";

export default function LabDashboard() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [highlightedId, setHighlightedId] = useState(null); // THÊM state highlight
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams(); // THÊM useSearchParams
  const [bookingIdFromURL, setBookingIdFromURL] = useState(null);
  const rowsPerPage = 10;

  // THÊM: Xử lý bookingId từ URL
  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (bookingId) {
      setBookingIdFromURL(parseInt(bookingId));
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("bookingId");
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  // THÊM: Highlight bookingId từ URL
  useEffect(() => {
    if (bookingIdFromURL && bookings.length > 0) {
      const exist = bookings.some(b => b.id === bookingIdFromURL);
      if (exist) {
        setHighlightedId(bookingIdFromURL);
        setBookingIdFromURL(null); // Reset sau khi dùng
      }
    }
  }, [bookings, bookingIdFromURL]);

  // THÊM: Auto scroll khi có highlight
  useEffect(() => {
    if (highlightedId && bookings.length > 0) {
      const timer = setTimeout(() => {
        const element = document.querySelector(`[data-booking-id="${highlightedId}"]`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          console.log("📍 Scroll đến đơn:", highlightedId);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [highlightedId, bookings]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam === "COMPLETED" || tabParam === "PENDING") {
      setTab(tabParam);
    }
  }, [location.search]);

  // THÊM: Reset highlight khi search hoặc đổi tab
  useEffect(() => {
    setHighlightedId(null);
  }, [searchText, tab]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const status = tab === "PENDING" ? "SENT_TO_LAB" : "COMPLETED";
        const res = await axiosClient.get("/api/adn-results/lab/search-bookings", {
          params: {
            status,
            page: page - 1,
            size: rowsPerPage,
            ...(searchText ? { code: searchText } : {}),
          },
        });
        setBookings(res.data.content);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("Lỗi khi tải danh sách booking:", err);
        alert("Không thể tải danh sách booking.");
      }
    };

    fetchBookings();
  }, [tab, page, searchText]);

  const handleEnterResult = (bookingId) => {
    navigate("/lab/enter-result", { state: { bookingId } });
    sessionStorage.setItem("bookingId", bookingId);
  };

  const handleExportPDF = async (bookingId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await axiosClient.get(`/api/adn-results/export/${bookingId}`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      alert("❌ Lỗi khi xuất PDF.");
      const blob = err.response?.data;
      if (blob && blob instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          console.error("📨 Server error message:", reader.result);
        };
        reader.readAsText(blob);
      } else {
        console.error("🔥 Export PDF error:", err);
      }
    }
  };

  const handleResendTrackingInfo = async (bookingId) => {
    try {
      await axiosClient.post(`/api/adn-results/resend-tracking-info/${bookingId}`);
      alert("📨 Mã tra cứu đã được gửi lại cho khách hàng.");
    } catch (err) {
      console.error("❌ Lỗi khi gửi lại mã tra cứu:", err);
      alert("Không thể gửi lại mã tra cứu.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar bên trái */}
      <div className="p-3 border-end bg-white" style={{ width: "260px" }}>
        <LabSidebarNav
          tab={tab}
          setTab={setTab}
          setPage={setPage}
          onLogout={handleLogout}
        />
      </div>

      {/* Nội dung dashboard bên phải */}
      <div className="flex-grow-1 p-4 bg-light overflow-auto">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">
            {tab === "PENDING"
              ? "Danh sách đơn chờ nhập kết quả"
              : "Danh sách đơn đã hoàn thành"}
            {/* THÊM: Hiển thị trạng thái highlight */}

          </h4>
          <input
            type="text"
            className="form-control w-25"
            placeholder="Tìm theo mã đơn"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="table-responsive bg-white shadow rounded">
          <table className="table table-bordered table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Người tạo đơn</th>
                <th>Loại đơn</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking) => {
                  // THÊM: Logic highlight
                  const isHighlighted = highlightedId === booking.id;

                  return (
                    <tr
                      key={booking.id}
                      data-booking-id={booking.id} // THÊM: Data attribute để tìm element
                      className={isHighlighted ? "table-info" : ""} // THÊM: Highlight màu xanh
                    >
                      <td>
                        {booking.code}
                      </td>
                      <td>{booking.customerName}</td>
                      <td>{booking.type === "CIVIL" ? "Dân sự" : "Hành chính"}</td>
                      <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                      <td className="text-success fw-semibold">
                        {tab === "PENDING" ? "Chờ nhập kết quả" : "Hoàn thành"}
                      </td>
                      <td>
                        {tab === "PENDING" ? (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEnterResult(booking.id)}
                          >
                            <i className="bi bi-pencil-square me-1" />
                            Nhập kết quả
                          </button>
                        ) : (
                          <div className="d-flex flex-column flex-md-row gap-2">
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleExportPDF(booking.id)}
                            >
                              <i className="bi bi-file-earmark-pdf me-1" />
                              Xem PDF
                            </button>
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleResendTrackingInfo(booking.id)}
                            >
                              <i className="bi bi-envelope-paper me-1" />
                              Gửi lại mã tra cứu
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">
                    {tab === "PENDING"
                      ? "Không có đơn nào cần nhập kết quả."
                      : "Không có đơn nào đã hoàn thành."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <ul className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}