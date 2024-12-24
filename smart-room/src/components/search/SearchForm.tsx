import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchForm() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    keyword: '',
    district: '',
    priceRange: '',
    type: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Tạo query params từ filters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    // Chuyển hướng đến trang danh sách với query params
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <input 
        type="text"
        placeholder="Tìm kiếm theo địa chỉ, khu vực..."
        className="w-full px-4 py-2 border rounded"
        value={filters.keyword}
        onChange={(e) => setFilters({...filters, keyword: e.target.value})}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="px-4 py-2 border rounded"
          value={filters.district}
          onChange={(e) => setFilters({...filters, district: e.target.value})}
        >
          <option value="">Chọn quận/huyện</option>
          <option value="nhon-binh">Nhơn Bình</option>
          <option value="hai-cang">Hải Cảng</option>
          <option value="ngo-may">Ngô Mây</option>
          {/* Thêm các quận/huyện khác */}
        </select>

        <select
          className="px-4 py-2 border rounded"
          value={filters.priceRange} 
          onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
        >
          <option value="">Chọn khoảng giá</option>
          <option value="0-2">Dưới 2 triệu</option>
          <option value="2-4">2 - 4 triệu</option>
          <option value="4-6">4 - 6 triệu</option>
          <option value="6-999">Trên 6 triệu</option>
        </select>

        <select
          className="px-4 py-2 border rounded"
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="">Loại phòng</option>
          <option value="MOTEL">Phòng trọ</option>
          <option value="APARTMENT">Căn hộ</option>
          <option value="HOUSE">Nhà nguyên căn</option>
        </select>
      </div>

      <button 
        type="submit"
        className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark"
      >
        Tìm kiếm
      </button>
    </form>
  );
} 