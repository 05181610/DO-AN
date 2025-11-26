import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import BookingForm from '../components/booking/BookingForm';
import RoomGallery from '../components/room/RoomGallery';
import RoomInfo from '../components/room/RoomInfo';
import RoomActions from '../components/room/RoomActions';
import ReviewSection from '../components/review/ReviewSection';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../hooks/useAuth';

export default function RoomDetail() {
  const { id } = useParams();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      try {
        console.log('Fetching room details for id:', id);
        const response = await axiosClient.get(`/rooms/${id}`);
        console.log('Room details response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching room:', error);
        throw error;
      }
    }
  });

  const { data: favoriteStatus } = useQuery({
    queryKey: ['favorite', id],
    queryFn: () => {
      if (!isAuthenticated) return { isFavorite: false };
      return axiosClient.get(`/favorites/rooms/${id}`)
        .then(res => res.data);
    },
    enabled: !!id
  });

  const isFavorite = favoriteStatus?.isFavorite;

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Favorite mutation - isFavorite:', isFavorite, 'id:', id);
      if (isFavorite) {
        console.log('🗑️ Deleting favorite for room:', id);
        return axiosClient.delete(`/favorites/rooms/${id}`);
      } else {
        console.log('❤️ Adding favorite for room:', id);
        return axiosClient.post(`/favorites/rooms/${id}`);
      }
    },
    onSuccess: () => {
      console.log('✅ Favorite mutation success');
      queryClient.invalidateQueries(['favorite', id]);
      
      // Dispatch event to trigger dashboard stats refresh
      const event = new Event('room-favorite');
      window.dispatchEvent(event);
      console.log('📡 Dispatched room-favorite event');
      
      toast.success(isFavorite ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích');
    },
    onError: (error) => {
      console.error('❌ Favorite error:', error);
      console.error('Error message:', error.response?.data?.message);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thực hiện thao tác');
    }
  });

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thực hiện chức năng này');
      return;
    }
    if (favoriteMutation.isPending) {
      console.log('⏳ Favorite mutation already pending, ignoring duplicate click');
      return;
    }
    favoriteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy phòng</h2>
          <p className="text-gray-600 mt-2">Phòng này có thể đã bị xóa hoặc không tồn tại</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{room.title}</h1>
              <p className="text-gray-600">{room.location}</p>
            </div>
            <button 
              onClick={handleFavorite}
              disabled={favoriteMutation.isPending}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFavorite ? (
                <HeartSolidIcon className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <RoomGallery images={room.images} />
        
        <RoomInfo room={room} />
        
        <RoomActions
          room={room}
          onBooking={() => setShowBookingForm(true)}
          onFavorite={handleFavorite}
          isFavorite={isFavorite}
        />

        {showBookingForm && (
          <BookingForm
            roomId={id}
            onSuccess={() => setShowBookingForm(false)}
            onClose={() => setShowBookingForm(false)}
          />
        )}

        <ReviewSection roomId={id} />
      </div>
    </div>
  );
}