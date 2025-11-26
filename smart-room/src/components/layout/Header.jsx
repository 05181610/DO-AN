import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthConText';
import { useEffect, useState } from 'react';

export default function Header() {
  const { user, logout, isLoading, token } = useAuth();
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // ✅ Force re-render khi token hoặc user thay đổi
  useEffect(() => {
    console.log('📌 Header useEffect triggered - token:', !!token, 'user:', !!user);
    setForceUpdate(prev => prev + 1);
  }, [token, user]);
  
  // ✅ Fallback: nếu user null nhưng token exists, lấy từ localStorage
  const displayUser = user || (token ? JSON.parse(localStorage.getItem('user') || 'null') : null);
  
  // ✅ Get full avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:5000/${avatarPath}`;
  };
  
  // ✅ Debug: kiểm tra localStorage
  const savedUser = localStorage.getItem('user');
  const savedToken = localStorage.getItem('token');
  
  console.log('🧭 Header render #' + forceUpdate + ':');
  console.log('  ├─ token:', !!token);
  console.log('  ├─ user from context:', user ? user.fullName : 'null');
  console.log('  ├─ displayUser:', displayUser ? displayUser.fullName : 'null');
  console.log('  ├─ isLoading:', isLoading);
  console.log('  ├─ localStorage.user exists:', !!savedUser);
  console.log('  └─ localStorage.token exists:', !!savedToken);
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-primary">
            SmartRoom
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/rooms" className="text-gray-600 hover:text-primary">
              Tìm phòng
            </Link>
            {isLoading ? (
              <span className="text-gray-500">⏳ Loading...</span>
            ) : displayUser ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary"
                >
                  {displayUser.avatar && (
                    <img 
                      src={getAvatarUrl(displayUser.avatar)} 
                      alt={displayUser.fullName} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span>👤 {displayUser.fullName || 'Tài khoản'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-primary"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary">
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}