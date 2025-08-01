import React, { useState, useEffect } from 'react';
import axiosClient from '../../config/AxiosClient';
import '../StaffDashboard.css';
import StaffSidebarNav from '../../Staff/StaffSidebarNav';
export default function StaffProfile() {
  const [staff, setStaff] = useState({
    fullName: '',
    role: '',
    email: '',
    gender: '',
    startDate: '',
  });

  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const loadProfile = async () => {
    try {
      const res = await axiosClient.get('/api/v1/account/profile');
      const data = res.data;

      setStaff({
        fullName: data.fullName || '',
        role: data.role === 'RECORDER_STAFF' ? 'Nhân viên ghi nhận mẫu' : data.role,
        email: data.email || '',
        gender: data.gender || '',
        startDate: data.startDate || '',
      });
      setPhone(data.phoneNumber || '');
      setAvatarUrl(data.avatar || '');
    } catch (err) {
      console.error("❌ Lỗi khi tải hồ sơ:", err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);
    }
  };

  const handleSave = async () => {
    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const uploadRes = await axiosClient.post('/api/v1/account/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        finalAvatarUrl = uploadRes.data.avatarUrl;
      }

      await axiosClient.put('/api/v1/account/profile', {
        fullName: staff.fullName,
        phoneNumber: phone,
        gender: staff.gender,
        avatar: finalAvatarUrl,
      });

      await loadProfile();
      setIsEditing(false);
      setAvatarFile(null);
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật hồ sơ:", err);
    }
  };

  const handleInputChange = (e) => {
    setStaff((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const displayGender = (value) => {
    if (value === 'MALE') return 'Nam';
    if (value === 'FEMALE') return 'Nữ';
    return '';
  };

  const displayDate = (dateStr) => {
    if (!dateStr) return '(Chưa có)';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="staff-bg">
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <aside className="col-md-2 d-none d-md-block staff-sidebar">
            <StaffSidebarNav />
          </aside>
          {/* Main Content */}
          <main className="col-md-10 ms-sm-auto px-4 py-4">
            <h3 className="text-primary fw-bold mb-4">Hồ sơ nhân viên</h3>

            <div className="card mb-4 shadow-sm">
              <div className="card-body d-flex align-items-center gap-3">
                <img
                  src={
                    avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.fullName)}&background=6f42c1&color=fff&size=96`
                  }
                  alt="avatar"
                  className="rounded-circle border border-2"
                  width="96"
                  height="96"
                />
                <div className="flex-grow-1">
                  {isEditing && (
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control mb-2"
                      onChange={handleAvatarChange}
                    />
                  )}
                  <h5 className="fw-bold">{staff.fullName}</h5>
                  <div className="text-muted">{staff.role}</div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                {[
                  { label: 'Email', value: staff.email },
                  {
                    label: 'Họ và tên',
                    value: staff.fullName,
                    editable: true,
                    name: 'fullName',
                    type: 'text',
                  },
                  {
                    label: 'Số điện thoại',
                    value: phone,
                    editable: true,
                    type: 'text',
                    onChange: (e) => setPhone(e.target.value),
                  },
                  {
                    label: 'Giới tính',
                    value: staff.gender,
                    editable: true,
                    name: 'gender',
                    type: 'select',
                    options: [
                      { value: 'MALE', label: 'Nam' },
                      { value: 'FEMALE', label: 'Nữ' },
                    ],
                  },
                  {
                    label: 'Ngày vào làm',
                    value: displayDate(staff.startDate),
                    editable: false,
                  },
                ].map((field, idx) => (
                  <div className="mb-3 row" key={idx}>
                    <label className="col-sm-3 col-form-label text-muted">{field.label}</label>
                    <div className="col-sm-9">
                      {isEditing && field.editable ? (
                        field.type === 'select' ? (
                          <select
                            className="form-select"
                            name={field.name}
                            value={staff[field.name]}
                            onChange={handleInputChange}
                          >
                            <option value="">-- Chọn giới tính --</option>
                            {field.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            className="form-control"
                            name={field.name}
                            value={field.name ? staff[field.name] : field.value}
                            onChange={field.onChange || handleInputChange}
                          />
                        )
                      ) : (
                        <p className="form-control-plaintext fw-semibold">
                          {field.label === 'Giới tính'
                            ? displayGender(field.value)
                            : field.value || <i>Không có</i>}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="text-end mt-4">
                  {isEditing ? (
                    <button className="btn btn-primary" onClick={handleSave}>
                      Lưu thay đổi
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}