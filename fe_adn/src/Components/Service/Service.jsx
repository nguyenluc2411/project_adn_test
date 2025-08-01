import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Service.css';
import familyTest from '../../assets/Service/family-test.png';
import Header from '../../Header/Header.jsx';
import Footer from '../../Footer/Footer.jsx';
import familyImage from '../../assets/Service/family-image.png';
import buildingImage from '../../assets/Service/building-image.png';

const Service = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDetail, setSelectedDetail] = useState(null);

  const handleNavigateToForm = () => {
    navigate('/form');
  };

  const handleNavigateToPricing = () => {
    navigate('/pricing');
  };

  const handleClickAdnRegister = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById("adn-pricing-section");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      const el = document.getElementById("adn-pricing-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleShowDetail = (detailKey) => {
    setSelectedDetail(prev => (prev === detailKey ? null : detailKey));
    setTimeout(() => {
      document.getElementById('detail-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleScrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const detailsContent = {
    'cha-con': {
      title: 'Chi tiết Xét nghiệm ADN Cha - Con',
      content: 'Xét nghiệm ADN cha-con là dịch vụ cốt lõi, sử dụng để xác định mối quan hệ huyết thống trực hệ giữa người cha giả định và đứa con. Với độ chính xác lên đến 99.9999%, kết quả này là bằng chứng khoa học không thể chối cãi. Dịch vụ này không chỉ giúp giải tỏa những nghi ngờ, hàn gắn tình cảm gia đình mà còn là cơ sở pháp lý quan trọng trong các thủ tục làm giấy khai sinh, nhận con, phân chia tài sản thừa kế.'
    },
    'me-con': {
      title: 'Chi tiết Xét nghiệm ADN Mẹ - Con',
      content: 'Tương tự xét nghiệm cha-con, dịch vụ này xác định mối quan hệ huyết thống giữa mẹ và con. Mặc dù ít phổ biến hơn, xét nghiệm này rất quan trọng trong các trường hợp như con nuôi tìm lại mẹ, các vụ trao nhầm con tại bệnh viện, thất lạc, hoặc các tranh chấp pháp lý liên quan đến quyền làm mẹ. Độ chính xác của xét nghiệm này cũng đạt mức tuyệt đối.'
    },
    'anh-chi-em': {
      title: 'Chi tiết Xét nghiệm ADN Anh/Chị - Em',
      content: 'Xét nghiệm này được sử dụng để xác định xem hai hoặc nhiều cá nhân có cùng cha, cùng mẹ, hay cùng cả cha lẫn mẹ hay không. Đây là phương pháp hữu ích khi không có mẫu của cha hoặc mẹ để thực hiện xét nghiệm trực hệ. Kết quả giúp xác nhận mối quan hệ anh em ruột, cùng cha khác mẹ hoặc cùng mẹ khác cha, phục vụ cho việc đoàn tụ gia đình hoặc phân chia di sản.'
    },
    'ong-ba-chau': {
      title: 'Chi tiết Xét nghiệm ADN Ông/Bà - Cháu',
      content: 'Khi người cha giả định không thể tham gia xét nghiệm, có thể sử dụng mẫu của ông bà nội để xác định huyết thống với cháu. Xét nghiệm này phân tích các marker di truyền đặc trưng trên nhiễm sắc thể Y (ông nội - cháu trai) hoặc ADN ty thể (bà nội - cháu gái) để đưa ra kết luận chính xác. Đây là giải pháp thay thế hiệu quả để xác minh dòng dõi huyết thống.'
    }
  };

  return (
    <div className="service-page">
      <Header />
      <div className="service-container">
        <div className="service-header">
          <h1>Dịch Vụ Xét Nghiệm Tại <span className="highlight">Gene+</span></h1>
          <p className="service-desc">
            Tại đây cung cấp nhiều nội dung xét nghiệm ADN khác nhau để đáp ứng nhu cầu của bạn.
            Tất cả các kết quả xét nghiệm chúng tôi đều cam kết đạt độ tin cậy và chính xác cao nhất.
            Những dịch vụ chính mà chúng tôi cung cấp sẽ được mô tả ngắn gọn trong từng mục sau đây:
          </p>
        </div>

        <div className="service-types">
          <button className="type-btn civil" onClick={handleNavigateToForm}>ADN DÂN SỰ</button>
          <button className="type-btn admin" onClick={handleNavigateToForm}>ADN HÀNH CHÍNH</button>
        </div>

        <div className="service-content">
          <div className="family-test">
            <h2>FAMILY TEST</h2>
            <div className="family-content">
              <img src={familyTest} alt="Family Test" className="family-img" />
              <div className="test-types">
                <div className="test-item">
                  <span>Cha - con</span>
                  <button className="detail-btn" onClick={() => handleShowDetail('cha-con')}>Chi tiết</button>
                </div>
                <div className="test-item">
                  <span>Mẹ - con</span>
                  <button className="detail-btn" onClick={() => handleShowDetail('me-con')}>Chi tiết</button>
                </div>
                <div className="test-item">
                  <span>Anh/chị - em</span>
                  <button className="detail-btn" onClick={() => handleShowDetail('anh-chi-em')}>Chi tiết</button>
                </div>
                <div className="test-item">
                  <span>Ông/bà - cháu</span>
                  <button className="detail-btn" onClick={() => handleShowDetail('ong-ba-chau')}>Chi tiết</button>
                </div>
                <div className="action-btns">
                  <button className="register-btn" onClick={handleClickAdnRegister}>Đăng ký</button>
                  <button className="price-btn" onClick={handleNavigateToPricing}>Bảng giá</button>
                </div>
              </div>
            </div>
          </div>
          <p className="service-note">
            Khi niềm tin được đặt đúng chỗ!! Gene+ chắc chắn mang lại cho bạn dịch vụ xét nghiệm có chất lượng với độ chính xác trên cả mong đợi.
          </p>
        </div>

        {selectedDetail && detailsContent[selectedDetail] && (
          <div id="detail-section" className="detail-view-section">
            <h2 className="section-title yellow-text">{detailsContent[selectedDetail].title}</h2>
            <p>{detailsContent[selectedDetail].content}</p>
          </div>
        )}

        <div className="service-introduction">
          <div className="sidebar">
            <h3 className="sidebar-title">NỘI DUNG</h3>
            <ul className="sidebar-menu">
              <li onClick={() => handleScrollToSection('section-definition')}>Xét nghiệm ADN dân sự là gì?</li>
              <li onClick={() => handleScrollToSection('section-relationships')}>Các mối quan hệ có thể xét nghiệm</li>
              <li onClick={() => handleScrollToSection('section-process')}>5 bước thực hiện xét nghiệm</li>
              <li onClick={() => handleScrollToSection('section-cost')}>Chi phí xét nghiệm ADN dân sự</li>
              <li onClick={() => handleScrollToSection('section-security')}>Bảo mật thông tin</li>
            </ul>
          </div>

          <div className="main-content">
            <div className="intro-text">
              <p>
                Nếu bạn đang nghi ngờ người vợ của mình không chung thủy, bạn có thể đang cảm thấy lo lắng, tổn thương, trăn trở và hơn thế nữa. Sự nghi ngờ sẽ tạo ra vết nứt phá hủy mối quan hệ trong gia đình hay giữa cá nhân với nhau và nó không đễ chịu chút nào cả. Mặc dù những tình huống này thường phức tạp, rồi lâm về việc không biết làm gì tiếp theo, nhưng có một cách để nhận được giải đáp cho những băn khoán lo là xét nghiệm ADN để giải tỏa nghi ngờ về mối quan hệ cá nhân.
              </p>
              <p>
                Với xét nghiệm ADN dân sự, bạn có thể xác nhận hoặc phủ nhận những nghi ngờ của mình, cho phép bạn đưa ra quyết định đúng đắn, sáng suốt giải thoát cảm xúc tiêu cực hiện có trong bạn. Dù chính xác của công nghệ xét nghiệm huyết thống này, là những chứng khoa học không thể chối cãi đối với những ai muốn che dấy sự thật, giúp bạn có thể chọn con đường phù hợp cho mình trong mối quan hệ đó.
              </p>
            </div>
            <img src={familyImage} alt="Family" className="intro-image" />
          </div>
        </div>

        <div id="section-definition" className="service-definition">
          <h2 className="section-title yellow-text">Xét nghiệm ADN dân sự là gì?</h2>
          <p>
            Xét nghiệm ADN tự nguyện nhằm mục đích giải tỏa nghi ngờ cá nhân cho các mối quan hệ như: Cha / mẹ – con, anh / chị – em, ông / bà – cháu, họ hàng nội ngoại.
          </p>
          <p className="warning">* Lưu ý: Loại dịch vụ này không có giá trị pháp lý, chỉ mang tính chất tham khảo cá nhân.</p>
        </div>

        <div className="civil-service">
          <h1 className="service-title">XÉT NGHIỆM ADN DÂN SỰ</h1>

          <div id="section-relationships" className="relationship-section">
            <h2 className="section-title">
              Có thể làm xét nghiệm ADN giải tỏa nghi ngờ cho những mối quan hệ nào ?
            </h2>
            <ul className="relationship-list">
              <li>Xét nghiệm ADN Cha Con / mẹ – con</li>
              <li>Xét nghiệm ADN thai nhi trước sinh không xâm lấn tìm cha</li>
              <li>Xét nghiệm ADN Anh/chị – em</li>
              <li>Xét nghiệm ADN Ông Bà và Cháu (Ông nội-cháu Trai; Bà nội-cháu Gái)</li>
              <li>Xét nghiệm ADN Họ Hàng (nội ngoại, cô dì chú bác,...)</li>
            </ul>
          </div>

          <div id="section-process" className="process-section">
            <h2 className="section-title">
              5 bước thực hiện xét nghiệm ADN dân sự
            </h2>
            <ul className="process-steps">
              <li>Bước 1: Chọn trung tâm xét nghiệm uy tín</li>
              <li>Bước 2: Đăng ký / đặt lịch xét nghiệm ADN</li>
              <li>Bước 3: Thu thập mẫu xét nghiệm</li>
              <li>Bước 4: Gửi mẫu xét nghiệm đến trung tâm</li>
              <li>Bước 5: Nhận kết quả xét nghiệm</li>
            </ul>

            <div className="process-details">
              <p className="detail-subtitle">Chi tiết quy trình gồm các bước sau đây:</p>
              <div className="step-content">
                <div className="step-info">
                  <h3 className="pink-title">Bước 1: Chọn trung tâm xét nghiệm uy tín</h3>
                  <p>
                    Trung tâm xét nghiệm Gene+ là đơn vị uy tín, đã và đang cung cấp
                    dịch vụ xét nghiệm ADN huyết thống chính xác 99,99% cho các
                    mối quan hệ như: Cha / mẹ – con, anh /chị – em, ông / bà – cháu, họ
                    hàng nội ngoại.
                  </p>
                </div>
                <img src={buildingImage} alt="Gene+ Building" className="building-image" />
              </div>
            </div>
          </div>

          <div id="section-cost" className="cost-section">
            <h2 className="section-title">Chi phí xét nghiệm ADN dân sự</h2>
            <p>
              Chi phí cho một ca xét nghiệm ADN dân sự phụ thuộc vào nhiều yếu tố như: loại mẫu xét nghiệm (máu, tóc, móng tay...), số lượng người tham gia, và thời gian trả kết quả mong muốn. Để nhận được báo giá chính xác và chi tiết nhất, chúng tôi khuyến khích bạn tham khảo trang Bảng giá của chúng tôi hoặc liên hệ trực tiếp với đội ngũ tư vấn viên.
            </p>
            <button className="price-btn" onClick={handleNavigateToPricing}>Xem Bảng Giá Chi Tiết</button>
          </div>

          <div id="section-security" className="security-section">
            <h2 className="section-title">Bảo mật thông tin khi làm xét nghiệm ADN</h2>
            <p>
              Tại Gene+, chúng tôi hiểu rằng thông tin di truyền là dữ liệu cá nhân vô cùng nhạy cảm. Chúng tôi cam kết bảo mật tuyệt đối mọi thông tin của khách hàng. Toàn bộ quy trình từ lúc nhận mẫu, phân tích, đến khi trả kết quả đều được mã hóa và chỉ những người có thẩm quyền mới được phép truy cập. Thông tin cá nhân và kết quả xét nghiệm của bạn sẽ không được tiết lộ cho bất kỳ bên thứ ba nào mà không có sự cho phép của bạn.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Service;