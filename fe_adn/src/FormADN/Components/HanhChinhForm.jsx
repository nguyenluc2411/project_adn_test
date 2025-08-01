import { useEffect, useState, useRef } from "react";
import axiosClient from "../../config/AxiosClient";
import { useAuth } from "../../Context/AuthContext";
import formAdnImg from '../../assets/form-adn.png';
import { useNavigate } from "react-router-dom";

export default function HanhChinhForm() {
  const today = new Date().toISOString().split("T")[0];
  const { user } = useAuth();
  const navigate = useNavigate();
  const redirectedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    email: "",
    numberOfParticipants: 2,
    appointmentDate: "",
    participants: [],
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

        const missing = [];
        if (!profile.fullName) missing.push("Họ tên");
        if (!profile.phoneNumber) missing.push("Số điện thoại");
        if (!profile.email) missing.push("Email");
        if (!profile.address) missing.push("Địa chỉ");

        if (missing.length > 0 && !redirectedRef.current) {
          redirectedRef.current = true;
          alert(`Vui lòng cập nhật thông tin cá nhân trước khi đăng ký.\nThiếu: ${missing.join(", ")}`);
          navigate("/customer/profile?redirectTo=/customer/hanhchinh", { replace: true });
          return;
        }

        setFormData((prev) => ({
          ...prev,
          fullName: profile.fullName || "",
          phoneNumber: profile.phoneNumber || "",
          address: profile.address || "",
          email: profile.email || "",
        }));
      } catch (err) {
        console.error("Không lấy được thông tin người dùng:", err);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    axiosClient.get("/api/registrations/services", {
      params: { caseType: "ADMINISTRATIVE" }
    })
      .then(res => setServices(res.data))
      .catch(err => console.error("Lỗi lấy danh sách dịch vụ:", err));
  }, []);

  useEffect(() => {
    const num = parseInt(formData.numberOfParticipants);
    const updated = Array.from({ length: num }, (_, i) =>
      formData.participants[i] || {
        fullName: "",
        gender: "",
        identityNumber: "",
        issueDate: "",
        issuePlace: "",
        yearOfBirth: "",
        relationship: "",
      }
    );
    setFormData((prev) => ({ ...prev, participants: updated }));
  }, [formData.numberOfParticipants]);

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

    // Validate appointment date
    if (!formData.appointmentDate) {
      errors.appointmentDate = "Vui lòng chọn ngày hẹn";
    } else if (formData.appointmentDate <= today) {
      errors.appointmentDate = "Ngày hẹn phải sau hôm nay";
    } else {
      const appointmentDate = new Date(formData.appointmentDate);
      const todayDate = new Date();
      const diffTime = appointmentDate - todayDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 2) {
        errors.appointmentDate = "Ngày hẹn phải sau hôm nay";
      }
    }

    // Validate number of participants
    if (!formData.numberOfParticipants || isNaN(formData.numberOfParticipants)) {
      errors.numberOfParticipants = "Vui lòng nhập số người tham gia";
    } else if (formData.numberOfParticipants < 2) {
      errors.numberOfParticipants = "Phải có ít nhất 2 người tham gia";
    } else if (formData.numberOfParticipants > 10) {
      errors.numberOfParticipants = "Tối đa 10 người tham gia";
    }

    // Validate service selection
    if (!selectedServiceId) {
      errors.serviceId = "Vui lòng chọn dịch vụ";
    }

    // Validate participants
    formData.participants.forEach((p, i) => {
      // Full name validation - chỉ kiểm tra rỗng
      if (!p.fullName) {
        errors[`participant_${i}_fullName`] = "Vui lòng nhập họ tên";
      }

      // Gender validation
      if (!p.gender) {
        errors[`participant_${i}_gender`] = "Vui lòng chọn giới tính";
      }

      // Identity number validation
      if (!p.identityNumber) {
        errors[`participant_${i}_identityNumber`] = "Vui lòng nhập số CCCD";
      } else if (!/^\d{9,12}$/.test(p.identityNumber)) {
        errors[`participant_${i}_identityNumber`] = "Số CCCD phải có 9-12 chữ số";
      }

      // Issue date validation - chỉ kiểm tra rỗng và không trong tương lai
      if (!p.issueDate) {
        errors[`participant_${i}_issueDate`] = "Vui lòng nhập ngày cấp";
      } else {
        const issueDate = new Date(p.issueDate);
        const todayDate = new Date();

        if (issueDate > todayDate) {
          errors[`participant_${i}_issueDate`] = "Ngày cấp không thể trong tương lai";
        }
      }

      // Issue place validation
      if (!p.issuePlace) {
        errors[`participant_${i}_issuePlace`] = "Vui lòng nhập nơi cấp";
      } else if (p.issuePlace.length < 3) {
        errors[`participant_${i}_issuePlace`] = "Nơi cấp phải có ít nhất 3 ký tự";
      }

      // Year of birth validation
      if (!p.yearOfBirth) {
        errors[`participant_${i}_yearOfBirth`] = "Vui lòng nhập năm sinh";
      } else {
        const birthYear = parseInt(p.yearOfBirth);
        const currentYear = new Date().getFullYear();

        if (isNaN(birthYear) || birthYear < 1900) {
          errors[`participant_${i}_yearOfBirth`] = "Năm sinh phải từ 1900 trở lên";
        } else if (birthYear > currentYear) {
          errors[`participant_${i}_yearOfBirth`] = "Năm sinh không thể trong tương lai";
        } else if (currentYear - birthYear < 0) {
          errors[`participant_${i}_yearOfBirth`] = "Tuổi không hợp lệ";
        } else if (currentYear - birthYear > 150) {
          errors[`participant_${i}_yearOfBirth`] = "Tuổi quá lớn";
        }
      }

      // Relationship validation - chỉ kiểm tra rỗng
      if (!p.relationship) {
        errors[`participant_${i}_relationship`] = "Vui lòng nhập mối quan hệ";
      }
    });

    // Check for duplicate identity numbers
    const identityNumbers = formData.participants.map(p => p.identityNumber).filter(id => id);
    const duplicateIds = identityNumbers.filter((id, index) => identityNumbers.indexOf(id) !== index);

    if (duplicateIds.length > 0) {
      formData.participants.forEach((p, i) => {
        if (duplicateIds.includes(p.identityNumber)) {
          errors[`participant_${i}_identityNumber`] = "Số CCCD bị trùng lặp";
        }
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validate()) {
      setMessage("Vui lòng kiểm tra lại thông tin và sửa các lỗi được đánh dấu!");
      return;
    }

    try {
      setLoading(true);
      const data = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        email: formData.email,
        numberOfParticipants: parseInt(formData.numberOfParticipants),
        collectionMethod: "HOSPITAL",
        appointmentDate: formData.appointmentDate,
        serviceId: selectedServiceId,
        participants: formData.participants.map(p => ({
          ...p,
          yearOfBirth: parseInt(p.yearOfBirth)
        })),
      };

      const res = await axiosClient.post("/api/registrations/register", data);
      const reg = res.data;

      const payRes = await axiosClient.post("/api/vnpay/create-payment", { id: reg.id });
      const payData = payRes.data;

      if (!payData.paymentUrl) {
        throw new Error("Không nhận được URL thanh toán");
      }

      sessionStorage.setItem("registrationId", reg.id);
      sessionStorage.setItem("paymentUrl", payData.paymentUrl);
      setMessage("Đăng ký thành công! Đang chuyển hướng đến trang thanh toán...");

      setTimeout(() => {
        window.location.href = payData.paymentUrl;
      }, 1200);
    } catch (err) {
      console.error("❌ Đã xảy ra lỗi khi đăng ký:", err);
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
              className="p-5 bg-white bg-opacity-75 shadow-lg rounded-4 border border-white border-opacity-50 w-100 backdrop-blur"
              style={{
                opacity: loading ? 0.7 : 1,
                pointerEvents: loading ? "none" : "auto",
                height: "100%",
                overflow: "auto",
              }}
            >
              <h2 className="mb-4 text-primary text-center fw-bold">Mẫu đăng ký xét nghiệm ADN hành chính</h2>

              {message && (
                <div className={`alert ${message.includes("thành công") ? "alert-success" : "alert-danger"} text-center`}>
                  {message}
                </div>
              )}

              <div className="row g-3">
                {["fullName", "phoneNumber", "email", "address"].map((field) => (
                  <div className="col-md-6" key={field}>
                    <label className="form-label">{{
                      fullName: "Họ tên",
                      phoneNumber: "Số điện thoại",
                      email: "Email",
                      address: "Địa chỉ"
                    }[field]}</label>
                    <input type="text" className="form-control bg-light" value={formData[field]} readOnly />
                  </div>
                ))}

                <div className="col-md-6">
                  <label className="form-label">Số người tham gia:</label>
                  <input
                    type="number"
                    className={`form-control ${fieldErrors.numberOfParticipants ? 'is-invalid' : ''}`}
                    name="numberOfParticipants"
                    value={formData.numberOfParticipants}
                    onChange={(e) => {
                      let value = parseInt(e.target.value || "0", 10);
                      if (isNaN(value) || value < 0) value = 0;
                      if (value > 10) value = 10;
                      setFormData((prev) => ({ ...prev, numberOfParticipants: value }));
                      setFieldErrors((prev) => ({ ...prev, numberOfParticipants: undefined }));
                    }}
                    min="2"
                    max="10"
                  />
                  {fieldErrors.numberOfParticipants && (
                    <div className="invalid-feedback">{fieldErrors.numberOfParticipants}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Ngày hẹn:</label>
                  <input
                    type="date"
                    className={`form-control ${fieldErrors.appointmentDate ? 'is-invalid' : ''}`}
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                  {fieldErrors.appointmentDate && (
                    <div className="invalid-feedback">{fieldErrors.appointmentDate}</div>
                  )}
                </div>

                <div className="col-md-12">
                  <label className="form-label">Chọn dịch vụ:</label>
                  <select
                    className={`form-select ${fieldErrors.serviceId ? 'is-invalid' : ''}`}
                    value={selectedServiceId || ""}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedServiceId(id);
                      const selected = services.find(s => s.id === id);
                      setSelectedPrice(selected?.price || 0);
                      setFieldErrors(prev => ({ ...prev, serviceId: undefined }));
                    }}
                  >
                    <option value="">--Chọn dịch vụ--</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {fieldErrors.serviceId && (
                    <div className="invalid-feedback">{fieldErrors.serviceId}</div>
                  )}
                </div>

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
                    {[
                      { field: "fullName", label: "Họ tên", placeholder: "Nhập họ và tên đầy đủ" },
                      { field: "gender", label: "Giới tính", type: "select", options: [{ value: "MALE", label: "Nam" }, { value: "FEMALE", label: "Nữ" }] },
                      { field: "identityNumber", label: "Số CCCD", placeholder: "Nhập số căn cước công dân" },
                      { field: "issueDate", label: "Ngày cấp", type: "date" },
                      { field: "issuePlace", label: "Nơi cấp", placeholder: "Ví dụ: Công an TP.HCM" },
                      { field: "yearOfBirth", label: "Năm sinh", type: "number", placeholder: "Ví dụ: 1990" },
                      { field: "relationship", label: "Quan hệ", placeholder: "Ví dụ: Con, Cha, Mẹ, Anh, Chị" },
                    ].map(({ field, label, type, options, placeholder }) => (
                      <div className="col-md-6" key={field}>
                        <label className="form-label">{label}:</label>
                        {type === "select" ? (
                          <select
                            className={`form-select ${fieldErrors[`participant_${i}_${field}`] ? 'is-invalid' : ''}`}
                            value={p[field]}
                            onChange={(e) => handleParticipantChange(i, field, e.target.value)}
                          >
                            <option value="">--Chọn--</option>
                            {options.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={type || "text"}
                            className={`form-control ${fieldErrors[`participant_${i}_${field}`] ? 'is-invalid' : ''}`}
                            value={p[field]}
                            placeholder={placeholder}
                            onChange={(e) => handleParticipantChange(i, field, e.target.value)}
                            min={type === "number" ? "1900" : undefined}
                            max={type === "number" ? new Date().getFullYear() : undefined}
                          />
                        )}
                        {fieldErrors[`participant_${i}_${field}`] && (
                          <div className="invalid-feedback">{fieldErrors[`participant_${i}_${field}`]}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang xử lý...
                  </>
                ) : (
                  "Nộp đơn và thanh toán"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}