import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthConText';

export default function PrivateRoute({ children }) {
  const { token, isLoading } = useAuth();
  
  console.log('🔐 PrivateRoute check - token:', token ? 'Present' : 'Missing', 'isLoading:', isLoading);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">⏳ Đang tải...</div>;
  }
  
  if (!token) {
    console.log('❌ No token, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
