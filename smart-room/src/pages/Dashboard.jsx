import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axiosClient.get('/api/users/dashboard-stats');
      return response.data;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true
  });

  useEffect(() => {
    const events = ['room-view', 'room-favorite', 'room-booking'];
    
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
      const response = await axiosClient.get('/api/users/profile');
      return response.data;
    }
  });

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Thông tin cá nhân */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
        <div className="flex items-center mb-4">
          <img 
            src={profile?.avatar || '/images/default-avatar.png'}
            alt="Avatar" 
            className="w-16 h-16 rounded-full mr-4"
          />
          <div>
            <h3 className="font-medium">{profile?.fullName}</h3>
            <p className="text-gray-600 text-sm">{profile?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Số điện thoại</p>
            <p className="font-medium">{profile?.phone || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <p className="text-gray-600">Địa chỉ</p>
            <p className="font-medium">{profile?.address || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>

      {/* Tổng quan */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Tổng quan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Phòng đã đăng</p>
            <p className="text-2xl font-bold">{stats?.totalRooms || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Lượt xem</p>
            <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Lượt yêu thích</p>
            <p className="text-2xl font-bold">{stats?.totalFavorites || 0}</p>
          </div>
        </div>

        {/* Hoạt động gần đây */}
        <div className="mt-6">
          <h3 className="font-medium mb-3">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {stats?.recentActivities?.map((activity, index) => (
              <div key={index} className="flex items-center text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                <span className="flex-1">{activity.description}</span>
                <span className="text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}