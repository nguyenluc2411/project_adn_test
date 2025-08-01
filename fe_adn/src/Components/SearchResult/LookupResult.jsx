import React, { useState } from "react";
import axiosClient from "../../config/AxiosClient";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";

export default function LookupResult() {
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingPassword, setTrackingPassword] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await axiosClient.post("/api/adn-results/lookup", {
        trackingCode,
        trackingPassword,
      });
      console.log("✅ Full result từ API:", res.data);
      setResult(res.data);
    } catch (err) {
      setError("Không tìm thấy kết quả hoặc thông tin không đúng.");
    } finally {
      setLoading(false);
    }
  };

  const parsedLociResults = {};

  if (result && result.lociResults && result.participants) {
    const names = result.participants.map(p => p.fullName);

    for (const [locus, valueStr] of Object.entries(result.lociResults)) {
      const values = valueStr.split(" , ").map(s => s.trim());
      parsedLociResults[locus] = {};
      names.forEach((name, idx) => {
        parsedLociResults[locus][name] = values[idx] || "—";
      });
    }
  }


  return (
    <>
      <Header />
      <div
        className="d-flex justify-content-center align-items-center bg-light"
        style={{ height: "calc(100vh - 140px)", overflow: "hidden" }}
      >
        <div
          className="d-flex shadow-lg"
          style={{
            width: 960,
            height: 600,
            backgroundColor: "white",
            borderRadius: "2rem",
            overflow: "hidden",
          }}
        >
          {/* Trái - Thông điệp */}
          <div
            className="d-flex flex-column justify-content-center align-items-center text-white"
            style={{
              width: "30%",
              backgroundColor: "#6ea8fe",
              padding: "2rem",
            }}
          >
            <div className="text-center">
              <p className="mb-2" style={{ fontSize: 17 }}>
                Minh bạch – Bảo mật – Chính xác trong từng kết quả xét nghiệm
              </p>
              <p className="fw-bold" style={{ fontSize: 19 }}>
                <span style={{ color: "#e0e7ff" }}>ADN GENX</span> đồng hành cùng niềm tin của bạn.
              </p>
            </div>
            <div className="mt-4">
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  backgroundColor: "#588df7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                }}
              >
                <span style={{ fontSize: 36, color: "white", fontWeight: "bold" }}>ADN</span>
              </div>
            </div>
          </div>

          {/* Phải - Form tra cứu */}
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ width: "70%", padding: "2rem", overflowY: "auto" }}
          >
            <div style={{ width: "100%", maxWidth: 400 }}>
              <div className="text-center mb-4">
                <h3 className="fw-bold mb-2">Tra cứu kết quả ADN</h3>
                <p className="text-muted mb-3" style={{ fontSize: 14 }}>
                  Vui lòng nhập mã tra cứu và mật khẩu để xem kết quả xét nghiệm của bạn.
                </p>
              </div>

              <div className="mb-3">
                <input
                  className="form-control"
                  style={{ fontSize: 15, padding: "0.75rem 1rem" }}
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Mã tra cứu (VD: DNA-ABC123)"
                  autoFocus
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <input
                  className="form-control"
                  type="password"
                  style={{ fontSize: 15, padding: "0.75rem 1rem" }}
                  value={trackingPassword}
                  onChange={(e) => setTrackingPassword(e.target.value)}
                  placeholder="Mật khẩu tra cứu"
                  disabled={loading}
                />
              </div>
              <button
                className="btn btn-primary w-100 fw-bold py-2"
                onClick={handleLookup}
                disabled={loading || !trackingCode || !trackingPassword}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Đang tra cứu...
                  </>
                ) : (
                  "Tra cứu kết quả"
                )}
              </button>

              {error && (
                <div className="alert alert-danger mt-3 text-center">{error}</div>
              )}

              {result && (
                <div className="mt-4">
                  <div className="text-center mb-3">
                    <h5 className="fw-bold mt-2 text-success">Kết quả xét nghiệm của bạn</h5>
                  </div>
                  <div className="bg-light rounded-3 p-3 mb-2">
                    <div className="mb-2">
                      <span className="fw-semibold">Mã tra cứu:</span> {result.trackingCode}
                    </div>
                    <div className="mb-2">
                      <span className="fw-semibold">Ngày xét nghiệm:</span>{" "}
                      {result.createdAt ? new Date(result.createdAt).toLocaleDateString("vi-VN") : "Không rõ"}
                    </div>
                    <div className="mb-2">
                      <span className="fw-semibold">Kết luận:</span>{" "}
                      <span
                        className={
                          result.conclusion?.toLowerCase().includes("không")
                            ? "text-danger"
                            : "text-success"
                        }
                      >
                        {result.conclusion || "Chưa xác định"}
                      </span>
                    </div>

                    {Object.keys(parsedLociResults).length > 0 && (
                      <div className="mt-3">
                        <h6 className="fw-bold mb-2">Chi tiết kết quả Loci:</h6>
                        <div
                          className="border rounded p-2"
                          style={{ maxHeight: 300, overflowX: "auto", background: "#fff" }}
                        >
                          <table className="table table-sm table-bordered mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Locus</th>
                                {result.participants.map((p) => (
                                  <th key={p.id}>
                                    {p.fullName}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(parsedLociResults).map(([locus, valueMap]) => (
                                <tr key={locus}>
                                  <td>{locus}</td>
                                  {result.participants.map((p) => (
                                    <td key={p.id}>{valueMap[p.fullName] || "—"}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nút PDF */}
                  <div className="mt-3">
                    {result.bookingId && (
                      <a
                        href={`${import.meta.env.VITE_API_BASE_URL}/api/adn-results/export/${result.bookingId}`}
                        className="btn btn-outline-primary w-100"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        Xem hoặc tải file PDF kết quả
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
