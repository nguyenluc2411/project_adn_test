import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../config/AxiosClient";
import "../StaffDashboard.css";
import StaffSidebarNav from "../../Staff/StaffSidebarNav";

const sampleStatusLabels = {
  PENDING: "Chờ xử lý",
  KIT_SENT: "Đã gửi bộ kit",
  WAITING_FOR_COLLECTION: "Chờ lấy mẫu",
  CONFIRMED: "Đã lấy mẫu",
  REJECTED: "Bị từ chối",
  NEED_RECOLLECT: "Cần lấy lại mẫu",
};

const sampleStatusColors = {
  PENDING: "secondary",
  KIT_SENT: "primary",
  WAITING_FOR_COLLECTION: "warning",
  CONFIRMED: "success",
  REJECTED: "danger",
  NEED_RECOLLECT: "info",
};

const sampleTypeLabels = {
  BLOOD: "Máu",
  HAIR: "Tóc",
  NAIL: "Móng tay",
};

export default function SampleCollection() {
  const [bookings, setBookings] = useState([]);
  const [kitInputs, setKitInputs] = useState({});
  const [sampleTypes, setSampleTypes] = useState({});
  const [fingerprintFiles, setFingerprintFiles] = useState({});
  const [previewFingerprintLinks, setPreviewFingerprintLinks] = useState({});
  const [persistedFingerprintLinks, setPersistedFingerprintLinks] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [highlightedId, setHighlightedId] = useState(null); // Thêm state highlight
  const [searchParams, setSearchParams] = useSearchParams(); // Thêm useSearchParams

  // Tự động tìm và highlight đơn từ thông báo
  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (bookingId) {
      findPageOfBooking(bookingId);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBookings();
  }, [page]);

  // Reset highlight khi thay đổi search
  useEffect(() => {
  const delayDebounce = setTimeout(() => {
    setPage(1); // Reset về trang đầu
    fetchBookings();
  }, 300); // debounce 300ms

  return () => clearTimeout(delayDebounce);
}, [searchTerm]);

  // Scroll đến đơn được highlight sau khi bookings đã load
  useEffect(() => {
    if (highlightedId && bookings.length > 0) {
      const timer = setTimeout(() => {
        const element = document.querySelector(`[data-booking-id="${highlightedId}"]`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [highlightedId, bookings]);

  // Tìm trang chứa bookingId và highlight
  const findPageOfBooking = async (bookingId) => {
    let currentPage = 0;
    let found = false;

    while (!found) {
      try {
        const response = await axiosClient.get(
          `/api/v1/staff/booking/all?page=${currentPage}&size=${size}`
        );

        const bookings = response.data.content || [];
        if (bookings.length === 0) break;

        const match = bookings.find(booking => booking.id == bookingId);
        if (match) {
          setPage(currentPage + 1); // Chuyển đến đúng trang
          setHighlightedId(parseInt(bookingId)); // Highlight đơn
          found = true;
          // Xóa bookingId khỏi URL sau khi tìm thấy
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

  const fetchBookings = () => {
    axiosClient
      .get(`/api/v1/staff/booking/all`, {
        params: {
          page: page - 1,
          size,
          code: searchTerm || undefined,
        },
      })
      .then((res) => {
        const content = res.data.content || [];
        const safe = content.map((b) => ({
          ...b,
          participants: Array.isArray(b.participants) ? b.participants : [],
        }));
        setBookings(safe);
        setTotalPages(res.data.totalPages);

        const fingerprintMap = {};
        safe.forEach((b) => {
          b.participants.forEach((p) => {
            if (p.fingerprintImageUrl) fingerprintMap[p.id] = p.fingerprintImageUrl;
          });
        });
        setPersistedFingerprintLinks(fingerprintMap);
      })
      .catch((err) => console.error(err));
  };


  const handleKitInput = (participantId, value) => {
    setKitInputs((prev) => ({ ...prev, [participantId]: value }));
  };

  const handleSampleTypeChange = (participantId, value) => {
    setSampleTypes((prev) => ({ ...prev, [participantId]: value }));
  };

  const handleFingerprintChange = (participantId, file) => {
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreviewFingerprintLinks((prev) => ({
        ...prev,
        [participantId]: previewURL,
      }));
      setPersistedFingerprintLinks((prev) => {
        const updated = { ...prev };
        delete updated[participantId];
        return updated;
      });
    }
    setFingerprintFiles((prev) => ({ ...prev, [participantId]: file }));
  };

  const handleConfirm = async (booking, participant) => {
    // const kitCode = kitInputs[participant.id];
    const sampleType = sampleTypes[participant.id];
    const fingerprint = fingerprintFiles[participant.id];

    try {
      if (booking.collectionMethod === "HOSPITAL") {
        if (!sampleType) return;
        const formData = new FormData();
        formData.append("sampleType", sampleType);
        if (booking.caseType === "ADMINISTRATIVE" && fingerprint) {
          formData.append("fingerprintImage", fingerprint);
        }

        await axiosClient.put(
          `/api/v1/staff/sample-collection/participants/${participant.id}/kit-code`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else if (
        booking.collectionMethod === "HOME" &&
        participant.sampleStatus === "PENDING"
      ) {
        await axiosClient.put(
          `/api/v1/staff/sample-collection/participants/${participant.id}/send-kit`
        );
      } else if (
        booking.collectionMethod === "HOME" &&
        participant.sampleStatus === "WAITING_FOR_COLLECTION"
      ) {
        await axiosClient.put(
          `/api/v1/staff/sample-collection/${participant.id}/confirm`
        );
      }

      await fetchBookings();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendToLab = async (bookingId) => {
    try {
      await axiosClient.put(
        `/api/v1/staff/sample-collection/bookings/${bookingId}/send-to-lab`
      );
      fetchBookings();
    } catch (error) {
      console.error(error);
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
            <h4 className="fw-bold mb-3"> Ghi nhận mẫu</h4>

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Tìm mã đơn"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {bookings.map((booking) => {
              const allConfirmed =
                booking.participants?.length > 0 &&
                booking.participants.every(
                  (p) => p.sampleStatus === "CONFIRMED"
                );

              return (
                <div
                  key={booking.id}
                  data-booking-id={booking.id}
                  className={`card mb-4 shadow-sm ${highlightedId === booking.id ? "border-primary border-3 bg-light" : ""
                    }`}
                >
                  <div className="card-body">
                    <h5 className="card-title">
                      Đơn #{booking.code} – {booking.customerName}
                    </h5>
                    <p className="card-subtitle mb-2 text-muted">
                      Hình thức lấy mẫu:{" "}
                      <strong>
                        {booking.collectionMethod === "HOME"
                          ? "TỰ THU TẠI NHÀ"
                          : "TẠI BỆNH VIỆN"}
                      </strong>
                    </p>
                    <p className="card-subtitle mb-2 text-muted">
                      Loại đơn:{" "}
                      <strong>
                        {booking.caseType === "CIVIL"
                          ? "DÂN SỰ"
                          : booking.caseType === "ADMINISTRATIVE"
                            ? "HÀNH CHÍNH"
                            : "—"}
                      </strong>
                    </p>
                    <p>
                      Trạng thái đơn:{" "}
                      <span className="badge bg-info">
                        {booking.sampleCollectionStatus || "COLLECTING"}
                      </span>
                    </p>

                    <div className="table-responsive">
                      <table className="table table-bordered table-sm">
                        <thead className="table-light">
                          <tr>
                            <th>Họ tên</th>
                            {booking.caseType !== "CIVIL" && <th>CMND/CCCD</th>}
                            <th>Mã kit</th>
                            <th>Loại mẫu</th>

                            {booking.caseType === "ADMINISTRATIVE" && (
                              <th>Vân tay</th>
                            )}
                            <th>Trạng thái mẫu</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {booking.participants.map((p) => {
                            const color = sampleStatusColors[p.sampleStatus] || "secondary";
                            const label = sampleStatusLabels[p.sampleStatus] || "Không xác định";

                            const allowPrepare = p.sampleStatus === "PENDING" && p.kitStatus !== "CREATED";
                            const allowEditAfterPrepare = p.kitStatus === "ASSIGNED";
                            const allowConfirm = p.sampleStatus === "WAITING_FOR_COLLECTION";
                            const allowCancel = p.kitStatus === "CREATED";
                            const showFingerprintInput = p.sampleStatus !== "CONFIRMED" && allowEditAfterPrepare && booking.caseType === "ADMINISTRATIVE";

                            return (
                              <tr key={p.id}>
                                <td>{p.fullName}</td>

                                {booking.caseType !== "CIVIL" && (
                                  <td>{p.identityNumber || "—"}</td>
                                )}

                                <td>{p.kitCode || <i>—</i>}</td>

                                <td>
                                  {booking.collectionMethod === "HOSPITAL" && allowEditAfterPrepare &&
                                    p.sampleStatus !== "CONFIRMED" ? (
                                    <select
                                      className="form-select form-select-sm"
                                      value={sampleTypes[p.id] || ""}
                                      onChange={(e) =>
                                        handleSampleTypeChange(p.id, e.target.value)
                                      }
                                    >
                                      <option value="">--Chọn--</option>
                                      <option value="BLOOD">Máu</option>
                                      <option value="HAIR">Tóc</option>
                                      <option value="NAIL">Móng tay</option>
                                    </select>
                                  ) : (
                                    sampleTypeLabels[p.sampleType] || <i>—</i>
                                  )}
                                </td>


                                {booking.caseType === "ADMINISTRATIVE" && (
                                  <td>
                                    {showFingerprintInput ? (
                                      <>
                                        <input
                                          key={p.id}
                                          type="file"
                                          className="form-control form-control-sm"
                                          accept="image/*"
                                          onChange={(e) =>
                                            handleFingerprintChange(p.id, e.target.files[0])
                                          }
                                        />
                                        {previewFingerprintLinks[p.id] && (
                                          <div className="mt-1 d-flex align-items-center gap-2">
                                            <img
                                              src={previewFingerprintLinks[p.id]}
                                              alt="Preview"
                                              style={{
                                                width: 60,
                                                height: 60,
                                                objectFit: "cover",
                                                borderRadius: 4,
                                              }}
                                            />
                                            <button
                                              className="btn btn-sm btn-outline-danger"
                                              onClick={() => {
                                                setFingerprintFiles((prev) => {
                                                  const updated = { ...prev };
                                                  delete updated[p.id];
                                                  return updated;
                                                });
                                                setPreviewFingerprintLinks((prev) => {
                                                  URL.revokeObjectURL(prev[p.id]);
                                                  const updated = { ...prev };
                                                  delete updated[p.id];
                                                  return updated;
                                                });
                                              }}
                                            >
                                              ❌ Xóa
                                            </button>
                                          </div>
                                        )}
                                      </>
                                    ) : persistedFingerprintLinks[p.id] ? (
                                      <a
                                        href={persistedFingerprintLinks[p.id]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        Xem ảnh
                                      </a>
                                    ) : (
                                      <i>—</i>
                                    )}
                                  </td>
                                )}

                                <td>
                                  <span className={`badge bg-${color}`}>
                                    {label}
                                  </span>
                                </td>

                                <td>
                                  <div className="d-flex gap-2 flex-wrap">
                                    {/* CHUẨN BỊ KIT – dùng chung cho cả bệnh viện và tại nhà */}
                                    {p.sampleStatus === "PENDING" && p.kitStatus !== "CREATED" && (
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={async () => {
                                          try {
                                            await axiosClient.post(
                                              `/api/v1/staff/sample-collection/participants/${p.id}/prepare-kit`
                                            );
                                            await fetchBookings();
                                          } catch (e) {
                                            console.error("Lỗi khi chuẩn bị kit:", e);
                                          }
                                        }}
                                      >
                                        Chuẩn bị kit
                                      </button>
                                    )}

                                    {/* DÙNG – CHỈ DÙNG CHO BỆNH VIỆN */}
                                    {booking.collectionMethod === "HOSPITAL" &&
                                      p.sampleStatus === "PENDING" &&
                                      p.kitStatus === "CREATED" && (
                                        <button
                                          className="btn btn-sm btn-success"
                                          onClick={async () => {
                                            try {
                                              await axiosClient.put(
                                                `/api/v1/staff/sample-collection/participants/${p.id}/assign-kit`
                                              );
                                              await fetchBookings();
                                            } catch (e) {
                                              console.error("Lỗi khi gán kit:", e);
                                            }
                                          }}
                                        >
                                          Dùng
                                        </button>
                                      )}

                                    {/* GỬI KIT – CHỈ DÙNG CHO TẠI NHÀ */}
                                    {booking.collectionMethod === "HOME" &&
                                      p.sampleStatus === "PENDING" &&
                                      p.kitStatus === "CREATED" && (
                                        <button
                                          className="btn btn-sm btn-success"
                                          onClick={async () => {
                                            try {
                                              await axiosClient.put(
                                                `/api/v1/staff/sample-collection/participants/${p.id}/send-kit`
                                              );
                                              await fetchBookings();
                                            } catch (e) {
                                              console.error("Lỗi khi gửi kit:", e);
                                            }
                                          }}
                                        >
                                          Gửi kit cho khách hàng
                                        </button>
                                      )}

                                    {/* HỦY KIT – nếu kit đã tạo mà chưa gửi hoặc chưa dùng */}
                                    {p.kitStatus === "CREATED" &&
                                      p.sampleStatus === "PENDING" && (
                                        <button
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={async () => {
                                            try {
                                              await axiosClient.delete(
                                                `/api/v1/staff/sample-collection/participants/${p.id}/cancel-kit`
                                              );
                                              await fetchBookings();
                                            } catch (e) {
                                              console.error("Lỗi khi hủy kit:", e);
                                            }
                                          }}
                                        >
                                          Hủy
                                        </button>
                                      )}

                                    {/* XÁC NHẬN – cả bệnh viện và tại nhà (sau khi đã gán kit) */}
                                    {(p.sampleStatus === "WAITING_FOR_COLLECTION" &&
                                      p.kitStatus === "ASSIGNED") && (
                                        <button
                                          className="btn btn-sm btn-primary"
                                          onClick={() => handleConfirm(booking, p)}
                                        >
                                          Xác nhận
                                        </button>
                                      )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {allConfirmed && (
                      <div className="text-end mt-2">
                        {booking.sampleCollectionStatus === "SENT_TO_LAB" || booking.sampleCollectionStatus === "COMPLETED" ? (
                          <span className="text-success fw-semibold">
                            ✅ Mẫu đã gửi tới phòng xét nghiệm
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleSendToLab(booking.id)}
                          >
                            Gửi mẫu đến phòng xét nghiệm
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

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
          </main>
        </div>
      </div>
    </div>
  );
}