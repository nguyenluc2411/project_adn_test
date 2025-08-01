import iconTuvan from "./assets/icon-tuvan.png";
import iconThumau from "./assets/icon-thumau.png";
import iconPhantich from "./assets/icon-phantich.png";
import iconTraketqua from "./assets/icon-traketqua.png";
import imgBanner from "./assets/banner.png";
// import iconMail from "./assets/icon-mail.png";
// import iconPhone from "./assets/icon-phone.png";
// import iconSearch from "./assets/icon-search.png";
// import iconlogo from "./assets/icon-logo.png";
import React, { useState } from 'react';

import iconChinhxac from "./assets/Home-gt/icon-chinhxac.png";
import iconNhanhchong from "./assets/Home-gt/icon-nhanhchong.png";
import iconTietkiem from "./assets/Home-gt/icon-tietkiem.png";
import iconBaomat from "./assets/Home-gt/icon-baomat.png";
import imgMeCon from "./assets/Home-gt/banner-mecon.png";
import iconChoose from "./assets/Home-gt/icon-choose.png";
import "./App.css";

import { useAuth } from "./Context/AuthContext";

import { useNavigate } from "react-router-dom";
import Header from './Header/Header.jsx';
import Footer from './Footer/Footer.jsx';
import { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn, loading, role, user } = useAuth();
  const [btnLoading, setBtnLoading] = useState(false); // Now useState is properly imported


  // Xử lý chuyển hướng navbar
  const handleNavLogin = () => {
    navigate("/login");
  };
  const handleNavRegister = () => {
    navigate("/register");
  };
  const handleServiceClick = () => {
    navigate("/service");
  };

  useEffect(() => {
    if (isLoggedIn && user && !loading) {
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'RECORDER_STAFF':
          navigate('/staff/dashboard');
          break;
        case 'LAB_STAFF':
          navigate('/lab/dashboard');
          break;
        case 'CUSTOMER':
          break;
        default:
          break;
      }
    }
  }, [isLoggedIn, loading, user, navigate]);
  //xử lý đăng ký form
  const handleRegisterClick = async () => {
    // Don't process if still checking auth status
    if (loading) return;

    setBtnLoading(true);
    try {
      if (!isLoggedIn) {
        // Save current path and package info for after login
        localStorage.setItem('redirectUrl', '/form');
        navigate('/login');
      } else {
        navigate('/form');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="home-root">


        {/* Banner */}
        <div className="banner">
          <div className="banner-left">
            <div className="banner-title">Xét Nghiệm ADN</div>
            <div className="banner-subtitle">Xác định quan hệ huyết thống</div>
            <div className="banner-desc">
              Cho các mối quan hệ cha (mẹ) – con, ông (bà) – cháu, anh (chị) – em, họ hàng
              với mục đích giải tỏa nghi ngờ mối quan hệ cá nhân, bổ sung thủ tục hành chính pháp lý khi đăng ký giấy khai sinh, đổi họ, nhận con, thừa kế, tranh chấp tại tòa hay nộp cho lãnh sự các nước để làm visa, hộ chiếu,…
            </div>
          </div>
          <div className="banner-right">
            <img src={imgBanner} alt="banner" className="banner-img" />
          </div>
        </div>

        {/* Steps */}
        <div className="steps">
          <div className="step">
            <img src={iconTuvan} alt="Tư vấn" />
            <div className="step-title">Tư vấn</div>
          </div>
          <div className="step">
            <img src={iconThumau} alt="Thu mẫu" />
            <div className="step-title">Thu mẫu</div>
          </div>
          <div className="step">
            <img src={iconPhantich} alt="Phân tích" />
            <div className="step-title">Phân tích</div>
          </div>
          <div className="step">
            <img src={iconTraketqua} alt="Trả kết quả" />
            <div className="step-title">Trả kết quả</div>
          </div>
        </div>

        {/* Section: Giám Định ADN Là Gì? */}
        <div className="adn-section">
          <div className="adn-section-left">
            <div className="adn-title"><b>Giám Định ADN Là Gì ?</b></div>
            <div className="adn-desc">
              Đây là cách nói khác của xét nghiệm ADN. Về bản chất giám định ADN và xét nghiệm ADN là giống nhau. Hai thuật ngữ này được dùng để xác minh mối quan hệ huyết thống giữa 2 người dựa vào phân tử ADN.
            </div>
            <div className="adn-choose">
              <img src={iconChoose} alt="" className="adn-choose-icon" />
              <span>Chọn <b>Gene+</b> bởi vì:</span>
            </div>
            <div className="adn-benefits">
              <div className="adn-benefit">
                <img src={iconChinhxac} alt="" />
                <span>Chính xác</span>
              </div>
              <div className="adn-benefit">
                <img src={iconNhanhchong} alt="" />
                <span>Nhanh chóng</span>
              </div>
              <div className="adn-benefit">
                <img src={iconTietkiem} alt="" />
                <span>Tiết kiệm</span>
              </div>
              <div className="adn-benefit">
                <img src={iconBaomat} alt="" />
                <span>Bảo mật</span>
              </div>
            </div>
          </div>
          <div className="adn-section-right">
            <img src={imgMeCon} alt="Xét nghiệm ADN Mẹ Con" className="adn-img" />
          </div>
        </div>

        <div className="adn-pricing-section" id="adn-pricing-section">
  <div className="adn-pricing-title">XÉT NGHIỆM ADN TẠI GENE+</div>
  <div className="adn-pricing-list">
    {/* Gói dân sự */}
    <div className="adn-pricing-box basic">
      <div className="adn-pricing-price blue">DÂN SỰ</div>
      <div className="adn-pricing-type pink">GÓI XÉT NGHIỆM ADN DÂN SỰ</div>
      <div className="adn-pricing-desc">
        Là xét nghiệm tự nguyện giúp xác định mối quan hệ giữa các cá nhân.
      </div>
      <ul className="adn-pricing-features">
        <li>✔ Kết quả sau 4h</li>
        <li>✔ Chính xác 99.99999998%</li>
        <li>✖ Không dùng cho mục đích pháp lý</li>
        <li>✔ Thủ tục đơn giản</li>
        <li>✔ Thu mẫu tại nhà/trung tâm</li>
        <li>✔ Bảo mật mã vạch</li>
        <li>✔ Thanh toán tiện lợi</li>
        <li>✔ Hỗ trợ 24/7</li>
      </ul>
      <button className="adn-pricing-btn" onClick={handleRegisterClick}>
        ĐĂNG KÝ NGAY
      </button>
    </div>

    {/* Gói hành chính */}
    <div className="adn-pricing-box highlight">
      
      <div className="adn-pricing-price red">HÀNH CHÍNH</div>
      <div className="adn-pricing-type yellow">GÓI XÉT NGHIỆM ADN HÀNH CHÍNH</div>
      <div className="adn-pricing-desc">
        Dùng cho thủ tục hành chính: nhận cha con, khai sinh, visa,...
      </div>
      <ul className="adn-pricing-features">
        <li>✔ Kết quả sau 6h</li>
        <li>✔ Chính xác 100%</li>
        <li>✔ Có giá trị pháp lý</li>
        <li>✔ Thủ tục đơn giản</li>
        <li>✔ Thu mẫu tại nhà/trung tâm</li>
        <li>✔ Bảo mật mã vạch</li>
        <li>✔ Thanh toán tiện lợi</li>
        <li>✔ Hỗ trợ 24/7</li>
      </ul>
      <button className="adn-pricing-btn" onClick={handleRegisterClick}>
        ĐĂNG KÝ NGAY
      </button>
    </div>
  </div>
</div>
      </div>
      
      <Footer />
      
    </>
  );
};

export default Home;