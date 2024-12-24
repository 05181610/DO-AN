import { useState } from 'react';
import RoomCard from '../room/RoomCard';

export default function FavoritesSection() {
  const [favorites] = useState([
    {
      id: 1,
      title: "Phòng trọ Quận 1",
      price: 5000000,
      location: "123 Nguyễn Huệ, Q1",
      image: "https://example.com/room1.jpg"
    }
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Phòng yêu thích</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favorites.map(room => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}