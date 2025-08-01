import React, { useState, useEffect } from "react";
import axiosClient from "../config/AxiosClient";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useSearchParams } from "react-router-dom";

export default function ListPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [kitInputs, setKitInputs] = useState({});
  const [highlightedId, setHighlightedId] = useState(null);

  const [page, setPage] = useState(1); // Phân trang
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [retryLoading, setRetryLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  // 👈 tự động mở chi tiết nếu có bookingId
  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (bookingId) {
      // fetchDetail(bookingId);
      findPageOfBooking(bookingId);
    }
  }, [searchParams]);

  const closeModal = () => {
    setSelectedOrder(null); // Đóng modal
    if (searchParams.has("bookingId")) {
      searchParams.delete("bookingId"); // Xóa bookingId khỏi URL
      setSearchParams(searchParams); // Cập nhật URL
    }
  };

  // Tìm trang chứa bookingId và mở chi tiết
  const findPageOfBooking = async (bookingId) => {
    let currentPage = 0;
    let found = false;

    while (!found) {
      try {
        const res = await axiosClient.get(`/api/registrations?page=${currentPage}&size=${size}`);
        const orders = res.data.content;

        if (!orders || orders.length === 0) break;

        const match = orders.find(order => order.id == bookingId);
        if (match) {
          setPage(currentPage + 1); // Chuyển đến đúng trang
          setHighlightedId(bookingId);
          fetchDetail(bookingId);
          found = true;
        } else {
          currentPage++;
          if (currentPage >= res.data.totalPages) break;
        }
      } catch (err) {
        console.error("❌ Lỗi khi tìm trang booking:", err);
        break;
      }
    }

    if (!found) {
      alert("Không tìm thấy đơn chứa mã booking này");
    }
  };


  // Tải danh sách đơn đăng ký
  const loadOrders = async () => {
    setLoading(true);
    setMessage("");
    try {
      const url = `/api/registrations?page=${page - 1}&size=${size}${statusFilter ? `&status=${statusFilter}` : ""
        }`;
      const res = await axiosClient.get(url);
      const data = res.data;
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách đơn:", err);
      setMessage("Lỗi khi tải danh sách đơn đăng ký");
    } finally {
      setLoading(false);
    }
  };

  const [canView, setCanView] = useState(false);

  const fetchDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await axiosClient.get(`/api/registrations/${id}`);
      const order = res.data;
      setSelectedOrder(order);
      console.log("📦 selectedOrder:", order);
      setHighlightedId(order.id);

      const kits = {};
      order?.participants?.forEach((p) => {
        if (!p.kitCode && p.sampleStatus === "KIT_SENT") {
          kits[p.id] = { kitCode: "", sampleType: "" };
        }
      });
      setKitInputs(kits);

      const ok = await canViewResult(order);
      setCanView(ok);
    } catch (err) {
      console.error("❌ Lỗi khi lấy chi tiết đơn:", err);
      alert("Không thể tải chi tiết đơn");
    } finally {
      setDetailLoading(false);
    }
  };


  const cancelOrder = async (bookingId) => {
    if (!window.confirm("⚠️ Bạn có chắc chắn muốn hủy đơn này không?")) return;
    try {
      await axiosClient.put(`/api/registrations/${bookingId}/cancel`);
      alert("✅ Hủy đơn thành công");
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      console.error("❌ Hủy đơn thất bại:", err);
      alert("❌ Hủy đơn thất bại");
    }
  };

  const updateKitCode = async (participantId) => {
    const input = kitInputs[participantId];
    if (!input?.sampleType) {
      alert("⚠️Vui lòng lấy mẫu theo đúng mã kit dán trên ống nghiệm.");
      return;
    }
    if (
      !window.confirm(
        "⚠️ Bạn sẽ không thể thay đổi thông tin sau khi lưu. Bạn có chắc chắn muốn lưu không?"
      )
    )
      return;
    try {
      const formData = new FormData();

      formData.append("sampleType", input.sampleType);
      await axiosClient.put(
        `/api/v1/customer/sample-collection/participants/${participantId}/kit-code`,
        formData
      );
      fetchDetail(selectedOrder.id);
    } catch (err) {
      console.error("❌ Lỗi khi nhập kit:", err);
      alert("Không thể lưu mã kit");
    }
  };

  const formatStatus = (status) => {
    const map = {
      PAID: { label: "Đã thanh toán", className: "badge bg-success" },
      UNPAID: { label: "Chưa thanh toán", className: "badge bg-secondary" },
      PENDING: { label: "Đang chờ", className: "badge bg-warning text-dark" },
      FAILED: { label: "Thất bại", className: "badge bg-danger" },
      CANCELLED: { label: "Đã hủy", className: "badge bg-dark" },
    };

    const item = map[status];
    if (!item)
      return <span className="badge bg-light text-dark">Không rõ</span>;

    return <span className={item.className}>{item.label}</span>;
  };

  const formatSampleType = (sampleType) => {
    const map = {
      BLOOD: "Máu",
      NAIL: "Móng",
      HAIR: "Tóc",
    };
    return map[sampleType] || sampleType || "Không rõ";
  };

  const formatGender = (gender) => {
    const map = {
      MALE: "Nam",
      FEMALE: "Nữ",
      OTHER: "Khác",
    };
    return map[gender] || "Không";
  };

  const formatCollectionMethod = (method) => {
    const map = {
      HOME: "Tại nhà",
      HOSPITAL: "Tại bệnh viện",
      CIVIL: "Dân sự",
      ADMINISTRATIVE: "Hành chính",
    };
    return map[method] || "Không";
  };

  const formatSampleStatus = (status) => {
    const map = {
      PENDING: "Đang chờ xử lí",
      KIT_SENT: "Yêu cầu thu mẫu",
      WAITING_FOR_COLLECTION: "Chờ xác nhận mẫu",
      CONFIRMED: "Xác nhận",
    };
    return map[status] || "Không";
  };

  const formatValue = (value) => {
    return !value || (typeof value === "string" && value.trim() === "")
      ? "Không"
      : value;
  };

const formatDate = (dateStr) => {
  if (!dateStr) return "Không";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;

  if (dateStr.length > 10) {
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("vi-VN");
};

  const renderCMND = (p) => {
    if (!p.identityNumber && !p.issueDate && !p.issuePlace) return null;
    let extras = [];
    if (p.issueDate) extras.push(formatValue(p.issueDate));
    if (p.issuePlace) extras.push(formatValue(p.issuePlace));
    return (
      <p>
        <strong>CMND:</strong> {formatValue(p.identityNumber)}
        {extras.length ? ` (${extras.join(", ")})` : ""}
      </p>
    );
  };

  const handleViewResult = async (orderId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axiosClient.get(`/api/adn-results/export/${orderId}`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("❌ Lỗi khi xem kết quả:", err);
      alert("❌ Không thể xem kết quả. Có thể đơn chưa có kết quả hoặc chưa hoàn thành.");
    }
  };

  const canViewResult = (order) => {
    return (
      order.paymentStatus === "PAID" &&
      order.status === "CONFIRMED" &&
      order.sampleCollectionStatus === "COMPLETED"
    );
  };

  const retryPayment = async (bookingId) => {
    setRetryLoading(true);
    try {
      const res = await axiosClient.post(`/api/vnpay/retry-payment/${bookingId}`);
      if (res.data?.result?.paymentUrl) {
        window.location.href = res.data.result.paymentUrl;
      } else {
        alert(" Không lấy được link thanh toán");
      }
    } catch (err) {
      console.error(" Lỗi khi tạo lại thanh toán:", err);
      alert(" Không thể tạo lại thanh toán");
    } finally {
      setRetryLoading(false);
    }
  };

  return (
    <Header>
      <div className="gradient-background-blue">
        <div className="container py-4">
          <div className="bg-white shadow-sm rounded p-4">
            <h2 className="fw-bold mb-4">Danh sách đơn đăng ký</h2>
            {message && (
              <div
                className={`alert ${message.includes("thành công")
                  ? "alert-success"
                  : "alert-danger"
                  } text-center`}
              >
                {message}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <label className="me-2 mb-0">Lọc trạng thái:</label>
                <select
                  className="form-select form-select-sm d-inline-block w-auto"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1); // Reset về trang 1 khi đổi filter
                  }}
                >
                  <option value="">Tất cả</option>
                  <option value="PAID">Đã thanh toán</option>
                  <option value="UNPAID">Chưa thanh toán</option>
                  <option value="PENDING">Đang chờ</option>
                  <option value="FAILED">Thất bại</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
            </div>

            <table className="table table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Dịch vụ</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order.id} className={highlightedId === order.id ? "table-info" : ""}>
                    <td>{(page - 1) * size + index + 1}</td>
                    <td>#{order.code}</td>
                    <td>{formatValue(order.customerName)}</td>
                    <td>{formatValue(order.serviceTypeName)}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{formatStatus(order.paymentStatus)}</td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => fetchDetail(order.id)}
                        >
                          Chi tiết
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Phân trang */}
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
          </div>
        </div>

        {/* Modal chi tiết */}
        {selectedOrder && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            // onClick={() => setSelectedOrder(null)}
            onClick={() => closeModal()}
          >
            <div
              className="modal-dialog modal-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header bg-info text-white">
                  <h5 className="modal-title">
                    Chi tiết đơn #{selectedOrder.code}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => closeModal()}
                  ></button>
                </div>
                <div className="modal-body">
                  {detailLoading ? (
                    <p>Đang tải...</p>
                  ) : (
                    <>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <p>
                            <strong>Khách hàng:</strong>{" "}
                            {formatValue(selectedOrder.customerName)}
                          </p>
                          <p>
                            <strong>Điện thoại:</strong>{" "}
                            {formatValue(selectedOrder.phoneNumber)}
                          </p>
                          <p>
                            <strong>Email:</strong>{" "}
                            {formatValue(selectedOrder.email)}
                          </p>
                          <p>
                            <strong>Ngày tạo đơn:</strong>{" "}
                            {formatDate(selectedOrder.createdAt)}
                          </p>
                          <p>
                            <strong>Ngày hẹn:</strong>{" "}
                            {formatDate(selectedOrder.appointmentDate)}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p>
                            <strong>Ghi nhận:</strong>{" "}
                            {formatValue(selectedOrder.recordStaffName)}
                          </p>
                          <p>
                            <strong>Dịch vụ:</strong>{" "}
                            {formatValue(selectedOrder.serviceTypeName)}
                          </p>
                          <p>
                            <strong>Hình thức lấy mẫu:</strong>{" "}
                            {formatCollectionMethod(
                              selectedOrder.collectionMethod
                            )}
                          </p>
                          <p>
                            <strong>Loại Đơn:</strong>{" "}
                            {formatCollectionMethod(selectedOrder.caseType)}
                          </p>
                        </div>
                      </div>
                      <h5 className="text-primary">Người tham gia</h5>
                      <div className="row">
                        {selectedOrder.participants.map((p) => (
                          <div className="col-md-6" key={p.id}>
                            <div className="border p-3 rounded mb-3">
                              <p>
                                <strong>Họ tên:</strong> {formatValue(p.fullName)}
                              </p>
                              <p>
                                <strong>Năm sinh:</strong>{" "}
                                {formatValue(p.yearOfBirth)} |{" "}
                                <strong>Giới tính:</strong>{" "}
                                {formatGender(p.gender)}
                              </p>
                              <p>
                                <strong>Quan hệ:</strong>{" "}
                                {formatValue(p.relationship)}
                              </p>
                              {renderCMND(p)}
                              <p>
                                <strong>Trạng thái mẫu:</strong>{" "}
                                {formatSampleStatus(p.sampleStatus)}
                              </p>

                              {p.sampleStatus === "KIT_SENT" && !p.sampleType ? (
                                <>
                                  {p.kitCode && (
                                    <p>
                                      <strong>Mã kit:</strong> {p.kitCode}
                                    </p>
                                  )}
                                  <select
                                    className="form-select form-select-sm mb-2"
                                    value={kitInputs[p.id]?.sampleType || ""}
                                    onChange={(e) => {
                                      setKitInputs((prev) => ({
                                        ...prev,
                                        [p.id]: {
                                          sampleType: e.target.value,
                                        },
                                      }));
                                    }}
                                  >
                                    <option value="">-- Chọn loại mẫu --</option>
                                    <option value="BLOOD">Máu</option>
                                    <option value="NAIL">Móng</option>
                                    <option value="HAIR">Tóc</option>
                                  </select>
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => updateKitCode(p.id)}
                                  >
                                    Lưu
                                  </button>
                                </>
                              ) : p.sampleType ? (
                                <>
                                  {p.kitCode && (
                                    <p>
                                      <strong>Mã kit:</strong> {p.kitCode}
                                    </p>
                                  )}
                                  <p>
                                    <strong>Loại mẫu:</strong> {formatSampleType(p.sampleType)}
                                  </p>
                                  <p className="text-success fw-semibold">✅ Đã ghi nhận loại mẫu</p>
                                </>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  {selectedOrder.paymentStatus === "PAID" && selectedOrder.status === "PENDING" &&
                    (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => cancelOrder(selectedOrder.id)}
                        disabled={loading}
                      >
                        Hủy đơn
                      </button>
                    )}

                  {canView && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleViewResult(selectedOrder.id)}
                    >
                      <i className="bi bi-file-earmark-pdf me-1"></i>
                      Xem kết quả
                    </button>
                  )}

                  {["UNPAID", "FAILED", "PENDING"].includes(selectedOrder.paymentStatus) && (
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => retryPayment(selectedOrder.id)}
                      disabled={loading}
                    >
                      Thanh toán lại
                    </button>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={closeModal}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </Header>
  );
}