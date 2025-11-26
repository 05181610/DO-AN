import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthConText';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      console.log('📸 User avatar from context:', user.avatar);
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      // Handle avatar URL - prepend backend URL if relative
      const avatarUrl = user.avatar 
        ? user.avatar.startsWith('http') 
          ? user.avatar 
          : `http://localhost:5000/${user.avatar}`
        : null;
      console.log('🖼️ Avatar URL to display:', avatarUrl);
      setAvatarPreview(avatarUrl);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload ngay
      uploadAvatar(file);
    }
  };

  const uploadAvatar = async (file) => {
    try {
      console.log('📤 Starting avatar upload for file:', file.name, file.size, file.type);
      const formDataForUpload = new FormData();
      formDataForUpload.append('avatar', file);

      const response = await axiosClient.put('/users/avatar', formDataForUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('✅ Avatar upload response:', response.data);
      console.log('🖼️ Response avatar field:', response.data.avatar);

      // Update localStorage & AuthContext with returned user data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Update preview with full URL
      const avatarUrl = response.data.avatar
        ? response.data.avatar.startsWith('http')
          ? response.data.avatar
          : `http://localhost:5000/${response.data.avatar}`
        : null;
      console.log('🎨 Final avatar URL:', avatarUrl);
      setAvatarPreview(avatarUrl);
      
      toast.success('✅ Cập nhật ảnh đại diện thành công!');
      
      // Reload to update auth context
      window.location.reload();
    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      console.error('Error response:', error.response?.data);
      toast.error('❌ ' + (error.response?.data?.message || 'Cập nhật ảnh thất bại'));
      setAvatarPreview(user?.avatar || null); // Revert
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập tên');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.put('/users/profile', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      });

      console.log('Profile updated:', response.data);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      toast.success('✅ Cập nhật thông tin thành công!');
      
      // Redirect back to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('❌ ' + (error.response?.data?.message || 'Cập nhật thất bại'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">⏳ Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa thông tin cá nhân</h1>
            <p className="text-gray-600">Cập nhật thông tin hồ sơ và ảnh đại diện của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-900">Ảnh đại diện</label>
              
              <div className="flex items-center space-x-6">
                {/* Avatar Preview */}
                <div className="flex-shrink-0">
                  <img
                    src={avatarPreview || 'https://via.placeholder.com/120'}
                    alt="Avatar preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                  />
                </div>

                {/* Upload Button */}
                <div>
                  <label htmlFor="avatar-input" className="cursor-pointer">
                    <div className="flex items-center justify-center w-32 h-32 rounded-full border-2 border-dashed border-primary bg-primary/5 hover:bg-primary/10 transition-colors">
                      <PhotoIcon className="w-8 h-8 text-primary" />
                    </div>
                    <input
                      id="avatar-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">Bấm để chọn ảnh</p>
                  <p className="text-xs text-gray-400">Tối đa 5MB, JPG/PNG</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nhập tên của bạn"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0123456789"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-semibold"
              >
                {loading ? '⏳ Đang cập nhật...' : '💾 Lưu thay đổi'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
