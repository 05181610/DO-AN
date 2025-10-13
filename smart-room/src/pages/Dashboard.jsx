import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { StarIcon, HeartIcon, CalendarIcon, EyeIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { vi } from 'date-fns/locale';

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const response = await axiosClient.get('/users/dashboard-stats');
        console.log('Dashboard stats:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true
  });

  useEffect(() => {
    const events = [
      'room-view', 
      'room-favorite', 
      'room-booking',
      'room-review'
    ];
    
    events.forEach(event => {
      window.addEventListener(event, () => {
        queryClient.invalidateQueries(['dashboard-stats']);
      });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, () => {
          queryClient.invalidateQueries(['dashboard-stats']);
        });
      });
    };
  }, [queryClient]);

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await axiosClient.get('/users/profile');
      return response.data;
    }
  });

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={profile?.avatar || '/images/default-avatar.png'}
                alt="Avatar" 
                className="w-16 h-16 rounded-full border-4 border-white shadow-md"
              />
              <div>
                <h1 className="text-2xl font-bold">{profile?.fullName || 'Chưa cập nhật'}</h1>
                <p className="text-white/80">{profile?.role === 'landlord' ? 'Chủ trọ' : 'Người thuê'}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/profile/edit')}
              className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors"
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Rooms */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Phòng đã đăng</p>
                <p className="text-3xl font-bold mt-1">{stats?.totalRooms || 0}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <DocumentIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/my-rooms" className="text-primary hover:underline text-sm">
                Xem chi tiết →
              </Link>
            </div>
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Lượt xem</p>
                <p className="text-3xl font-bold mt-1">{stats?.totalViews || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <EyeIcon className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-green-500">
                +{stats?.viewsThisWeek || 0} tuần này
              </p>
            </div>
          </div>

          {/* Favorites */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Lượt yêu thích</p>
                <p className="text-3xl font-bold mt-1">{stats?.totalFavorites || 0}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <HeartIcon className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-green-500">
                +{stats?.favoritesThisWeek || 0} tuần này
              </p>
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Lượt đặt phòng</p>
                <p className="text-3xl font-bold mt-1">{stats?.totalBookings || 0}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <CalendarIcon className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-2">
              <Link to="/bookings" className="text-primary hover:underline text-sm">
                Xem chi tiết →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Hoạt động gần đây</h3>
            <div className="space-y-4">
              {stats?.recentActivities?.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    {activity.type === 'review' && (
                      <div className="p-2 bg-yellow-50 rounded-full">
                        <StarIcon className="w-6 h-6 text-yellow-500" />
                      </div>
                    )}
                    {activity.type === 'favorite' && (
                      <div className="p-2 bg-red-50 rounded-full">
                        <HeartIcon className="w-6 h-6 text-red-500" />
                      </div>
                    )}
                    {activity.type === 'booking' && (
                      <div className="p-2 bg-blue-50 rounded-full">
                        <CalendarIcon className="w-6 h-6 text-blue-500" />
                      </div>
                    )}
                    {activity.type === 'post' && (
                      <div className="p-2 bg-primary/10 rounded-full">
                        <DocumentIcon className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                        locale: vi
                      })}
                    </p>
                  </div>
                  {activity.actionUrl && (
                    <Link 
                      to={activity.actionUrl}
                      className="text-primary hover:text-primary/80 text-sm whitespace-nowrap"
                    >
                      Chi tiết →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Thao tác nhanh</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="w-6 h-6 text-primary" />
                  <span className="font-medium text-gray-900">Đăng phòng mới</span>
                </div>
                <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-6 h-6 text-blue-500" />
                  <span className="font-medium text-gray-900">Xem lịch hẹn</span>
                </div>
                <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <StarIcon className="w-6 h-6 text-yellow-500" />
                  <span className="font-medium text-gray-900">Quản lý đánh giá</span>
                </div>
                <span className="text-yellow-500 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentActivities({ activities }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Hoạt động gần đây</h2>
      <div className="space-y-4">
        {activities?.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            {/* Icon based on activity type */}
            <div className="p-2 rounded-full bg-gray-100">
              {activity.type === 'review' && <StarIcon className="w-5 h-5 text-yellow-500" />}
              {activity.type === 'favorite' && <HeartIcon className="w-5 h-5 text-red-500" />}
              {activity.type === 'booking' && <CalendarIcon className="w-5 h-5 text-blue-500" />}
              {activity.type === 'view' && <EyeIcon className="w-5 h-5 text-gray-500" />}
            </div>
            
            {/* Activity content */}
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                {activity.message}
                <Link 
                  to={`/rooms/${activity.roomId}`} 
                  className="text-primary hover:underline ml-1"
                >
                  {activity.roomTitle}
                </Link>
              </p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(activity.createdAt), { 
                  addSuffix: true,
                  locale: vi 
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}