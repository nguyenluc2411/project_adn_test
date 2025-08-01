import React, { useEffect, useState } from "react";
import axiosClient from "../config/AxiosClient";
import { useLocation, useNavigate } from "react-router-dom";
import LabSidebarNav from "../Lab/LabSidebarNav";

const LOCUS_LIST = [
  "Amelogenin", "D3S1358", "D1S1656", "D2S441", "D10S1248", "D13S317", "Penta E",
  "D16S539", "D18S51", "D2S1338", "CSF1PO", "Penta D", "TH01", "vWA", "D21S11",
  "D7S820", "D5S818", "TPOX", "DYS391", "D8S1179", "D12S391", "D19S433", "FGA", "D22S1045"
];

export default function EnterResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = location.state?.bookingId || sessionStorage.getItem("bookingId");

  const [participants, setParticipants] = useState([]);
  const [conclusion, setConclusion] = useState("");
  const [conclusionType, setConclusionType] = useState(""); // "yes", "no", "custom"
  const [lociData, setLociData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showConfirmModal ? "hidden" : "auto";
  }, [showConfirmModal]);

  useEffect(() => {
    const load = async () => {
      if (!bookingId) {
        alert("Không tìm thấy mã đơn.");
        navigate("/lab/dashboard");
        return;
      }

      try {
        const res = await axiosClient.get(`/api/adn-results/booking/${bookingId}/participants`);
        setParticipants(res.data);
        setShowForm(true);
      } catch (err) {
        alert("Không thể tải dữ liệu người tham gia.");
        console.error("Lỗi khi tải participants:", err);
      }
    };

    load();
  }, [bookingId, navigate]);

  const handleLocusChange = (locus, kitCode, value) => {
    setLociData((prev) => ({
      ...prev,
      [`${locus}_${kitCode}`]: value,
    }));
  };

  // Xử lý thay đổi loại kết luận
  const handleConclusionTypeChange = (type) => {
    setConclusionType(type);

    if (type === "yes") {
      setConclusion("Có quan hệ huyết thống");
    } else if (type === "no") {
      setConclusion("Không đủ bằng chứng xác nhận quan hệ huyết thống");
    } else if (type === "custom") {
      setConclusion(""); // Reset để user tự nhập
    }
  };

  const handleSave = async () => {
    // Validate conclusion
    if (!conclusion.trim()) {
      alert("Vui lòng nhập kết luận.");
      return;
    }

    // Validate loci data (optional - có thể bỏ nếu không bắt buộc)
    const hasAnyData = LOCUS_LIST.some(locus =>
      participants.some(p => lociData[`${locus}_${p.kitCode}`]?.trim())
    );

    if (!hasAnyData) {
      const confirmProceed = window.confirm("Chưa có dữ liệu Locus nào được nhập. Bạn có muốn tiếp tục không?");
      if (!confirmProceed) return;
    }

    const lociResults = {};
    LOCUS_LIST.forEach((locus) => {
      const values = participants.map((p) => lociData[`${locus}_${p.kitCode}`] || "");
      if (values.some((v) => v.trim() !== "")) { // Thay đổi từ every thành some
        lociResults[locus] = values.join(" , ");
      }
    });

    const body = {
      bookingId: Number(bookingId),
      conclusion: conclusion.trim(),
      lociResults,
    };

    try {
      await axiosClient.post("/api/adn-results", body);
      await axiosClient.post(`/api/adn-results/complete-sample/${bookingId}`);

      alert("✅ Kết quả đã được lưu và trạng thái đơn đã cập nhật!");
      setIsSaved(true);
    } catch (err) {
      console.error("🔥 Lỗi khi gọi API:", err.response || err);
      alert("❌ Lỗi khi lưu kết quả hoặc cập nhật trạng thái.");
    }
  };

  const handleResendTrackingInfo = async () => {
    try {
      await axiosClient.post(`/api/adn-results/resend-tracking-info/${bookingId}`);
      alert("📨 Mã tra cứu đã được gửi lại cho khách hàng.");
    } catch (err) {
      console.error("❌ Lỗi khi gửi lại mã tra cứu:", err);
      alert("Không thể gửi lại mã tra cứu.");
    }
  };

  const handleExport = async () => {
    try {
      const res = await axiosClient.get(`/api/adn-results/export/${bookingId}`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      alert("Lỗi khi xuất PDF.");
      console.error(err);
    }
  };


  const handlePaste = (e, locus, kitCode) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData("text");

    const rows = pastedData.trim().split(/\r?\n/).map(row => row.split(/\t|,/).map(cell => cell.trim()));

    if (rows.length === 1) {
      // Dán 1 hàng (nhiều participant cùng 1 locus)
      const values = rows[0];
      const startCol = participants.findIndex(p => p.kitCode === kitCode);
      const updates = {};
      values.forEach((val, i) => {
        const participant = participants[startCol + i];
        if (participant) {
          updates[`${locus}_${participant.kitCode}`] = val;
        }
      });
      setLociData(prev => ({ ...prev, ...updates }));
    } else {
      // Dán nhiều hàng nhiều cột (bảng Excel)
      const startRow = LOCUS_LIST.findIndex(l => l === locus);
      const startCol = participants.findIndex(p => p.kitCode === kitCode);
      const updates = {};

      rows.forEach((cols, rowIdx) => {
        const currentLocus = LOCUS_LIST[startRow + rowIdx];
        if (!currentLocus) return;
        cols.forEach((val, colIdx) => {
          const participant = participants[startCol + colIdx];
          if (participant) {
            updates[`${currentLocus}_${participant.kitCode}`] = val;
          }
        });
      });

      setLociData(prev => ({ ...prev, ...updates }));
    }
  };


  const handleBulkPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text/plain");

    const lines = pastedText.trim().split(/\r?\n/);
    const updates = {};

    lines.forEach((line) => {
      // Dòng hợp lệ: có locus + giá trị người 1 + người 2 + ...
      const parts = line.trim().split(/\s{2,}|\t+/).map(part => part.trim());

      if (parts.length < 2) return; // Không có dữ liệu
      const locusName = parts[0];
      const values = parts.slice(1);

      if (!LOCUS_LIST.includes(locusName)) return;

      values.forEach((val, idx) => {
        const participant = participants[idx];
        if (participant) {
          updates[`${locusName}_${participant.kitCode}`] = val;
        }
      });
    });

    if (Object.keys(updates).length === 0) {
      alert("⚠️ Không tìm thấy dữ liệu hợp lệ trong đoạn dán.");
      return;
    }

    setLociData((prev) => ({ ...prev, ...updates }));
  };


  return (
    <div className="d-flex">
      <div className="p-3 border-end" style={{ width: "260px", minHeight: "100vh", background: "#f8f9fa" }}>
        <LabSidebarNav />
      </div>

      <div className="p-4 flex-grow-1 container">
        <h4 className="fw-bold mb-3">Nhập kết quả xét nghiệm ADN</h4>

        {participants.length > 0 && (
          <div className="mb-3">
            <p><strong>Số người tham gia:</strong> {participants.length}</p>
            <ul className="list-group mb-3">
              {participants.map((p, i) => (
                <li key={p.kitCode} className="list-group-item">
                  Người {i + 1}: <strong>{p.fullName}</strong> ({p.relationship}) – <code>{p.kitCode}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mb-4">
          <label className="form-label fw-bold">📋 Dán toàn bộ dữ liệu Locus:</label>
          <textarea
            className="form-control"
            rows={6}
            placeholder="Dán dữ liệu bảng gồm tên locus và giá trị của từng người, ví dụ:\nD7S820        18-23    10-12    18-23"
            onPaste={(e) => handleBulkPaste(e)}
          />
        </div>

        {showForm && (
          <>
            <div className="table-responsive mb-4">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Locus</th>
                    {participants.map((p) => (
                      <th key={p.kitCode}>
                        {p.fullName}<br /><small>{p.relationship} – {p.kitCode}</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LOCUS_LIST.map((locus) => (
                    <tr key={locus}>
                      <td><strong>{locus}</strong></td>
                      {participants.map((p) => (
                        <td key={`${locus}_${p.kitCode}`}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            disabled={isSaved}
                            value={lociData[`${locus}_${p.kitCode}`] || ""}
                            onChange={(e) => handleLocusChange(locus, p.kitCode, e.target.value)}
                            onPaste={(e) => handlePaste(e, locus, p.kitCode)}
                            onClick={(e) => e.target.select()}
                            placeholder="Nhập giá trị"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* KẾT LUẬN - ĐÃ SỬA */}
            <div className="mb-4">
              <label className="form-label fw-bold">Kết luận:</label>

              {/* Radio buttons */}
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="conclusionType"
                    value="yes"
                    id="conclusionYes"
                    disabled={isSaved}
                    checked={conclusionType === "yes"}
                    onChange={(e) => handleConclusionTypeChange(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="conclusionYes">
                    Có quan hệ huyết thống
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="conclusionType"
                    value="no"
                    id="conclusionNo"
                    disabled={isSaved}
                    checked={conclusionType === "no"}
                    onChange={(e) => handleConclusionTypeChange(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="conclusionNo">
                    Không đủ bằng chứng xác nhận quan hệ huyết thống
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="conclusionType"
                    value="custom"
                    id="conclusionCustom"
                    disabled={isSaved}
                    checked={conclusionType === "custom"}
                    onChange={(e) => handleConclusionTypeChange(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="conclusionCustom">
                    Kết luận chi tiết (tự nhập)
                  </label>
                </div>
              </div>

              {/* Textarea for conclusion */}
              <div className="mb-3">
                <label className="form-label">
                  {conclusionType === "custom" ? "Nhập kết luận chi tiết:" : "Kết luận:"}
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  disabled={isSaved || (conclusionType !== "custom" && conclusionType !== "")}
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  placeholder={
                    conclusionType === "custom"
                      ? "VD: Người 1 và Người 2 có quan hệ huyết thống. Người 3 không có quan hệ với Người 1..."
                      : "Kết luận sẽ hiển thị ở đây"
                  }
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="mb-4 d-flex gap-2 flex-wrap">
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isSaved || !conclusion.trim()}
                className={`btn ${isSaved ? "btn-secondary" : "btn-primary"}`}
              >
                💾 {isSaved ? "Đã lưu" : "Lưu kết quả"}
              </button>

              <button
                onClick={handleExport}
                disabled={!isSaved}
                className="btn btn-outline-primary"
              >
                📄 Xuất PDF
              </button>

              {isSaved && (
                <button
                  onClick={handleResendTrackingInfo}
                  className="btn btn-outline-success"
                >
                  📩 Gửi lại mã tra cứu
                </button>
              )}
            </div>
          </>
        )}

        {/* CONFIRM MODAL */}
        {showConfirmModal && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Xác nhận lưu kết quả</h5>
                </div>
                <div className="modal-body">
                  <p>
                    ⚠️ Mọi thông tin sẽ được lưu và không thể thay đổi. <br />
                    <strong>Kết luận:</strong> {conclusion}
                  </p>
                  <p>Bạn có chắc muốn tiếp tục?</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                    Huỷ
                  </button>
                  <button className="btn btn-primary" onClick={() => {
                    setShowConfirmModal(false);
                    handleSave();
                  }}>
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}