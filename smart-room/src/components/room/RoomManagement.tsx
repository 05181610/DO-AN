import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

export default function RoomManagement() {
  const queryClient = useQueryClient();

  const { data: myRooms } = useQuery({
    queryKey: ['myRooms'],
    queryFn: () => axiosClient.get('/api/rooms/my-rooms')
  });

  const deleteMutation = useMutation({
    mutationFn: (roomId) => axiosClient.delete(`/api/rooms/${roomId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['myRooms']);
      toast.success('Xóa tin thành công');
    }
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Quản lý tin đăng</h2>
      {/* Hiển thị danh sách tin đăng */}
    </div>
  );
} 