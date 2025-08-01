import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../FormADN/FormADN.css";

export default function BookingPage() {
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vnp_ResponseCode = urlParams.get("vnp_ResponseCode");
    const vnp_TxnRef = urlParams.get("vnp_TxnRef");
    if (vnp_ResponseCode && vnp_TxnRef) {
      setMessage(
        vnp_ResponseCode === "00"
          ? "Thanh toán thành công!"
          : "Thanh toán thất bại!"
      );
    }
  }, []);

  const handleNext = () => {
    if (!type) {
      setMessage("Vui lòng chọn loại yêu cầu");
      return;
    }
    setMessage("");
    if (type === "CIVIL") {
      navigate("/customer/dansu?caseType=CIVIL");
    } else if (type === "ADMINISTRATIVE") {
      navigate("/customer/hanhchinh?caseType=ADMINISTRATIVE");
    }
  };

  return (
    <div
      className={`booking-theme-container ${type === "CIVIL"
          ? "theme-civil"
          : type === "ADMINISTRATIVE"
            ? "theme-administrative"
            : ""
        }`}
    >
      <div className="booking-wrapper">
        {message && (
          <div
            className={`booking-alert ${message.includes("thành công") ? "alert-success" : "alert-danger"
              }`}
          >
            {message}
          </div>
        )}

        <div className="booking-tabs">
          <button
            className={`booking-tab-button ${type === "CIVIL" ? "selected" : ""
              }`}
            onClick={() => setType("CIVIL")}
          >
            💼 Dân sự
          </button>
          <button
            className={`booking-tab-button ${type === "ADMINISTRATIVE" ? "selected" : ""
              }`}
            onClick={() => setType("ADMINISTRATIVE")}
          >
            📄 Hành chính
          </button>
        </div>

        <div className="booking-content">
          <div className="booking-icon-display">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="booking-details">
            <h1 className="booking-title">Xét nghiệm ADN</h1>

            <p className="booking-instruction">
              Vui lòng chọn loại yêu cầu để tiếp tục quy trình đặt lịch xét nghiệm.
            </p>

            {type === "CIVIL" && (
              <div className="booking-type-description">
                <strong>Dân sự:</strong> Phục vụ mục đích cá nhân, gia đình. Ví dụ: xác định huyết thống trong nội bộ gia đình.
              </div>
            )}

            {type === "ADMINISTRATIVE" && (
              <div className="booking-type-description">
                <strong>Hành chính:</strong> Phục vụ thủ tục pháp lý, hành chính. Ví dụ: phục vụ hồ sơ pháp lý, khai sinh, tòa án.
              </div>
            )}

            <button className="booking-next-button" onClick={handleNext}>
              Tiếp theo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
