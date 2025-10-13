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
      if (data.access_token) {
        login(data.access_token);
        toast.success('Đăng nhập thành công');
        navigate('/');
      } else {
        console.error('Invalid response format:', data);
        toast.error('Có lỗi xảy ra');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    },
  });
};