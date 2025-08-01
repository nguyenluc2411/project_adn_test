import { useEffect, useState } from "react";
import axiosClient from "../../config/AxiosClient";
import "../StaffDashboard.css";

const sampleStatusLabels = {
  PENDING: "Chờ xử lý",
  WAITING_FOR_COLLECTION: "Chờ lấy mẫu",
  CONFIRMED: "Đã lấy mẫu",
  REJECTED: "Bị từ chối",
  NEED_RECOLLECT: "Cần lấy lại mẫu",
};
const sampleStatusColors = {
  PENDING: "secondary",
  WAITING_FOR_COLLECTION: "warning",
  CONFIRMED: "success",
  REJECTED: "danger",
  NEED_RECOLLECT: "info",
};
const collectionStatusLabels = {
  COLLECTING: "Đang thu mẫu",
  SENT_TO_LAB: "Đã gửi lab",
  COMPLETED: "Hoàn tất",
  CANCELED: "Đã hủy",
};
const statusLabels = {
  PENDING: "Đang chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COLLECTED: "Đã lấy mẫu",
};

const statusClasses = {
  PENDING: "bg-warning",
  CONFIRMED: "bg-info",
  COLLECTED: "bg-success",
};

const collectionStatusColors = {
  COLLECTING: "warning",
  SENT_TO_LAB: "info",
  COMPLETED: "success",
  CANCELED: "danger",
};

export default function BookingDetailDialog({ open, onClose, booking }) {
  const [bookingDetail, setBookingDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !booking?.id) return;

    const fetchBookingDetail = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(
          `/api/v1/staff/booking/${booking.id}`
        );
        setBookingDetail(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết booking:", err);
        setBookingDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [open, booking?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!open) return null;

  if (loading || !bookingDetail) {
    return (
      <div className="staff-modal-overlay">
        <div className="staff-modal-container">
          <div className="staff-modal-header">
            <div className="staff-modal-title">Đang tải chi tiết đơn...</div>
          </div>
          <div className="staff-modal-body">
            <p>Vui lòng đợi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-modal-overlay">
      <div className="staff-modal-container">
        <div className="staff-modal-header">
          <div className="staff-modal-title">
            <i className="bi bi-file-earmark-text"></i>
            <span>Chi tiết đơn #{bookingDetail.code}</span>
          </div>
          <button className="staff-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="staff-modal-body">
          <div className="staff-booking-info">
            <div className="staff-info-grid">
              <div className="staff-info-item">
                <span className="staff-info-label">Người đăng ký:</span>
                <span className="staff-info-value">
                  {bookingDetail.customerName}
                </span>
              </div>
              <div className="staff-info-item">
                <span className="staff-info-label">Số điện thoại:</span>
                <span className="staff-info-value">
                  {bookingDetail.phoneNumber}
                </span>
              </div>
              <div className="staff-info-item">
                <span className="staff-info-label">Dịch vụ:</span>
                <span className="staff-info-value">
                  {bookingDetail.serviceTypeName}
                </span>
              </div>
              <div className="staff-info-item">
                <span className="staff-info-label">Loại Đơn:</span>
                <span className="staff-info-value">
                  {bookingDetail.caseType === "CIVIL"
                    ? "Dân Sự"
                    : bookingDetail.caseType === "ADMINISTRATIVE"
                    ? "Hành Chính"
                    : "—"}
                </span>
              </div>
              <div className="staff-info-item">
                <span className="staff-info-label">Hình thức lấy mẫu:</span>
                {/* code nay bi lap co the thay doi */}
                <span className="staff-info-value">
                  {bookingDetail.collectionMethod === "HOME"
                    ? "Tự thu tại nhà"
                    : bookingDetail.collectionMethod === "HOSPITAL"
                    ? "Tại bệnh viện"
                    : "—"}
                </span>
              </div>
              <div className="staff-info-item">
                <span className="staff-info-label">Trạng thái đơn:</span>
                <span
                  className={`staff-status-badge ${
                    statusClasses[bookingDetail.status]
                  }`}
                >
                  {statusLabels[bookingDetail.status]}
                </span>
              </div>
            </div>
          </div>

          <div className="staff-participants-section">
            <h6 className="staff-section-title">
              <i className="bi bi-people"></i>
              Danh sách người tham gia
            </h6>
            <div className="staff-table-container">
              <table className="staff-participants-table">
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    {bookingDetail.caseType !== "CIVIL" && (
                      <th>Số CMND/CCCD</th>
                    )}
                    <th>Mã kit</th>
                    <th>Nhân viên nhập</th>
                    <th>Thời gian nhập</th>
                    <th>Trạng thái mẫu</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingDetail.participants.map((p) => (
                    <tr key={p.id}>
                      <td>{p.fullName}</td>
                      {bookingDetail.caseType !== "CIVIL" && (
                        <td>{p.identityNumber}</td>
                      )}
                      <td>
                        {p.kitCode || (
                          <span className="staff-empty-text">Chưa có</span>
                        )}
                      </td>
                      <td>
                        {p.kitEnteredByName || (
                          <span className="staff-empty-text">—</span>
                        )}
                      </td>
                      <td>{formatDate(p.kitEnteredAt)}</td>
                      <td>
                        <span
                          className={`staff-status-badge ${
                            sampleStatusColors[p.sampleStatus]
                          }`}
                        >
                          {sampleStatusLabels[p.sampleStatus]}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookingDetail.participants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="staff-empty-row">
                        Không có người tham gia
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="staff-modal-footer">
          <button className="staff-btn-close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
