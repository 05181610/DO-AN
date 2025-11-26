import { createContext, useState, useContext, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ✅ Khởi tạo từ localStorage
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    console.log('📦 Initial token from localStorage:', savedToken ? 'Found' : 'Not found');
    return savedToken;
  });
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      console.log('📦 Initial user from localStorage:', JSON.parse(savedUser));
      return JSON.parse(savedUser);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(!!token);

  useEffect(() => {
    console.log('🔄 useEffect triggered, token:', token ? 'Present' : 'Null');
    
    if (token) {
      // ✅ Thêm token vào header
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Authorization header set');
      
      // ✅ Fetch fresh user profile
      setIsLoading(true);
      axiosClient.get('/users/profile')
        .then(response => {
          console.log('👤 Fresh profile fetched:', response.data);
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('❌ Error fetching profile:', error.message);
          // ✅ Clear token khi fetch profile fail
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          delete axiosClient.defaults.headers.common['Authorization'];
          setIsLoading(false);
        });
    } else {
      // ✅ Xóa token từ header
      delete axiosClient.defaults.headers.common['Authorization'];
      localStorage.removeItem('user');
      setUser(null);
      setIsLoading(false);
      console.log('🚪 Logged out');
    }
  }, [token]);

  const login = (newToken, userData = null) => {
    console.log('🔐 AuthContext.login() called with:', { newToken: newToken.slice(0, 20) + '...', userData });
    
    // ✅ Set user ngay lập tức từ userData
    if (userData) {
      setUser(userData);
    }
    
    // ✅ Lưu vào localStorage
    localStorage.setItem('token', newToken);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    // ✅ Set token (trigger useEffect)
    setToken(newToken);
    setIsLoading(true);
    
    console.log('✅ Token & user saved to localStorage');
  };

  const logout = () => {
    console.log('🚪 Logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axiosClient.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};