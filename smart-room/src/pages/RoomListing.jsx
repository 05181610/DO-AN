import { useState, useEffect } from 'react';
import axiosClient from '@/api/axiosClient';
import Pagination from '../components/common/Pagination';
import RoomCard from '../components/room/RoomCard';
import SearchBar from '../components/common/SearchBar';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

export default function RoomListing() {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: 9,
        district: searchParams.get('district'),
        priceRange: searchParams.get('priceRange'),
        type: searchParams.get('type')
      };

      const response = await axiosClient.get('/rooms', {
        params: Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value != null)
        )
      });

      if (response.data && Array.isArray(response.data.items)) {
        setRooms(response.data.items);
        setTotalPages(response.data.meta.totalPages);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [searchParams, currentPage]);

  return (
    <div className="container mx-auto px-4">
      <SearchBar />
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : rooms.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <img 
            src="/images/no-results.svg" 
            alt="No results" 
            className="w-48 h-48 mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Không tìm thấy kết quả
          </h3>
          <p className="text-gray-500">
            Vui lòng thử lại với bộ lọc khác
          </p>
        </div>
      )}
    </div>
  );
}
