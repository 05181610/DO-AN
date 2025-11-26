import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import RoomCard from '../components/room/RoomCard';

export default function FavoriteRooms() {
  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await axiosClient.get('/favorites');
      return response.data;
    }
  });

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Phòng yêu thích</h1>
      
      {favorites?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Bạn chưa có phòng yêu thích nào</p>
          <Link 
            to="/" 
            className="text-blue-500 hover:underline"
          >
            Khám phá phòng ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites?.map(favorite => (
            <RoomCard 
              key={favorite.room.id} 
              room={favorite.room}
              isFavorited={true}
            />
          ))}
        </div>
      )}
    </div>
  );
} 