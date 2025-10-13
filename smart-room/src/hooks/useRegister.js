import { useMutation } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data) => {
      if (data.password !== data.confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }

      const { confirmPassword, ...registerData } = data;
      
      try {
        const response = await axiosClient.post('/auth/register', registerData);
        console.log('Register response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Register error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success('Đăng ký thành công');
      navigate('/login');
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Đăng ký thất bại';
      toast.error(message);
    },
  });
};
  