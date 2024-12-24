import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthConText';

export default function Header() {
  const { user, logout } = useAuth();
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
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary">
                  {user.fullName || 'Tài khoản'}
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