import { useState, useEffect } from 'react';
import axiosClient from '@/api/axiosClient';

export default function BookingsSection() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axiosClient.get('/bookings');
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lịch xem phòng</h2>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div 
            key={booking.id}
            className="bg-white p-4 rounded-lg shadow border"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{booking.room.title}</h3>
                <p className="text-gray-600">
                  Ngày xem: {new Date(booking.viewingDate).toLocaleDateString()} 
                  - {new Date(booking.viewingDate).toLocaleTimeString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                booking.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : booking.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {booking.status === 'pending' ? 'Chờ duyệt' 
                  : booking.status === 'approved' ? 'Đã duyệt' 
                  : 'Đã hủy'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
