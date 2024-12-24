import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Về SmartRoom</h3>
            <p className="text-gray-400">
              Nền tảng kết nối người thuê và chủ trọ, giúp việc tìm kiếm và cho thuê phòng trở nên dễ dàng hơn.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/rooms" className="text-gray-400 hover:text-white">
                  Tìm Phòng
                </Link>
              </li>
              <li>
                <Link to="/post-room" className="text-gray-400 hover:text-white">
                  Đăng Tin
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  Về Chúng Tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: contact@smartroom.com</li>
              <li>Phone: (84) 123 456 789</li>
              <li>Address: 123 ABC Street, XYZ City</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Theo dõi chúng tôi</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 SmartRoom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};