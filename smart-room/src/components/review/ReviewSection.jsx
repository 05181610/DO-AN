import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';

export default function ReviewSection({ roomId }) {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', roomId],
    queryFn: () => {
      if (!roomId) {
        throw new Error('roomId is required');
      }
      return axiosClient.get(`/api/reviews/room/${roomId}`)
        .then(res => res.data);
    },
    enabled: !!roomId
  });

  const createReviewMutation = useMutation({
    mutationFn: (reviewData) => 
      axiosClient.post(`/api/reviews`, {
        roomId: Number(roomId),
        comment: reviewData.content,
        rating: reviewData.rating
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', roomId]);
      toast.success('Đánh giá thành công');
    },
    onError: (error) => {
      console.error('Review error:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi đánh giá');
    }
  });

  if (isLoading) return <div>Đang tải đánh giá...</div>;

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">Đánh giá</h3>
      
      {/* Form đánh giá */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          createReviewMutation.mutate({
            content: formData.get('content'),
            rating: Number(formData.get('rating'))
          });
          e.target.reset();
        }}
        className="mb-6"
      >
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Đánh giá của bạn</label>
          <textarea
            name="content"
            className="w-full px-4 py-2 border rounded-lg"
            rows="3"
            required
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Số sao</label>
          <select 
            name="rating"
            className="px-4 py-2 border rounded-lg"
            required
          >
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary"
          disabled={createReviewMutation.isLoading}
        >
          {createReviewMutation.isLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>

      {/* Danh sách đánh giá */}
      <div className="space-y-4">
        {reviews?.map(review => (
          <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold">
                {review.user?.name || 'Người dùng'}
              </div>
              <div className="text-yellow-500">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>
            </div>
            <p className="text-gray-600">{review.content}</p>
            <div className="text-sm text-gray-400 mt-2">
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 