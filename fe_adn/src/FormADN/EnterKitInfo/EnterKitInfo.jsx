import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../../config/AxiosClient";
import { useAuth } from "../../Context/AuthContext";

export default function EnterKitInfo() {
  const [searchParams] = useSearchParams();
  const participantId = searchParams.get("participantId");

  const [kitCode, setKitCode] = useState("");
  const [sampleType, setSampleType] = useState("HAIR");
  const [message, setMessage] = useState("");
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(false);

  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const res = await axiosClient.get(
          `/api/v1/customer/sample-collection/participants/${participantId}`,
          {
            headers: {
              Authorization: "Bearer " + accessToken,
            },
          }
        );
        setParticipant(res.data);
      } catch (err) {
        setMessage("Không thể lấy thông tin người tham gia.");
        console.error(err);
      }
    };

    if (participantId && accessToken) {
      fetchParticipant();
    }
  }, [participantId, accessToken]);

  const handleSubmit = async () => {
    if (!kitCode.trim()) {
      setMessage("Vui lòng nhập mã kit.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await axiosClient.put(
        `/api/v1/customer/sample-collection/participants/${participantId}/kit-code`,
        {
          kitCode,
          sampleType,
        },
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      );
      setMessage("✅ Gửi thông tin kit thành công!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Gửi thông tin kit thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3>Nhập thông tin kit</h3>
      {participant && (
        <p>
          Người tham gia: <strong>{participant.fullName}</strong>
        </p>
      )}

      <div className="mb-3">
        <label className="form-label">Mã kit</label>
        <input
          type="text"
          className="form-control"
          placeholder="Nhập mã kit..."
          value={kitCode}
          onChange={(e) => setKitCode(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Loại mẫu</label>
        <div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              id="hair"
              value="HAIR"
              checked={sampleType === "HAIR"}
              onChange={(e) => setSampleType(e.target.value)}
            />
            <label className="form-check-label" htmlFor="hair">
              Tóc
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              id="nail"
              value="NAIL"
              checked={sampleType === "NAIL"}
              onChange={(e) => setSampleType(e.target.value)}
            />
            <label className="form-check-label" htmlFor="nail">
              Móng tay
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              id="blood"
              value="BLOOD"
              checked={sampleType === "BLOOD"}
              onChange={(e) => setSampleType(e.target.value)}
            />
            <label className="form-check-label" htmlFor="blood">
              Máu
            </label>
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        Gửi thông tin kit
      </button>

      {message && <div className="mt-3 alert alert-info">{message}</div>}

      {message.includes("✅") && (
        <button
          className="btn btn-outline-secondary mt-3"
          onClick={() => navigate("/customer/list")}
        >
          ← Quay lại danh sách đơn
        </button>
      )}
    </div>
  );
}
