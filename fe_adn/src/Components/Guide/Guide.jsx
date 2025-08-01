// Guide.jsx
import React, { useState, useEffect } from "react";
import "./Guide.css";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer.jsx";
import kimThuMau from "../../assets/Guide/kim-thu-mau.png";
import thuMauNgonTay from "../../assets/Guide/thu-mau-ngon-tay.png";
import dongGoiMau from "../../assets/Guide/dong-goi-mau.png";
import axiosClient from "../../config/AxiosClient";

const Guide = () => {
  const [isTocOpen, setIsTocOpen] = useState(true);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/api/services');
        setServices(response.data);
        setError(null);
      } catch (err) {
        setError("Không thể tải dữ liệu dịch vụ");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Lọc dịch vụ dân sự và hành chính
  const civilServices = services.filter(
    (service) =>
      service.caseType === "CIVIL" &&
      service.enabled &&
      !service.name.toLowerCase().includes("thai nhi")
  );
  const administrativeServices = services.filter(
    (service) => service.caseType === "ADMINISTRATIVE" && service.enabled
  );

  return (
    <div className="guide-wrapper">
      <Header />
      <div className="guide-container">
        <div className="guide-header">
          <h1>
            Xét nghiệm ADN bằng máu: 6 Bước thu mẫu đơn giản kèm ảnh minh họa
          </h1>
        </div>

        <div className="guide-content">
          <div className="guide-toc">
            <div
              className="toc-header"
              onClick={() => setIsTocOpen(!isTocOpen)}
            >
              📋 NỘI DUNG
              <span className={`arrow ${isTocOpen ? "open" : ""}`}>▼</span>
            </div>
            {isTocOpen && (
              <div className="toc-content">
                <ul>
                  <li>
                    <a href="#intro">
                      1. Xét nghiệm ADN bằng máu có chính xác không?
                    </a>
                  </li>
                  <li>
                    <a href="#guide">
                      2. Hướng dẫn cách lấy mẫu máu xét nghiệm ADN tại nhà
                    </a>
                  </li>
                  <li>
                    <a href="#timing">
                      3. Xét nghiệm ADN bằng máu hết bao nhiều tiền?
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="main-content">
            <div id="intro" className="intro-section">
              <h2>1. Xét nghiệm ADN bằng máu có chính xác không?</h2>
              <p>
                Xét nghiệm ADN bằng máu là phương pháp sử dụng mẫu máu của những
                người tham gia xét nghiệm để xác định mối quan hệ huyết thống.
              </p>
              <p>
                Mẫu máu là loại mẫu có độ ổn định cao, các phần tử ADN tồn tại
                bền vững nên có chính xác cao lên đến 99,9999999%.
              </p>
              <p>
                Trong xét nghiệm ADN, chỉ cần vài giọt máu là có thể thực hiện
                xét nghiệm. Vì vậy mẫu máu trên giấy FTA hay tầm bông thường
                được ưu tiên hơn.
              </p>
              <p>
                Ngoài ra, xét nghiệm ADN bằng máu còn được sử dụng trong trường
                hợp xét nghiệm ADN thai nhi để xác định mối quan hệ huyết thống
                giữa người với em bé khi con trong bụng mẹ. Xét nghiệm được thực
                hiện bằng cách lấy mẫu máu ngoại vi của người mẹ đang mang thai
                từ tuần thứ 7. Với công nghệ hiện đại, các chuyên gia sẽ tiến
                hành tách chiết ADN của thai nhi từ trong mẫu máu của mẹ để so
                sánh với mẫu máu người cha. Phương pháp này vừa an toàn cho mẹ
                và bé vừa có độ chính xác cao.
              </p>
            </div>

            <div id="guide" className="guide-steps">
              <h2>2. Hướng dẫn cách lấy mẫu máu xét nghiệm ADN tại nhà</h2>
              <p>
                Tự thu mẫu máu tại nhà để xét nghiệm ADN chỉ áp dụng trong
                trường hợp xét nghiệm ADN dân sự tự nguyện, kết quả không có
                tính pháp lý. Sau đây là quy trình thu mẫu máu xét nghiệm ADN
                tại nhà:
              </p>

              <div className="guide-step">
                <div
                  className="step-header"
                  style={{ backgroundColor: "#e74c3c" }}
                >
                  <h3>Bước 1: Chuẩn bị dụng cụ thu mẫu:</h3>
                </div>
                <div className="step-content-with-image">
                  <div className="step-text">
                    <ul>
                      <li>
                        - Chuẩn bị kim thu mẫu máu, thẻ thu mẫu máu FTA hoặc tăm bông,
                        phong bì trắng đựng mẫu, bông cồn sát khuẩn, túi đựng.
                      </li>
                      <li>
                        - Bạn có thể liên hệ đến trung tâm để nhận dụng cụ lấy mẫu máu.
                      </li>
                    </ul>
                  </div>
                  <div className="step-image">
                    <img src={kimThuMau} alt="Kim thu mẫu máu" />
                  </div>
                </div>
              </div>

              <div className="guide-step">
                <div
                  className="step-header"
                  style={{ backgroundColor: "#e74c3c" }}
                >
                  <h3>
                    Bước 2: Điền đầy đủ thông tin vào đơn yêu cầu xét nghiệm
                  </h3>
                </div>
                <div className="step-content">
                  <ul>
                    <li>Tải mẫu đơn xét nghiệm <a href="/#adn-pricing-section" style={{ color: "#1d4ed8", textDecoration: "underline" }}>tại đây</a>.</li>
                    <li>
                      Điền thông tin cá nhân đầy đủ theo yêu cầu: họ tên, ngày
                      sinh, địa chỉ, số điện thoại.
                    </li>
                    <li>
                      Đối với xét nghiệm ADN tự nguyện, thông tin trên đơn không
                      cần đúng pháp tiên giấy tờ.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="guide-step">
                <div
                  className="step-header"
                  style={{ backgroundColor: "#e74c3c" }}
                >
                  <h3>Bước 3: Ghi tên lên phong bì đựng mẫu</h3>
                </div>
                <div className="step-content">
                  <ul>
                    <li>
                      Điền tên, mối quan hệ, ngày thu mẫu trên phong bì đựng
                      mẫu.
                    </li>
                    <li>
                      Mỗi phong bì sẽ chứa mẫu riêng biệt của từng người để
                      tránh nhầm lẫn mẫu.
                    </li>
                    <li>
                      Lưu ý: Không nhận lẫn các túi đựng mẫu máu của từng người.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="guide-step">
                <div
                  className="step-header"
                  style={{ backgroundColor: "#e74c3c" }}
                >
                  <h3>Bước 4: Tiến hành thu mẫu máu xét nghiệm ADN</h3>
                </div>
                <div className="step-content">
                  <ul>
                    <li>Nên rửa tay sạch sẽ và lau khô trước khi thu mẫu.</li>
                    <li>
                      Chuẩn bị thể thu mẫu và đánh dấu đầu. Hoặc chuẩn bị tầm
                      bông để thấm mẫu.
                    </li>
                    <li>Vuốt nhẹ đầu ngón để cho máu đỏn vào đầu ngón tay.</li>
                    <li>
                      Dùng bông cồn lau sát trung vào vị trí đầu ngón tay.
                    </li>
                    <li>
                      Chờ cồn khô, dùng kim tiết trùng chích vào vị trí đầu ngón
                      tay.
                    </li>
                    <li>
                      Ép nhẹ đầu ngón, bóp nhẹ để máu ra. Để tránh phải nén
                      nhiều lần, nên để giọt mẫu to bằng hạt đậu từ thấm vào thẻ
                      FTA hoặc tầm bông.
                    </li>
                    <li>Để mẫu khô tự nhiên và cho vào phong bì.</li>
                  </ul>
                  <div className="guide-images">
                    <div className="image-container">
                      <img src={thuMauNgonTay} alt="Thu mẫu từ ngón tay" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="guide-step">
                <div
                  className="step-header"
                  style={{ backgroundColor: "#e74c3c" }}
                >
                  <h3>Bước 5: Lặp lại bước 4 thu mẫu cho mỗi người.</h3>
                </div>
                <div className="step-content">
                  <ul>
                    <li>Tiếp tục thu mẫu cho những người khác theo bước 4.</li>
                    <li>
                      Chú ý thu mẫu đúng người và đúng vào đúng phong bì chứa
                      mẫu.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="guide-step">
                <div
                  className="step-header"
                  style={{ backgroundColor: "#e74c3c" }}
                >
                  <h3>Bước 6: Gửi mẫu đến trung tâm xét nghiệm ADN</h3>
                </div>
                <div className="step-content">
                  <ul>
                    <li>
                      Đặt đơn xét nghiệm và tất cả các phong bì đựng mẫu vào một
                      phong bì lớn và gửi đến trung tâm.
                    </li>
                  </ul>
                  <div className="guide-images">
                    <div className="image-container">
                      <img src={dongGoiMau} alt="Đóng gói mẫu" />
                    </div>
                  </div>
                </div>
              </div>

              <p>
                <strong>Lưu ý:</strong>
              </p>
              <ul>
                <li>
                  a. Trong quá trình thu mẫu nên đeo khẩu trang hoặc hạn chế nói
                  chuyện để tránh cảm saliva rơi vào mẫu máu.
                </li>
                <li>
                  b. Nên chích kim vào phần cạnh bên phải hoặc bên trái đầu ngón
                  tay để tránh cảm giác đau buốt, vì ở giữa đầu ngón tay tập
                  trung nhiều dây thần kinh.
                </li>
                <li>
                  c. Nên đeo găng tay khi thu mẫu vì có không chạm vào mẫu.
                </li>
              </ul>
            </div>

            <div className="order-section">
              <h2>4. Tiến hành đặt mẫu máu xét nghiệm ADN</h2>
              <p>Chọn loại mẫu bạn muốn thực hiện:</p>
              <div className="service-options">
                <div
                  className="service-option"
                  style={{ backgroundColor: "#e74c3c" }}
                >
                  <span>Mẫu Hành Chính</span>
                </div>
                <div
                  className="service-option"
                  style={{ backgroundColor: "#e74c3c" }}
                >
                  <span>Mẫu Dân Sự</span>
                </div>
              </div>

              {/* Thêm bảng giá dịch vụ */}
              <div className="service-pricing">
                <h3>Bảng giá dịch vụ xét nghiệm ADN</h3>
                {loading ? (
                  <p>Đang tải dữ liệu...</p>
                ) : error ? (
                  <p className="text-danger">{error}</p>
                ) : (
                  <>
                    <h4>Dịch vụ Dân Sự</h4>
                    <table className="pricing-table">
                      <thead>
                        <tr>
                          <th>Tên dịch vụ</th>
                          <th>Giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {civilServices.length > 0 ? (
                          civilServices.map((service) => (
                            <tr key={service.id}>
                              <td>{service.name}</td>
                              <td>{service.price.toLocaleString("vi-VN")} VNĐ</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2}>Không có dịch vụ dân sự</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <h4 className="mt-4">Dịch vụ Hành Chính</h4>
                    <table className="pricing-table">
                      <thead>
                        <tr>
                          <th>Tên dịch vụ</th>
                          <th>Giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {administrativeServices.length > 0 ? (
                          administrativeServices.map((service) => (
                            <tr key={service.id}>
                              <td>{service.name}</td>
                              <td>{service.price.toLocaleString("vi-VN")} VNĐ</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2}>Không có dịch vụ hành chính</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>

              <div className="order-section">
                <h2>4. Tiến hành đặt mẫu máu xét nghiệm ADN</h2>
                <p>Chọn loại mẫu bạn muốn thực hiện:</p>
                <div className="service-options">
                  <div
                    className="service-option"
                    style={{ backgroundColor: "#e74c3c" }}
                  >
                    <span>Mẫu Hành Chính</span>
                  </div>
                  <div
                    className="service-option"
                    style={{ backgroundColor: "#e74c3c" }}
                  >
                    <span>Mẫu Dân Sự</span>
                  </div>
                </div>
                <div className="contact-info">
                  <h4>Liên hệ đặt hàng:</h4>
                  <p>📞 Hotline: +98 0123456789</p>
                  <p>📧 Email: genex@gmail.com</p>
                  <p>🏠 Địa chỉ: Khu công nghệ cao, Q9, Tp. Hồ Chí Minh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Guide;
