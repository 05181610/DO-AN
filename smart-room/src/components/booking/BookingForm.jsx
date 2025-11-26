import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { XMarkIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import axiosClient from '@/api/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BookingForm({ roomId, onSuccess, onClose }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    note: ''
  });

  const bookingMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Auth status:', isAuthenticated);
      console.log('Sending data:', data);
      
      return axiosClient.post('/bookings', data);
    },
    onSuccess: () => {
      toast.success('Đặt lịch xem phòng thành công');
      onSuccess?.();
      onClose?.();
    },
    onError: (error) => {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Đặt lịch thất bại');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time) {
      toast.error('Vui lòng chọn ngày và giờ xem phòng');
      return;
    }

    try {
      const [hours, minutes] = formData.time.split(':');
      const viewingDate = new Date(formData.date);
      viewingDate.setHours(parseInt(hours), parseInt(minutes), 0);
      
      const now = new Date();
      if (viewingDate < now) {
        toast.error('Vui lòng chọn thời gian trong tương lai');
        return;
      }

      const bookingData = {
        roomId: Number(roomId),
        viewingDate: viewingDate.toISOString(),
        note: formData.note?.trim() || ''
      };

      console.log('Submitting booking:', bookingData);
      bookingMutation.mutate(bookingData);

    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Đặt lịch xem phòng</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Ngày xem</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block mb-1">Giờ xem</label>
            <input
              type="time"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block mb-1">Ghi chú</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md"
              rows="3"
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
              disabled={bookingMutation.isLoading}
            >
              {bookingMutation.isLoading ? 'Đang xử lý...' : 'Đặt lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 