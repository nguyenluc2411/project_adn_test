import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../config/AxiosClient";
import { useAuth } from "../Context/AuthContext";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null); // "success" | "failed"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const orderId = searchParams.get("vnp_TxnRef");
  const { user } = useAuth();
  const token = user?.accessToken || localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // đợi BE xử lý callback

        const response = await axiosClient.get(
          `/api/vnpay/payment-status/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        setPaymentInfo(data);

        if (data?.responseCode?.toString() === "00") {
          setStatus("success");
          setMessage("🎉 Giao dịch thành công! Đang chuyển hướng...");
          setTimeout(() => {
            navigate("/customer/list", {
              state: { paymentSuccess: true }
            });
          }, 4000);
        } else {
          setStatus("failed");
          setMessage("❌ Giao dịch thất bại.");
        }
      } catch (err) {
        console.error("❌ [PaymentResult] Lỗi khi gọi API payment-status:", err);
        setError("Không thể tải thông tin thanh toán.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchPaymentInfo();
    } else {
      setError("Thiếu mã đơn hàng.");
      setLoading(false);
    }
  }, [orderId, navigate, token]);

  const handleBack = () => navigate("/customer/list");

  if (loading) return <p>🔄 Đang xác thực thanh toán...</p>;
  if (error) return <p style={{ color: "red" }}>❌ {error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ color: status === "success" ? "#2e7d32" : "#c62828" }}>
          {message}
        </h2>
        {paymentInfo && (
          <div style={{ margin: "16px 0", fontSize: 16 }}>
            <div><b>Mã đơn hàng:</b> {paymentInfo.orderId || orderId}</div>
            <div>
              <b>Số tiền:</b>{" "}
              {paymentInfo.amount
                ? Number(paymentInfo.amount).toLocaleString("vi-VN") + " VNĐ"
                : "Không rõ"}
            </div>
            <div><b>Mã giao dịch:</b> {paymentInfo.transactionNo || "Không có"}</div>
            <div>
              <b>Thời gian:</b>{" "}
              {paymentInfo.payDate
                ? new Date(paymentInfo.payDate).toLocaleString("vi-VN")
                : "Không xác định"}
            </div>
            <div>
              <b>Trạng thái:</b>{" "}
              {paymentInfo.responseCode === "00" ? "✅ Thành công" : "❌ Thất bại"}
            </div>
          </div>
        )}
        <button onClick={handleBack} style={styles.button}>
          Xem đơn
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f0f0",
  },
  card: {
    background: "#fff",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "90%",
    maxWidth: "400px",
  },
  button: {
    marginTop: "24px",
    padding: "10px 20px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};