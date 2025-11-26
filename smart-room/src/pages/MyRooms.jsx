import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';

export default function MyRooms() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch my rooms
  const { data: rooms, isLoading, isError, error } = useQuery({
    queryKey: ['my-rooms'],
    queryFn: async () => {
      try {
        console.log('🏠 Fetching user rooms...');
        const response = await axiosClient.get('/rooms/my-rooms');
        console.log('✅ User rooms loaded:', response.data?.length || 0, 'rooms');
        return response.data || [];
      } catch (err) {
        console.error('❌ Error fetching rooms:', err);
        throw err;
      }
    }
  });

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId) => {
      console.log('🗑️ Deleting room:', roomId);
      return axiosClient.delete(`/rooms/${roomId}`);
    },
    onSuccess: (data, roomId) => {
      console.log('✅ Room deleted successfully');
      queryClient.invalidateQueries(['my-rooms']);
      setDeleteConfirm(null);
      toast.success('Phòng đã được xóa thành công');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa phòng');
    }
  });

  const handleEdit = (roomId) => {
    navigate(`/edit-room/${roomId}`);
  };

  const handleDelete = (roomId) => {
    setDeleteConfirm(roomId);
  };

  const confirmDelete = (roomId) => {
    deleteRoomMutation.mutate(roomId);
  };

  const handleAddRoom = () => {
    navigate('/post-room');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="mt-4 text-gray-600">Đang tải danh sách phòng...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-red-900">Lỗi</h3>
              <p className="text-red-700 mt-1">
                {error?.response?.data?.message || 'Không thể tải danh sách phòng'}
              </p>
              <button 
                onClick={() => queryClient.invalidateQueries(['my-rooms'])}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Phòng của tôi</h1>
              <p className="text-gray-600 mt-2">
                Quản lý danh sách phòng trọ của bạn
              </p>
            </div>
            <button
              onClick={handleAddRoom}
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Đăng phòng mới</span>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {rooms && rooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-gray-600 text-sm">Tổng phòng</p>
              <p className="text-3xl font-bold text-primary mt-2">{rooms.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-gray-600 text-sm">Phòng có sẵn</p>
              <p className="text-3xl font-bold text-green-500 mt-2">
                {rooms.filter(r => r.isAvailable).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-gray-600 text-sm">Tổng lượt xem</p>
              <p className="text-3xl font-bold text-blue-500 mt-2">
                {rooms.reduce((sum, r) => sum + (r.views || 0), 0)}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!rooms || rooms.length === 0) ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v7a1 1 0 001 1h12a1 1 0 001-1V9m-9 9l-7-4m0 0V5a1 1 0 011-1h12a1 1 0 011 1v7m-9-9h9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có phòng</h3>
            <p className="text-gray-600 mb-6">Hãy đăng phòng đầu tiên của bạn để bắt đầu</p>
            <button
              onClick={handleAddRoom}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Đăng phòng mới</span>
            </button>
          </div>
        ) : (
          /* Room Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <div 
                key={room.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden group">
                  {room.images && room.images.length > 0 ? (
                    <img 
                      src={`http://localhost:5000/${room.images[0].imageUrl || room.images[0].url}`}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500">Không có ảnh</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {room.isAvailable ? (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center space-x-1">
                        <CheckCircleIcon className="w-3 h-3" />
                        <span>Có sẵn</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                        Hết phòng
                      </span>
                    )}
                  </div>
                  
                  {/* Featured Badge */}
                  {room.isFeatured && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                        ⭐ Nổi bật
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title & Location */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                    {room.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    📍 {room.location}, {room.district}
                  </p>

                  {/* Price & Area */}
                  <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-600">Giá</p>
                      <p className="text-lg font-bold text-primary">
                        {(room.price || 0).toLocaleString('vi-VN')} đ/tháng
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Diện tích</p>
                      <p className="text-lg font-bold text-gray-900">
                        {room.area || 0} m²
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <EyeIcon className="w-4 h-4" />
                      <span>{room.views || 0} lượt xem</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <span className="text-xs">❤️ {room.favoriteCount || 0}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {room.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/rooms/${room.id}`)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>Xem</span>
                    </button>
                    <button
                      onClick={() => handleEdit(room.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Xóa phòng?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Bạn chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirm)}
                  disabled={deleteRoomMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium"
                >
                  {deleteRoomMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
