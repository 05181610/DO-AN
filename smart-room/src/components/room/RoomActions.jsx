import { HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import BookingForm from '../booking/BookingForm';

export default function RoomActions({ room, onBooking, onFavorite, isFavorite }) {
  const handleShare = async () => {
    try {
      await navigator.share({
        title: room.title,
        text: room.description,
        url: window.location.href
      });
    } catch (error) {
      toast.error('Không thể chia sẻ trên thiết bị này');
    }
  };

  return (
    <div className="flex gap-4 mb-8">
      <button
        onClick={onBooking}
        className="flex-1 bg-primary text-white py-2 px-4 rounded-lg
                 hover:bg-secondary transition-colors"
      >
        Đặt lịch xem phòng
      </button>
      
      <button
        onClick={onFavorite}
        className={`p-2 rounded-lg border ${
          isFavorite ? 'text-red-500 border-red-500' : 'text-gray-500 border-gray-300'
        }`}
      >
        <HeartIcon className="h-6 w-6" />
      </button>
      
      <button
        onClick={handleShare}
        className="p-2 rounded-lg border border-gray-300 text-gray-500"
      >
        <ShareIcon className="h-6 w-6" />
      </button>
    </div>
  );
} 