import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export default function Profile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await axiosClient.get('/api/users/profile');
      return response.data;
    }
  });

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Thông tin cá nhân</h2>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <img 
              src={profile?.avatar || '/images/default-avatar.png'} 
              alt="Avatar"
              className="w-20 h-20 rounded-full"
            />
            <div className="ml-4">
              <h3 className="text-xl font-semibold">{profile?.fullName}</h3>
              <p className="text-gray-600">{profile?.role === 'TENANT' ? 'Người thuê' : 'Chủ trọ'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-600">Email</label>
              <p className="font-medium">{profile?.email}</p>
            </div>
            <div>
              <label className="text-gray-600">Số điện thoại</label>
              <p className="font-medium">{profile?.phone}</p>
            </div>
            <div>
              <label className="text-gray-600">Địa chỉ</label>
              <p className="font-medium">{profile?.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}