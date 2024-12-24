import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '@/api/axiosClient';
import ChangePasswordForm from './ChangePasswordForm';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileSection() {
  const { user: authUser, setUser } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: null
  });

  useEffect(() => {
    if (authUser) {
      setProfile({
        fullName: authUser.fullName || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
        avatar: authUser.avatar || null
      });
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosClient.put('/api/users/profile', profile);
      setUser(response.data);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axiosClient.put('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(response.data);
      toast.success('Cập nhật ảnh đại diện thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật ảnh thất bại');
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Form */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>
        
        {/* Avatar */}
        <div className="mb-6 flex items-center space-x-4">
          <img
            src={profile.avatar || "https://via.placeholder.com/100"}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <label
              htmlFor="avatar"
              className="bg-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-secondary"
            >
              Thay đổi ảnh
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Họ và tên</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={profile.fullName}
              onChange={(e) => setProfile({...profile, fullName: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Số điện thoại</label>
            <input
              type="tel"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-secondary"
          >
            Cập nhật thông tin
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <ChangePasswordForm />
      </div>
    </div>
  );
}