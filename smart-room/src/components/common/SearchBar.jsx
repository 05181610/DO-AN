import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Thêm constant cho districts
const DISTRICTS = [
  { value: 'Nhơn Bình', label: 'Nhơn Bình' },
  { value: 'Hải Cảng', label: 'Hải Cảng' }, 
  { value: 'Ngô Mây', label: 'Ngô Mây' },
  { value: 'Đống Đa', label: 'Đống Đa' },
  { value: 'Trần Hưng Đạo', label: 'Trần Hưng Đạo' },
  { value: 'Lý Thường Kiệt', label: 'Lý Thường Kiệt' },
  { value: 'Nhơn Phú', label: 'Nhơn Phú' },
  { value: 'Bùi Thị Xuân', label: 'Bùi Thị Xuân' }
];

export default function SearchBar() {
  const navigate = useNavigate();
  const [currentSearchParams] = useSearchParams();
  const [searchParams, setSearchParams] = useState({
    district: currentSearchParams.get('district') || '',
    priceRange: currentSearchParams.get('priceRange') || '',
    type: currentSearchParams.get('type') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <select
            value={searchParams.district}
            onChange={(e) => setSearchParams({...searchParams, district: e.target.value})}
            className="px-4 py-2 border rounded text-black bg-white"
          >
            <option value="">Quận/Huyện</option>
            {DISTRICTS.map(district => (
              <option key={district.value} value={district.value}>
                {district.label}
              </option>
            ))}
          </select>

          <select
            value={searchParams.priceRange}
            onChange={(e) => setSearchParams({...searchParams, priceRange: e.target.value})}
            className="px-4 py-2 border rounded text-black bg-white"
          >
            <option value="">Khoảng giá</option>
            <option value="0-2">Dưới 2 triệu</option>
            <option value="2-4">2 - 4 triệu</option>
            <option value="4-6">4 - 6 triệu</option>
            <option value="6-999">Trên 6 triệu</option>
          </select>

          <select
            value={searchParams.type}
            onChange={(e) => setSearchParams({...searchParams, type: e.target.value})}
            className="px-4 py-2 border rounded text-black bg-white"
          >
            <option value="">Loại phòng</option>
            <option value="MOTEL">Phòng trọ</option>
            <option value="APARTMENT">Căn hộ</option>
            <option value="HOUSE">Nhà nguyên căn</option>
          </select>
        </div>

        <button 
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}