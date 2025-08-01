import React from 'react';
import './Footer.css';
import { useAuth } from "../Context/AuthContext";
import ChatComponent from "../Chat/ChatComponent";

const Footer = () => {
  const handleZaloContact = () => {
    window.open('https://zalo.me/0834052356', '_blank');
  };

  const handleEmailContact = () => {
    window.location.href = 'mailto:support.genxadn@gmail.com';
  };

  const handlePhoneCall = () => {
    window.location.href = 'tel:0834052356';
  };

  const { isLoggedIn, user, logout } = useAuth();
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo và thông tin liên hệ */}
        <div className="footer-main-info">
          <div className="footer-logo-section">
            <img src="/src/assets/logo.png" alt="ADN GenX Logo" className="footer-logo" />
            <div className="footer-company-info">
              <h3>Trung tâm xét nghiệm ADN GenX</h3>
              <p>Đơn vị chuyên cung cấp dịch vụ xét nghiệm ADN uy tín tại Việt Nam</p>
              <div className="footer-address">
                <p><strong>Địa chỉ:</strong> Khu công nghệ cao, Q9, Tp. Hồ Chí Minh</p>
              </div>
              <div className="footer-contact-info">
                <p><strong>Thông tin liên hệ:</strong></p>
                <p>Zalo: +98 0123456789</p>
                <p>Email: genex@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Bản đồ */}
          <div className="footer-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.6100105370124!2d106.8073080758808!3d10.84112775799604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuSENN!5e0!3m2!1svi!2s!4v1736379000000!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ ADN GenX"
            />
          </div>
        </div>

        {/* Các cột menu */}
        <div className="footer-menu-section">
          <div className="footer-column">
            <h4>Về ADN GeneX</h4>
            <ul>
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/service">Dịch vụ</a></li>
              <li><a href="/contact">Liên hệ</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Dịch vụ xét nghiệm</h4>
            <ul>
              <li><a href="/service">Xét nghiệm ADN cha - con</a></li>
              <li><a href="/service">Xét nghiệm ADN mẹ - con</a></li>
              <li><a href="/service">Xét nghiệm ADN anh/chị - em</a></li>
              <li><a href="/service">Xét nghiệm hành chính cấp giấy khai sinh</a></li>
              <li><a href="/service">Xét nghiệm phục vụ di trú</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Hỗ trợ khách hàng</h4>
            <ul>
              <li><a href="/pricing">Bảng giá xét nghiệm</a></li>
              <li><a href="/guide">Hướng dẫn</a></li>
              <li><a href="/result">Tra cứu kết quả</a></li>
              <li><a href="/customer/list">Lịch sử đơn</a></li>
            </ul>
          </div>
        </div>

        {/* Các nút liên hệ nhanh */}
        <div className="footer-quick-contact">
          <button
            className="contact-btn zalo-btn"
            onClick={handleZaloContact}
            title="Liên hệ qua Zalo"
          >
            <img src="/src/assets/zalo.webp" alt="Zalo" />
          </button>
          <button
            className="contact-btn email-btn"
            onClick={handleEmailContact}
            title="Gửi email"
          >
            <img src="/src/assets/icon-mail.png" alt="Email" />
          </button>
          <button
            className="contact-btn phone-btn"
            onClick={handlePhoneCall}
            title="Gọi điện thoại"
          >
            <img src="/src/assets/icon-phone.png" alt="Phone" />
          </button>
          {isLoggedIn && user?.role === 'CUSTOMER' && (
            <div className="chat-btn-wrapper">
              <ChatComponent userRole={user.role} />
            </div>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-copyright">
        <p>© 2025 Copyright by GenX - Xét nghiệm DNA | Chính sách bảo mật | Thỏa thuận sử dụng</p>
      </div>
    </footer>
  );
};

export default Footer;