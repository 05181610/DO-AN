import { useAuth } from '../../contexts/AuthConText';
import { HomeIcon, BuildingOfficeIcon, CalendarDaysIcon, HeartIcon } from '@heroicons/react/24/outline';
import SidebarLink from './SidebarLink';

export default function Sidebar() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1">
          <h3 className="font-semibold">{user?.name}</h3>
          <p className="text-sm text-gray-600">
            {user?.role === 'landlord' ? 'Chủ trọ' : 'Người thuê'}
          </p>
        </div>
      </div>

      {user?.role === 'landlord' ? (
        <>
          <SidebarLink to="/dashboard" icon={HomeIcon}>Tổng quan</SidebarLink>
          <SidebarLink to="/rooms/manage" icon={BuildingOfficeIcon}>Quản lý phòng</SidebarLink>
          <SidebarLink to="/bookings/manage" icon={CalendarDaysIcon}>Quản lý đặt lịch</SidebarLink>
        </>
      ) : (
        <>
          <SidebarLink to="/dashboard" icon={HomeIcon}>Tổng quan</SidebarLink>
          <SidebarLink to="/bookings" icon={CalendarDaysIcon}>Lịch xem phòng</SidebarLink>
          <SidebarLink to="/favorites" icon={HeartIcon}>Phòng yêu thích</SidebarLink>
        </>
      )}
    </div>
  );
}
