import React, { useState, useEffect } from 'react';
import './Pricing.css';
import Header from '../../Header/Header';
import Footer from '../../Footer/Footer';
import axiosClient from '../../config/AxiosClient';

const Pricing = () => {
  const [isTableOfContentsOpen, setIsTableOfContentsOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleTableOfContents = () => {
    setIsTableOfContentsOpen(!isTableOfContentsOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/api/services');
        
        // Chỉ lấy tên và giá, giá nhân 2
        const formattedServices = response.data.map(service => ({
          id: service.id,
          name: service.name,
          price: service.price * 2, // Giá nhân 2
          caseType: service.caseType,
          enabled: service.enabled
        }));
        
        setServices(formattedServices);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Không thể tải dữ liệu dịch vụ');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Lọc dịch vụ huyết thống (CIVIL) - LOẠI TRỪ thai nhi
  const civilServices = services.filter(service => 
    service.caseType === 'CIVIL' && 
    service.enabled && 
    !service.name.toLowerCase().includes('thai nhi')
  );

  // Lọc dịch vụ hành chính (ADMINISTRATIVE)
  const administrativeServices = services.filter(service => 
    service.caseType === 'ADMINISTRATIVE' && service.enabled
  );

  return (
    <div className="pricing-page">
      <Header />
      
      <main className="pricing-main">
        <div className="pricing-container">
          <h1>Bảng giá xét nghiệm ADN huyết thống, pháp lý mới nhất 2025</h1>
          
          {/* Table of Contents */}
          <div className="table-of-contents">
            <div className="toc-header" onClick={toggleTableOfContents}>
              <h3>Mục lục bài viết</h3>
              <span className={`toc-toggle ${isTableOfContentsOpen ? 'open' : ''}`}>
                ▼
              </span>
            </div>
            
            {isTableOfContentsOpen && (
              <div className="toc-content">
                <ol className="toc-list">
                  <li>
                    <a href="#xet-nghiem-adn-la-gi" onClick={() => scrollToSection('xet-nghiem-adn-la-gi')}>
                      Xét nghiệm ADN là gì? Khi nào cần thực hiện?
                    </a>
                  </li>
                  <li>
                    <a href="#bang-gia-theo-muc-dich" onClick={() => scrollToSection('bang-gia-theo-muc-dich')}>
                      Bảng giá xét nghiệm ADN theo từng mục đích
                    </a>
                    <ol className="toc-sublist">
                      <li>
                        <a href="#bang-gia-huyet-thong" onClick={() => scrollToSection('bang-gia-huyet-thong')}>
                          Bảng giá xét nghiệm huyết thống
                        </a>
                      </li>
                      <li>
                        <a href="#bang-gia-phuc-vu-phap-ly" onClick={() => scrollToSection('bang-gia-phuc-vu-phap-ly')}>
                          Bảng giá xét nghiệm ADN phục vụ pháp lý
                        </a>
                      </li>
                    </ol>
                  </li>
                  <li>
                    <a href="#nhung-luu-y" onClick={() => scrollToSection("nhung-luu-y")}>
                      Những lưu ý khi chọn dịch vụ xét nghiệm ADN giá tốt
                    </a>
                  </li>
                  <li>
                    <a href="#cau-hoi-thuong-gap" onClick={() => scrollToSection("cau-hoi-thuong-gap")}>
                      Câu hỏi thường gặp (FAQ)
                    </a>
                    <ol className="toc-sublist">
                      <li>
                        <a href="#faq-chinh-xac" onClick={() => scrollToSection("faq-chinh-xac")}>
                          <span className="question-mark">?</span> Xét nghiệm ADN giá rẻ có chính xác không?
                        </a>
                      </li>
                      <li>
                        <a href="#faq-thanh-toan" onClick={() => scrollToSection("faq-thanh-toan")}>
                          <span className="question-mark">?</span> Có thể thanh toán sau không?
                        </a>
                      </li>
                      <li>
                        <a href="#faq-giay-to" onClick={() => scrollToSection("faq-giay-to")}>
                          <span className="question-mark">?</span> Làm xét nghiệm ADN cần giấy tờ gì?
                        </a>
                      </li>
                    </ol>
                  </li>
                  <li>
                    <a href="#ket-luan" onClick={() => scrollToSection("ket-luan")}>
                      Kết luận: Nên chọn nơi xét nghiệm nào giá hợp lý – uy tín cao?
                    </a>
                    <div className="contact-info">
                      <span className="phone-icon">📞</span>
                      <span className="contact-text">
                        Liên hệ nhận tư vấn & báo giá chi tiết:
                      </span>
                    </div>
                  </li>
                </ol>
                <div className="contact-button">
                  <button className="btn-contact">GHI CHÚ</button>
                </div>
              </div>
            )}
          </div>

          {/* Content sections */}
          <div id="xet-nghiem-adn-la-gi" className="content-section">
            <h2>1. Xét nghiệm ADN là gì? Khi nào cần thực hiện?</h2>
            <p>
              Xét nghiệm ADN (ADN là viết tắt của axit deoxyribonucleic) là
              phương pháp phân tích vật liệu di truyền để xác định mối quan hệ
              huyết thống (cha – con, mẹ – con, ông – cháu,…), hoặc phục vụ các
              mục đích pháp lý như làm giấy khai sinh, tranh chấp tài sản, di
              cư,…
            </p>
            
            <h3 className="sub-heading">Các trường hợp phổ biến cần xét nghiệm ADN:</h3>
            <ul className="case-list">
              <li>Nghi ngờ về quan hệ huyết thống</li>
              <li>Làm giấy khai sinh, nhập hộ khẩu</li>
              <li>Giải quyết tranh chấp dân sự, tài sản, ly hôn</li>
              <li>Thủ tục định cư nước ngoài</li>
              <li>Kiểm tra gen di truyền (trường hợp đặc biệt)</li>
            </ul>
          </div>

          <div id="bang-gia-theo-muc-dich" className="content-section">
            <h2>2. Bảng giá xét nghiệm ADN theo từng mục đích</h2>
            
            <div className="pricing-image-container">
              <img 
                src="/src/assets/pricing/bang-gia-xet-nghiem-adn.jpg" 
                alt="Bảng giá xét nghiệm ADN huyết thống tại trung tâm ADNVIETNAM"
                className="pricing-banner"
              />
              <p className="image-caption">
                Bảng giá xét nghiệm ADN huyết thống tại trung tâm ADN GeneX
              </p>
            </div>
            
            {/* Bảng giá huyết thống (CIVIL) */}
            <div id="bang-gia-huyet-thong" className="sub-section">
              <h3>2.1 Bảng giá xét nghiệm ADN huyết thống</h3>
              <p>
                Dưới đây là bảng giá chi tiết cho các loại xét nghiệm ADN huyết thống phổ biến:
              </p>
              
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p className="error-message">{error}</p>
                </div>
              ) : (
                <div className="pricing-table-container">
                  <table className="pricing-table">
                    <thead>
                      <tr>
                        <th>Loại quan hệ</th>
                        <th>Chi phí 2 người</th>
                      </tr>
                    </thead>
                    <tbody>
                      {civilServices.length > 0 ? (
                        civilServices.map((service) => (
                          <tr key={service.id}>
                            <td>{service.name}</td>
                            <td className="price">{service.price.toLocaleString('vi-VN')} VNĐ</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="no-data">
                            Không có dữ liệu dịch vụ huyết thống
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="pricing-note">
                <span className="note-icon">⚠️</span>
                <em>Mức giá có thể thay đổi tùy loại mẫu và thời gian trả kết quả.</em>
              </div>
            </div>

            {/* Bảng giá phục vụ pháp lý (ADMINISTRATIVE) */}
            <div id="bang-gia-phuc-vu-phap-ly" className="sub-section">
              <h3>2.2 Bảng giá xét nghiệm ADN phục vụ pháp lý</h3>
              <p>
                Xét nghiệm ADN phục vụ pháp lý có quy trình nghiêm ngặt hơn và được công nhận bởi tòa án:
              </p>
              
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p className="error-message">{error}</p>
                </div>
              ) : (
                <div className="pricing-table-container">
                  <table className="pricing-table">
                    <thead>
                      <tr>
                        <th>Loại quan hệ</th>
                        <th>Chi phí 2 người</th>
                      </tr>
                    </thead>
                    <tbody>
                      {administrativeServices.length > 0 ? (
                        administrativeServices.map((service) => (
                          <tr key={service.id}>
                            <td>{service.name}</td>
                            <td className="price">{service.price.toLocaleString('vi-VN')} VNĐ</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="no-data">
                            Không có dữ liệu dịch vụ pháp lý
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="pricing-note">
                <span className="note-icon">⚠️</span>
                <em>Giá dịch vụ pháp lý đã bao gồm phí thủ tục và chứng thực.</em>
              </div>
            </div>
          </div>

          {/* Sau phần bảng giá, thêm các section mới */}

          {/* Section 3: Những lưu ý */}
          <div id="nhung-luu-y" className="content-section">
            <h2>3. Những lưu ý khi chọn dịch vụ xét nghiệm ADN giá tốt</h2>
            <p>
              Khi lựa chọn dịch vụ xét nghiệm ADN, bạn cần lưu ý những điểm sau để đảm bảo 
              kết quả chính xác và dịch vụ uy tín:
            </p>
            
            <ul className="case-list">
              <li>Chọn trung tâm có giấy phép hoạt động hợp pháp</li>
              <li>Kiểm tra độ chính xác của kết quả (tối thiểu 99.9%)</li>
              <li>Tìm hiểu về quy trình lấy mẫu và bảo quản</li>
              <li>So sánh giá cả và các gói dịch vụ</li>
              <li>Đọc kỹ các điều khoản bảo mật thông tin</li>
              <li>Hỏi rõ thời gian trả kết quả</li>
            </ul>
          </div>

          {/* Section 4: FAQ */}
          <div id="cau-hoi-thuong-gap" className="content-section">
            <h2>4. Câu hỏi thường gặp (FAQ)</h2>
            
            <div id="faq-chinh-xac" className="faq-item">
              <h3 className="faq-question">
                <span className="question-mark">?</span> Xét nghiệm ADN giá rẻ có chính xác không?
              </h3>
              <p className="faq-answer">
                Độ chính xác của xét nghiệm ADN không phụ thuộc vào giá cả mà phụ thuộc vào 
                công nghệ và quy trình thực hiện. Tuy nhiên, bạn nên chọn những trung tâm 
                uy tín có giấy phép hoạt động để đảm bảo kết quả đáng tin cậy.
              </p>
            </div>
            
            <div id="faq-thanh-toan" className="faq-item">
              <h3 className="faq-question">
                <span className="question-mark">?</span> Có thể thanh toán sau không?
              </h3>
              <p className="faq-answer">
                Một số trung tâm cho phép thanh toán sau khi nhận kết quả, tuy nhiên đa số 
                yêu cầu thanh toán trước khi thực hiện xét nghiệm. Bạn nên liên hệ trực tiếp 
                để được tư vấn về các hình thức thanh toán.
              </p>
            </div>
            
            <div id="faq-giay-to" className="faq-item">
              <h3 className="faq-question">
                <span className="question-mark">?</span> Làm xét nghiệm ADN cần giấy tờ gì?
              </h3>
              <p className="faq-answer">
                Đối với xét nghiệm huyết thống: Chỉ cần CMND/CCCD của các bên tham gia.<br/>
                Đối với xét nghiệm phục vụ pháp lý: Cần thêm giấy tờ pháp lý liên quan 
                (giấy yêu cầu của tòa án, cơ quan có thẩm quyền).
              </p>
            </div>
          </div>

          {/* Section 5: Kết luận */}
          <div id="ket-luan" className="content-section">
            <h2>5. Kết luận: Nên chọn nơi xét nghiệm nào giá hợp lý – uy tín cao?</h2>
            <p>
              Việc chọn lựa trung tâm xét nghiệm ADN phù hợp cần cân nhắc nhiều yếu tố, 
              không chỉ riêng về giá cả. Hãy ưu tiên những trung tâm có:
            </p>
            
            <ul className="case-list">
              <li>Giấy phép hoạt động hợp pháp từ Bộ Y tế</li>
              <li>Đội ngũ chuyên gia kinh nghiệm</li>
              <li>Công nghệ hiện đại, độ chính xác cao</li>
              <li>Quy trình minh bạch, bảo mật thông tin</li>
              <li>Giá cả hợp lý, có các gói dịch vụ đa dạng</li>
              <li>Hỗ trợ tư vấn tận tình</li>
            </ul>
            
            <div className="contact-cta">
              <div className="contact-info">
                <span className="phone-icon">📞</span>
                <span className="contact-text">
                  Liên hệ nhận tư vấn & báo giá chi tiết: <strong>0123.456.789</strong>
                </span>
              </div>
              <p className="contact-note">
                Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn 24/7 để giải đáp 
                mọi thắc mắc về dịch vụ xét nghiệm ADN.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
