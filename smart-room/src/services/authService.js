import axiosClient from '../api/axiosClient';

export const authService = {
  async login(credentials) {
    try {
      console.log('Sending login request:', credentials);
      const response = await axiosClient.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        return response.data;
      }
      throw new Error('Token not found in response');
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    delete axiosClient.defaults.headers.common['Authorization'];
  }
}; 