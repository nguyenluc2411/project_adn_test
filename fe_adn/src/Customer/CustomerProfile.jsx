import React, { useEffect, useState } from 'react';
import axiosClient from '../config/AxiosClient';
import { useAuth } from '../Context/AuthContext';
import Header from '../Header/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useSearchParams, useNavigate } from 'react-router-dom';

const CustomerProfile = () => {
  const { user, refreshUserData } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    dob: '',
    avatar: '',
    address: '',
    email: '',
  });

  const [avatarPreview, setAvatarPreview] = useState('');

  const [newAvatar, setNewAvatar] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get('/api/v1/account/profile');
      const profile = res.data;

      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        gender: profile.gender || '',
        dob: profile.dob ? profile.dob.split('T')[0] : '',
        avatar: profile.avatar || '',
        address: profile.address || '',
        email: profile.email || '',
      });

      const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        profile.fullName || 'User'
      )}&background=0D8ABC&color=fff&size=128`;

      setAvatarPreview(profile.avatar || fallbackAvatar);
    } catch (err) {
      console.error('Fetch profile error:', err);
      alert('Không thể tải profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file ảnh (JPG, PNG, GIF)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }

      setNewAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!newAvatar) {
      alert('Vui lòng chọn ảnh trước khi cập nhật');
      return;
    }

    const data = new FormData();
    data.append('file', newAvatar);

    try {
      setIsUploading(true);
      const res = await axiosClient.post('/api/v1/account/avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data.avatarUrl;
      setFormData((prev) => ({ ...prev, avatar: uploadedUrl }));
      setAvatarPreview(uploadedUrl);

      if (refreshUserData) {
        await refreshUserData();
      } else {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.avatar = uploadedUrl;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }

      setNewAvatar(null);
      alert('Cập nhật ảnh đại diện thành công');
    } catch (err) {
      console.error('Upload avatar error:', err);
      alert('Lỗi tải ảnh: ' + (err.response?.data?.message || 'Không xác định'));
    } finally {
      setIsUploading(false);
    }
  };

  const updateProfile = async () => {
    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập họ tên');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }

    try {
      await axiosClient.put('/api/v1/account/profile', formData);

      if (refreshUserData) {
        await refreshUserData();
      } else {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        Object.assign(storedUser, formData);
        localStorage.setItem('user', JSON.stringify(storedUser));
      }

      alert('Cập nhật thông tin thành công');
      const redirectTo = searchParams.get('redirectTo');
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        await fetchProfile();
      }
    } catch (err) {
      console.error('Update profile error:', err);
      alert('Cập nhật thất bại: ' + (err.response?.data?.message || 'Không xác định'));
    }
  };

  return (
    <Header>
      <div className="container my-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="text-center mb-4">Thông tin cá nhân</h3>

            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="rounded-circle border"
                  width="120"
                  height="120"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      formData.fullName || 'User'
                    )}&background=0D8ABC&color=fff&size=128`;
                  }}
                />
                {newAvatar && (
                  <div className="position-absolute top-0 end-0">
                    <span className="badge bg-primary rounded-pill">New</span>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <input
                  type="file"
                  className="form-control w-50 mx-auto mb-2"
                  onChange={handleAvatarChange}
                  accept="image/*"
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={uploadAvatar}
                  disabled={isUploading || !newAvatar}
                >
                  {isUploading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập nhật ảnh đại diện'
                  )}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="row mb-3">
              <label className="col-sm-3 col-form-label">Email</label>
              <div className="col-sm-9">
                <input
                  name="email"
                  value={formData.email}
                  readOnly
                  className="form-control bg-light"
                  placeholder="Chưa có email"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="row mb-3">
              <label className="col-sm-3 col-form-label">
                Họ tên <span className="text-danger">*</span>
              </label>
              <div className="col-sm-9">
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="row mb-3">
              <label className="col-sm-3 col-form-label">
                Số điện thoại <span className="text-danger">*</span>
              </label>
              <div className="col-sm-9">
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Nhập số điện thoại"
                  pattern="[0-9]{10,11}"
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div className="row mb-3">
              <label className="col-sm-3 col-form-label">Giới tính</label>
              <div className="col-sm-9">
                <select
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </div>
            </div>

            {/* DOB */}
            <div className="row mb-3">
              <label className="col-sm-3 col-form-label">Ngày sinh</label>
              <div className="col-sm-9">
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="form-control"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Address */}
            <div className="row mb-4">
              <label className="col-sm-3 col-form-label">Địa chỉ</label>
              <div className="col-sm-9">
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="2"
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>
            </div>

            <div className="text-end">
              <button className="btn btn-success px-4" onClick={updateProfile}>
                <i className="fas fa-save me-2"></i>
                Cập nhật thông tin
              </button>
            </div>
          </div>
        </div>
      </div>
    </Header>
  );
};

export default CustomerProfile;
