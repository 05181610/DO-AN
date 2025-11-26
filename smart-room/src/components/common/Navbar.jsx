import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthConText';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { user, logout, token, isLoading } = useAuth();
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // ✅ Force re-render khi token hoặc user thay đổi
  useEffect(() => {
    console.log('📌 Navbar useEffect triggered - token:', !!token, 'user:', !!user);
    setForceUpdate(prev => prev + 1);
  }, [token, user]);
  
  // ✅ Fallback: lấy từ localStorage nếu context user null
  const displayUser = user || (token ? JSON.parse(localStorage.getItem('user') || 'null') : null);
  const isAuthenticated = !!token;

  // ✅ Get full avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '/default-avatar.png';
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:5000/${avatarPath}`;
  };

  console.log('🧭 Navbar render #' + forceUpdate + ':');
  console.log('  ├─ isAuthenticated:', isAuthenticated);
  console.log('  ├─ displayUser:', displayUser ? displayUser.fullName : 'null');
  console.log('  └─ isLoading:', isLoading);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary">Smart Room</h1>
            </Link>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Trang chủ
              </Link>
              <Link
                to="/rooms"
                className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Tìm phòng
              </Link>
              {isAuthenticated && (
                <Link
                  to="/post-room"
                  className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Đăng phòng
                </Link>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/favorites"
                  className="text-gray-900 hover:text-gray-700"
                >
                  Yêu thích
                </Link>
                <div className="relative group">
                  <button className="flex text-sm rounded-full focus:outline-none">
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={getAvatarUrl(displayUser?.avatar)}
                      alt="User avatar"
                    />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="hidden group-hover:block absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Hồ sơ
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Quản lý
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white hover:bg-primary-dark px-3 py-2 rounded-md text-sm font-medium"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;