import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthConText';

export const useLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data) => {
      try {
        console.log('Attempting login with:', data);
        const response = await axiosClient.post('/auth/login', data);
        console.log('Login response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Login error:', error?.response?.data || error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Login success, data:', data);
      
      if (data.access_token) {
        console.log('🔐 access_token found, calling login()');
        // Lưu token và user data cùng lúc
        login(data.access_token, data.user);
        
        console.log('✅ Saved to AuthContext, navigating to /dashboard');
        toast.success('Đăng nhập thành công');
        navigate('/dashboard');  // ← THAY ĐỔI: Điều hướng đến /dashboard
      } else {
        console.error('❌ Invalid response format:', data);
        toast.error('Có lỗi xảy ra');
      }
    },
    onError: (error) => {
      console.error('❌ Login error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    },
  });
};