import { useState } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '@/api/axiosClient';

export default function ChangePasswordForm() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }

    try {
      const response = await axiosClient.put('/users/change-password', passwords);
      toast.success(response.data.message);
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-semibold">Đổi mật khẩu</h3>
      
      <div>
        <label className="block text-gray-700 mb-2">Mật khẩu hiện tại</label>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          value={passwords.currentPassword}
          onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Mật khẩu mới</label>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          value={passwords.newPassword}
          onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          value={passwords.confirmPassword}
          onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-secondary"
      >
        Đổi mật khẩu
      </button>
    </form>
  );
} 