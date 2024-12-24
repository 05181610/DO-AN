import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapIcon, FunnelIcon } from '@heroicons/react/24/outline';
import axiosClient from '../api/axiosClient';
import SearchBar from '../components/common/SearchBar';
import RoomCard from '../components/room/RoomCard';

export default function Home() {
  const { data: featuredRooms, isLoading: featuredLoading } = useQuery({
    queryKey: ['featuredRooms'],
    queryFn: async () => {
      const response = await axiosClient.get('/api/rooms/featured');
      return response.data;
    }
  });

  const { data: latestRooms, isLoading: latestLoading } = useQuery({
    queryKey: ['latestRooms'],
    queryFn: async () => {
      const response = await axiosClient.get('/api/rooms/latest');
      return response.data;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section với Search */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">Tìm phòng trọ của bạn</h1>
        <SearchBar />
      </div>

      {/* Quick Filters */}
      <div className="flex gap-4 mb-8 overflow-x-auto py-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow hover:shadow-md">
          <FunnelIcon className="h-5 w-5" />
          Dưới 3 triệu
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow hover:shadow-md">
          3-5 triệu
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow hover:shadow-md">
          5-7 triệu
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow hover:shadow-md">
          Trên 7 triệu
        </button>
      </div>

      {/* Featured Rooms */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Phòng nổi bật</h2>
        {featuredLoading ? (
          <div>Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRooms?.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Rooms */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Phòng mới đăng</h2>
        {latestLoading ? (
          <div>Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestRooms?.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

      {/* Map View Toggle Button */}
      <button 
        className="fixed bottom-4 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-secondary transition-colors"
        onClick={() => {/* TODO: Implement map view */}}
      >
        <MapIcon className="h-6 w-6" />
      </button>
    </div>
  );
}