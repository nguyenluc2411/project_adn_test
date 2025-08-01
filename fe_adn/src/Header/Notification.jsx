import React, { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import axiosClient from "../config/AxiosClient";
import { useAuth } from "../Context/AuthContext";
import "./Notification.css";

export default function Notification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const stompClientRef = useRef(null);
  const wsConnected = useRef(false);

  useEffect(() => {
    if (user?.username) {
      fetchNotifications();
      if (!wsConnected.current) {
        connectWebSocket();
        wsConnected.current = true;
      }
    }
    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.disconnect(() =>
          console.log("🛑 WebSocket disconnected")
        );
        wsConnected.current = false;
      }
    };
  }, [user?.username]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".notification-wrapper")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [allRes, unreadRes] = await Promise.all([
        axiosClient.get("/api/notifications"),
        axiosClient.get("/api/notifications/unread"),
      ]);
      const data = Array.isArray(allRes.data.result) ? allRes.data.result : [];
      setNotifications(data);
      setUnreadCount(unreadRes.data.result ?? 0);
      setLoaded(true);
    } catch (err) {
      console.error("❌ Lỗi khi lấy thông báo:", err);
    }
  };

  const connectWebSocket = () => {
    console.log("🔌 Kết nối WebSocket...");
    const socketFactory = () => new SockJS(`/ws`);
    const client = Stomp.over(socketFactory);
    client.debug = () => { };

    client.connect(
      {},
      () => {
        console.log("✅ WebSocket connected");
        client.subscribe("/user/queue/notifications", (message) => {
          const noti = JSON.parse(message.body);
          setNotifications((prev) => [noti, ...prev]);
          setUnreadCount((prev) => prev + 1);
          setIsDropdownOpen(true);
          const audio = new Audio("/assets/notification.mp3");
          audio.play().catch(() => { });
          setTimeout(() => setIsDropdownOpen(false), 5000);
        });
      },
      (error) => {
        console.error("❌ WebSocket error:", error);
      }
    );

    stompClientRef.current = client;
  };

  const handleBellClick = async () => {
    if (!isDropdownOpen && !loaded && user?.username) {
      await fetchNotifications();
    }
    setIsDropdownOpen((prev) => !prev);
  };

  const handleNotificationClick = async (n) => {
    try {
      if (!n.read) {
        await axiosClient.post(`/api/notifications/${n.id}/read`);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      let rolePath = "customer";
      switch (user?.role) {
        case "RECORDER_STAFF":
          rolePath = "recorder_staff";
          break;
        case "LAB_STAFF":
          rolePath = "lab_staff";
          break;
        case "ADMIN":
          rolePath = "admin";
          break;
        default:
          rolePath = "customer";
      }

      // Lấy bookingId từ backend entity
      const bookingId = n.booking?.id || n.bookingId;
      setIsDropdownOpen(false);
      if (bookingId) {
        if (rolePath === "customer") {
          navigate(`/customer/list?bookingId=${bookingId}`);
        }
        else if (rolePath === "recorder_staff") {
          // Phân loại thông báo dựa trên type hoặc message
          if (
            n.type === "NEW_BOOKING" ||
            n.type === "BOOKING_CREATED" ||
            n.message?.includes("vừa tạo đơn") ||
            n.message?.includes("tạo đơn")
          ) {
            // Thông báo tạo đơn mới → StaffBookings
            navigate(`/staff/bookings?bookingId=${bookingId}`);
          }
          else if (
            n.type === "SAMPLE_COMPLETED" ||
            n.type === "SAMPLE_READY" ||
            n.message?.includes("hoàn tất thu mẫu") ||
            n.message?.includes("Vui lòng kiểm tra và xử lý mẫu gửi đến")
          ) {
            // Thông báo hoàn tất thu mẫu → SampleCollection
            navigate(`/staff/collection/?bookingId=${bookingId}`);
          }
          else {
            // Thông báo khác → mặc định StaffBookings
            navigate(`/staff/bookings?bookingId=${bookingId}`);
          }
        }
        else if (rolePath === "lab_staff") {
          navigate(`/lab/dashboard?tab=PENDING&bookingId=${bookingId}`);
        }
        else if (rolePath === "admin") {
          navigate(`/admin/bookings?bookingId=${bookingId}`);
        }
      }
    } catch (err) {
      console.error("❌ Lỗi khi xử lý thông báo:", err);
    }
  };

  const getNotificationMessage = (n) => {
    // Ưu tiên hiển thị message từ backend
    if (n.message) {
      return n.message;
    }

    // Fallback theo type
    switch (n.type) {
      case "NEW_BOOKING":
      case "BOOKING_CREATED":
        return "Có đơn đăng ký mới cần xác nhận";
      case "BOOKING_CONFIRMED":
        return "Đơn đăng ký đã được xác nhận";
      case "KIT_SENT":
        return "Bộ kit đã được gửi đến";
      case "SAMPLE_RECEIVED":
      case "SAMPLE_COMPLETED":
        return "Mẫu đã được hoàn tất, vui lòng kiểm tra";
      default:
        return n?.title || "Bạn có một thông báo mới";
    }
  };

  return (
    <div className="notification-wrapper">
      <div className="notification-bell" onClick={handleBellClick}>
        <Bell color="#333" size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {isDropdownOpen && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <div className="notification-empty">Không có thông báo nào</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${!n.read ? "unread" : ""}`}
                onMouseDown={(e) => {
                  // Nếu đang bôi đen để copy thì không làm gì
                  if (window.getSelection().toString()) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                onClick={(e) => {
                  // Chỉ chuyển trang nếu không có gì được bôi đen
                  if (!window.getSelection().toString()) {
                    handleNotificationClick(n);
                  }
                }}
              >
                {!n.read && <span className="notification-dot" />}
                {getNotificationMessage(n)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
