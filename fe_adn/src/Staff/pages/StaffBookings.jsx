import { useEffect, useState } from "react";
import BookingDetailDialog from "../pages/BookingDetailDialog";
import StaffSidebarNav from "../../Staff/StaffSidebarNav";
import axiosClient from "../../config/AxiosClient";
import "../StaffDashboard.css";
import { useSearchParams } from "react-router-dom";

const bookingStatusOptions = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CANCELED", label: "Đã hủy" },
  { value: "COLLECTED", label: "Đã lấy mẫu" },
];

const statusLabels = {
  PENDING: "Đang chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COLLECTED: "Đã lấy mẫu",
  CANCELED: "Đã hủy",
};

const statusClasses = {
  PENDING: "badge bg-warning text-dark",
  CONFIRMED: "badge bg-info text-dark",
  COLLECTED: "badge bg-success",
  CANCELED: "badge bg-danger",
};

function StaffBookings() {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const rowsPerPage = 10;
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightedId, setHighlightedId] = useState(null);

  // Tự động tìm và mở chi tiết đơn từ thông báo
  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (bookingId) {
      findPageOfBooking(bookingId);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, searchText, page]);

  // Reset highlight khi thay đổi filter hoặc tìm kiếm
  useEffect(() => {
    setHighlightedId(null);
  }, [statusFilter, searchText]);

  // Tìm trang chứa bookingId và mở chi tiết
  const findPageOfBooking = async (bookingId) => {
    let currentPage = 0;
    let found = false;

    while (!found) {
      try {
        const response = await axiosClient.get("/api/v1/staff/booking", {
          params: {
            status: statusFilter || undefined,
            code: searchText || undefined,
            page: currentPage,
            size: rowsPerPage,
          },
        });

        const bookings = response.data.content;
        if (!bookings || bookings.length === 0) break;

        const match = bookings.find(booking => booking.id == bookingId);
        if (match) {
          setPage(currentPage + 1); // Chuyển đến đúng trang
          setHighlightedId(parseInt(bookingId)); // Highlight đơn

          // Mở chi tiết đơn
          const detailResponse = await axiosClient.get(`/api/v1/staff/booking/${bookingId}`);
          setSelectedBooking(detailResponse.data);
          setDialogOpen(true);
          found = true;

          // Xóa bookingId khỏi URL sau khi mở
          setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.delete("bookingId");
            return newParams;
          });
        } else {
          currentPage++;
          if (currentPage >= response.data.totalPages) break;
        }
      } catch (err) {
        console.error("❌ Lỗi khi tìm trang booking:", err);
        break;
      }
    }

    if (!found) {
      alert("Không tìm thấy đơn đăng ký này");
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axiosClient.get("/api/v1/staff/booking", {
        params: {
          status: statusFilter || undefined,
          code: searchText || undefined,
          paymentStatus: "PAID",
          page: page - 1,
          size: rowsPerPage,
        },
      });
      setBookings(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách đơn:", err);
    }
  };

  const handleOpenDetail = async (booking) => {
    try {
      const response = await axiosClient.get(`/api/v1/staff/booking/${booking.id}`);
      setSelectedBooking(response.data);
      setDialogOpen(true);
      setHighlightedId(booking.id); // Highlight khi mở chi tiết thủ công
    } catch (err) {
      alert("Không thể lấy chi tiết đơn");
    }
  };

  // Hàm đóng dialog NHƯNG GIỮ highlight
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBooking(null);
    // KHÔNG xóa highlightedId để giữ highlight cho người dùng biết
  };

  const handleConfirm = async (bookingId) => {
    try {
      await axiosClient.put(`/api/v1/staff/booking/${bookingId}/confirm`);

      // Cập nhật state bookings
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "CONFIRMED" } : b
        )
      );

      // Cập nhật selectedBooking nếu đang mở dialog
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: "CONFIRMED" }));
      }

      alert("Xác nhận đơn thành công!");
    } catch (err) {
      alert("Lỗi khi xác nhận đơn");
    }
  };

  return (
    <div className="staff-bg">
      <div className="container-fluid">
        <div className="row">
          <aside className="col-md-2 d-none d-md-block staff-sidebar">
            <StaffSidebarNav />
          </aside>

          <main className="col-md-10 ms-sm-auto px-4 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-3">
                <i className="bi bi-journal-text me-2 text-primary"></i>
                Các đơn đăng ký
              </h4>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  style={{ minWidth: 220 }}
                  placeholder="Tìm mã đơn"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPage(1);
                  }}
                />
                <select
                  className="form-control"
                  style={{ minWidth: 160 }}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  {bookingStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="card bg-primary bg-opacity-25 border-0 rounded-4 shadow-sm">
              <div className="card-header bg-primary bg-opacity-50 text-white fw-bold fs-5 rounded-top-4">
                <i className="bi bi-journal-text me-2"></i>
                Danh sách đơn đăng ký
              </div>

              <div className="table-responsive">
                <table className="table table-hover table-borderless mb-0">
                  <thead className="text-white">
                    <tr>
                      <th>Mã đơn</th>
                      <th>Người đăng ký</th>
                      <th>Dịch vụ</th>
                      <th>Loại Đơn</th>
                      <th>Hình thức</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {bookings.length > 0 ? (
                      bookings.map((b) => (
                        <tr
                          key={b.id}
                          className={highlightedId === b.id ? "table-info rounded-3" : ""}
                        >
                          <td>{b.code}</td>
                          <td>{b.customerName}</td>
                          <td>{b.serviceTypeName}</td>
                          <td>
                            {b.caseType === "CIVIL"
                              ? "Dân Sự"
                              : b.caseType === "ADMINISTRATIVE"
                                ? "Hành Chính"
                                : "—"}
                          </td>
                          <td>
                            {b.collectionMethod === "HOME"
                              ? "Tự thu tại nhà"
                              : b.collectionMethod === "HOSPITAL"
                                ? "Tại bệnh viện"
                                : "—"}
                          </td>
                          <td>
                            <span className={statusClasses[b.status]}>
                              {statusLabels[b.status]}
                            </span>
                          </td>
                          <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-outline-primary btn-sm me-2"
                              onClick={() => handleOpenDetail(b)}
                            >
                              Chi tiết
                            </button>
                            {b.status === "PENDING" ? (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleConfirm(b.id)}
                              >
                                Xác nhận
                              </button>
                            ) : (
                              <span className="text-muted">&mdash;</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted">
                          Không có đơn nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <nav className="d-flex justify-content-center mt-3">
                <ul className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${page === i + 1 ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <BookingDetailDialog
              open={dialogOpen}
              onClose={handleCloseDialog}
              booking={selectedBooking}
              onConfirm={handleConfirm}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default StaffBookings;