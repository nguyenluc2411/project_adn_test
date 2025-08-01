import { useEffect, useState } from "react";
import axiosClient from "../../config/AxiosClient";
import { useAuth } from "../../Context/AuthContext";
import formAdnImg from '../../assets/form-adn.png';
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";

export default function DanSuForm() {
  const today = new Date().toISOString().split("T")[0];
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const caseType = searchParams.get("caseType");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const navigate = useNavigate();
  const redirectedRef = useRef(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    email: "",
    numberOfParticipants: 2,
    collectionMethod: "",
    appointmentDate: "",
    participants: [{ fullName: "", gender: "", yearOfBirth: "", relationship: "" }],
  });

  const numParticipants = Number(formData.numberOfParticipants || 0);
  const fullPrice = selectedPrice;
  const discountPrice = selectedPrice * 0.9;

  const totalPrice = (() => {
    if (numParticipants <= 0) return 0;
    if (numParticipants === 1) return fullPrice;
    if (numParticipants === 2) return fullPrice + fullPrice * 0.9;
    return (fullPrice + fullPrice * 0.9) + (numParticipants - 2) * discountPrice;
  })();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axiosClient.get('/api/v1/account/profile');
        const profile = res.data;

        // Kiểm tra thiếu thông tin
        const missingFields = [];
        if (!profile.fullName) missingFields.push("Họ tên");
        if (!profile.phoneNumber) missingFields.push("Số điện thoại");
        if (!profile.email) missingFields.push("Email");
        if (!profile.address) missingFields.push("Địa chỉ");

        if (missingFields.length > 0 && !redirectedRef.current) {
          redirectedRef.current = true;
          alert(`Vui lòng cập nhật thông tin cá nhân trước khi đăng ký.\nThiếu: ${missingFields.join(", ")}`);
          navigate("/customer/profile?redirectTo=/customer/dansu", { replace: true });
          return;
        }
        setFormData((prev) => ({
          ...prev,
          fullName: profile.fullName || '',
          phoneNumber: profile.phoneNumber || '',
          email: profile.email || '',
          address: profile.address || '',
        }));
      } catch (err) {
        console.error("Không lấy được thông tin người dùng:", err);
      }
    };

    fetchUserInfo();
  }, []);


  useEffect(() => {
    const num = parseInt(formData.numberOfParticipants);
    const updated = Array.from({ length: num }, (_, i) =>
      formData.participants[i] || {
        fullName: "",
        gender: "",
        yearOfBirth: "",
        relationship: "",
      }
    );
    setFormData((prev) => ({ ...prev, participants: updated }));
  }, [formData.numberOfParticipants]);

  useEffect(() => {
    axiosClient.get("/api/registrations/services", {
      params: { caseType: "CIVIL" }
    })
      .then(res => setServices(res.data))
      .catch(err => console.error("Lỗi lấy danh sách dịch vụ:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleParticipantChange = (index, field, value) => {
    const updated = [...formData.participants];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, participants: updated }));
    setFieldErrors((prev) => ({
      ...prev,
      [`participant_${index}_${field}`]: undefined,
    }));
  };

  const validate = () => {
    let errors = {};
    if (!formData.collectionMethod) errors.collectionMethod = "Vui lòng chọn hình thức lấy mẫu";
    if (!selectedServiceId) errors.serviceId = "Vui lòng chọn dịch vụ";
    if (!numParticipants || isNaN(numParticipants)) {
      errors.numberOfParticipants = "Vui lòng nhập số người tham gia.";
    } else if (numParticipants < 2) {
      errors.numberOfParticipants = "Cần ít nhất 2 người tham gia để thực hiện xét nghiệm.";
    } else if (numParticipants > 10) {
      errors.numberOfParticipants = "Số người tham gia tối đa cho mỗi đơn là 10 người.";
    }
    if (
      formData.collectionMethod === "HOSPITAL" &&
      (!formData.appointmentDate || new Date(formData.appointmentDate) <= new Date(today))
    ) {
      errors.appointmentDate = "Ngày hẹn phải sau hôm nay";
    }
    formData.participants.forEach((p, i) => {
      if (!p.fullName) errors[`participant_${i}_fullName`] = "Nhập tên";
      if (!p.gender) errors[`participant_${i}_gender`] = "Chọn giới tính";
      if (!p.yearOfBirth) errors[`participant_${i}_yearOfBirth`] = "Nhập năm sinh";
      if (!p.relationship) errors[`participant_${i}_relationship`] = "Nhập quan hệ";
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validate()) {
      setMessage("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    try {
      setLoading(true);
      const data = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        email: formData.email,
        collectionMethod: formData.collectionMethod,
        numberOfParticipants: parseInt(formData.numberOfParticipants),
        serviceId: selectedServiceId,
        participants: formData.participants.map(p => ({
          fullName: p.fullName,
          gender: p.gender,
          yearOfBirth: Number(p.yearOfBirth),
          relationship: p.relationship
        }))
      };
      if (formData.collectionMethod === "HOSPITAL") {
        data.appointmentDate = formData.appointmentDate;
      }

      const res = await axiosClient.post("/api/registrations/register", data);
      const reg = res.data;

      const payRes = await axiosClient.post("/api/vnpay/create-payment", { id: reg.id });
      const payData = payRes.data;

      if (!payData.paymentUrl) throw new Error("Không nhận được URL thanh toán");

      sessionStorage.setItem("registrationId", reg.id);
      sessionStorage.setItem("paymentUrl", payData.paymentUrl);
      setMessage("Đăng ký thành công! Đang chuyển hướng đến trang thanh toán...");
      setTimeout(() => {
        window.location.href = payData.paymentUrl;
      }, 1200);
    } catch (err) {
      console.error("❌ Đã xảy ra lỗi khi gửi đơn:", err);
      setMessage("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-background-blue">
    
    <div className="container-fluid py-4">
      <div className="row align-items-stretch" style={{ minHeight: "100vh", maxHeight: "100vh" }}>
        <div className="col-md-6 d-flex p-0" style={{ maxHeight: "100vh" }}>
          <img
            src={formAdnImg}
            alt="Đăng ký xét nghiệm"
            className="img-fluid rounded shadow-sm w-100"
            style={{ objectFit: "contain", objectPosition: "top", height: "100%" }}
          />
        </div>

        <div className="col-md-6 d-flex align-items-center" style={{ maxHeight: "100vh" }}>
          <form
            onSubmit={handleSubmit}
            className="p-4 bg-white bg-opacity-75 shadow-lg rounded-4 border border-white border-opacity-50 w-100 backdrop-blur"
            style={{
              opacity: loading ? 0.7 : 1,
              pointerEvents: loading ? "none" : "auto",
              height: "100%",
              overflow: "auto",
            }}
          >
            <h2 className="mb-4 text-center fw-bold text-primary">
              Mẫu đăng ký xét nghiệm ADN dân sự
            </h2>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Họ và tên:</label>
                <input type="text" className="form-control bg-light" value={formData.fullName} readOnly />
              </div>

              <div className="col-md-6">
                <label className="form-label">Số điện thoại:</label>
                <input type="text" className="form-control bg-light" value={formData.phoneNumber} readOnly />
              </div>

              <div className="col-md-6">
                <label className="form-label">Email:</label>
                <input type="email" className="form-control bg-light" value={formData.email} readOnly />
              </div>
              <div className="col-md-6">
                <label className="form-label">Địa chỉ:</label>
                <input type="text" className="form-control bg-light" value={formData.address} readOnly />
              </div>

              <div className="col-md-6">
                <label className="form-label">Số người tham gia:</label>
                <input
                  type="number"
                  className="form-control bg-light"
                  name="numberOfParticipants"
                  value={formData.numberOfParticipants}
                  onChange={(e) => {
                    let value = parseInt(e.target.value || "0", 10);

                    if (isNaN(value) || value < 1) value = 0;
                    if (value > 99) value = 99;

                    setFormData((prev) => ({ ...prev, numberOfParticipants: value }));
                    setFieldErrors((prev) => ({ ...prev, numberOfParticipants: undefined }));
                  }}

                  max="99"
                />
                {fieldErrors.numberOfParticipants && (
                  <div className="text-danger small">{fieldErrors.numberOfParticipants}</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Hình thức lấy mẫu:</label>
                <select
                  className="form-select bg-light"
                  name="collectionMethod"
                  value={formData.collectionMethod}
                  onChange={handleChange}

                >
                  <option value="">--Chọn--</option>
                  <option value="HOME">Tại nhà</option>
                  <option value="HOSPITAL">Tại bệnh viện</option>
                </select>
                {fieldErrors.collectionMethod && (
                  <div className="text-danger small">{fieldErrors.collectionMethod}</div>
                )}
              </div>

              {formData.collectionMethod === "HOSPITAL" && (
                <div className="col-md-12">
                  <label className="form-label">Ngày hẹn:</label>
                  <input
                    type="date"
                    className="form-control bg-light"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={today}

                  />
                  {fieldErrors.appointmentDate && (
                    <div className="text-danger small">{fieldErrors.appointmentDate}</div>
                  )}
                </div>
              )}

              {services.length > 0 && (
                <div className="col-md-12">
                  <label className="form-label">Chọn dịch vụ:</label>
                  <select
                    className="form-select bg-light"
                    value={selectedServiceId || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setSelectedServiceId(Number(selectedId));
                      const selected = services.find(s => s.id === Number(selectedId));
                      setSelectedPrice(selected?.price || 0);
                      setFieldErrors(prev => ({ ...prev, serviceId: undefined }));
                    }}
                  >
                    <option value="">--Chọn dịch vụ--</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.serviceId && (
                    <div className="text-danger small">{fieldErrors.serviceId}</div>
                  )}
                </div>
              )}

              {selectedPrice > 0 && (
                <div className="col-md-12 text-end text-muted">
                  <small>
                    Tổng giá dịch vụ:{" "}
                    <span className="fw-bold text-primary">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(totalPrice)}
                    </span>
                  </small>
                </div>
              )}


            </div>

            <hr className="my-4" />

            {formData.participants.map((p, i) => (
              <div className="p-4 mb-4 bg-white bg-opacity-50 rounded-4 shadow-sm border border-white border-opacity-50 backdrop-blur" key={i}>
                <h6 className="mb-3">Người tham gia {String.fromCharCode(65 + i)}</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Họ tên:</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={p.fullName}
                      onChange={(e) => handleParticipantChange(i, "fullName", e.target.value)}
                    />
                    {fieldErrors[`participant_${i}_fullName`] && (
                      <div className="text-danger small">{fieldErrors[`participant_${i}_fullName`]}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Giới tính:</label>
                    <select
                      className="form-select bg-light"
                      value={p.gender}
                      onChange={(e) => handleParticipantChange(i, "gender", e.target.value)}
                    >
                      <option value="">--Chọn--</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                    </select>
                    {fieldErrors[`participant_${i}_gender`] && (
                      <div className="text-danger small">{fieldErrors[`participant_${i}_gender`]}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Năm sinh:</label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={p.yearOfBirth}
                      onChange={(e) => handleParticipantChange(i, "yearOfBirth", e.target.value)}
                    />
                    {fieldErrors[`participant_${i}_yearOfBirth`] && (
                      <div className="text-danger small">{fieldErrors[`participant_${i}_yearOfBirth`]}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Quan hệ:</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={p.relationship}
                      onChange={(e) => handleParticipantChange(i, "relationship", e.target.value)}
                    />
                    {fieldErrors[`participant_${i}_relationship`] && (
                      <div className="text-danger small">{fieldErrors[`participant_${i}_relationship`]}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Nộp và thanh toán"}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}