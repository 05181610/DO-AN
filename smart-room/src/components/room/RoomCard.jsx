import { Link } from 'react-router-dom';
import { MapPinIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function RoomCard({ room }) {
  return (
    <Link to={`/rooms/${room.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 overflow-hidden">
          <img
            src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}
            alt={room.title}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-0 right-0 bg-primary text-white px-2 py-1 m-2 rounded">
            {room.type}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{room.title}</h3>
          
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MapPinIcon className="h-5 w-5" />
            <span>{room.district}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-primary font-bold">
              {new Intl.NumberFormat('vi-VN').format(room.price)}đ
            </span>
            <span className="text-sm text-gray-500">
              {room.area}m²
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
