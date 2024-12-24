import React from 'react';
import { create } from 'zustand';
import { CONSTANTS } from '../utils/constants';

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  login: (userData, token) => 
    set({ isAuthenticated: true, user: userData, token }),
  logout: () => 
    set({ isAuthenticated: false, user: null, token: null }),
}));

export const useAuth = () => {
  const { isAuthenticated, user, token, login, logout } = useAuthStore();

  // Check for existing token in localStorage on initialization
  React.useEffect(() => {
    const storedToken = localStorage.getItem(CONSTANTS.NAME_TOKEN);
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      login(JSON.parse(storedUser), storedToken);
    }
  }, []);

  // Handle login
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    login(userData, token);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
  };

  return {
    isAuthenticated,
    user,
    token,
    login: handleLogin,
    logout: handleLogout,
  };
}; 