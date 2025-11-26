import { useState } from 'react';
import { PhotoIcon, MapPinIcon, PlusIcon } from '@heroicons/react/24/outline';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export default function PostRoom() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    area: '',
    location: '',
    district: '',
    type: '',
    facilities: [],
    images: []
  });

  const facilityOptions = [
    'Máy lạnh',
    'Tủ lạnh',
    'Máy giặt',
    'Nội thất',
    'Ban công',
    'Cửa sổ',
    'Bếp',
    'Wifi',
    'Gác lửng',
    'Camera',
    'Bảo vệ',
    'Thang máy'
  ];

  const districts = [
    'Quy Nhơn',
    'An Nhơn',
    'Hoài Nhơn', 
    'Tuy Phước',
    'Phù Cát',
    'Phù Mỹ',
    'Hoài Ân',
    'Tây Sơn',
    'Vân Canh',
    'Vĩnh Thạnh',
    'An Lão'
  ];

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const postMutation = useMutation({
    mutationFn: async (formData) => {
      try {
        console.log('📸 Starting to upload images...');
        const imageUrls = await uploadImages(formData.images);
        console.log('✅ Images uploaded:', imageUrls);
        
        const roomData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          area: Number(formData.area),
          location: formData.location.trim(),
          district: formData.district,
          type: formData.type,
          facilities: formData.facilities,
          images: imageUrls
        };

        console.log('📝 Sending room data:', roomData);
        
        const response = await axiosClient.post('/rooms', roomData);
        console.log('✅ Room created successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Error creating room:', error);
        console.error('Response data:', error.response?.data);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🎉 Post mutation successful');
      toast.success('Đăng tin thành công');
      queryClient.invalidateQueries(['my-rooms']);
      queryClient.invalidateQueries(['dashboard-stats']);
      navigate('/dashboard');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đăng tin';
      console.error('❌ Error details:', error.response?.data || error);
      toast.error(errorMessage);
    }
  });

  const uploadImages = async (files) => {
    try {
      if (!files || files.length === 0) {
        throw new Error('No files selected');
      }

      const formData = new FormData();
      files.forEach((file, index) => {
        console.log(`📷 Adding file ${index + 1}: ${file.name} (${file.size} bytes)`);
        formData.append('images', file);
      });

      console.log('📤 Uploading', files.length, 'files to /rooms/upload-images');

      const response = await axiosClient.post('/rooms/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Upload response:', response.data);
      
      if (!response.data.urls) {
        throw new Error('No URLs returned from upload');
      }
      
      return response.data.urls;
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      toast.error('Lỗi khi tải ảnh lên: ' + (error.message || error.response?.data?.message || 'Unknown error'));
      throw error;
    }
  };

  // Validate form before submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🔍 Form validation starting...');
    console.log('Form data:', formData);
    
    // Basic validation
    if (!formData.title.trim()) {
      console.warn('❌ Missing title');
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    if (!formData.price) {
      console.warn('❌ Missing price');
      toast.error('Vui lòng nhập giá thuê');
      return;
    }

    if (!formData.area) {
      console.warn('❌ Missing area');
      toast.error('Vui lòng nhập diện tích');
      return;
    }

    if (!formData.location.trim()) {
      console.warn('❌ Missing location');
      toast.error('Vui lòng nhập địa chỉ cụ thể');
      return;
    }

    if (!formData.district) {
      console.warn('❌ Missing district');
      toast.error('Vui lòng chọn quận/huyện');
      return;
    }

    if (!formData.type) {
      console.warn('❌ Missing type');
      toast.error('Vui lòng chọn loại phòng');
      return;
    }

    if (!formData.description.trim()) {
      console.warn('❌ Missing description');
      toast.error('Vui lòng nhập mô tả chi tiết');
      return;
    }

    if (formData.images.length === 0) {
      console.warn('❌ Missing images');
      toast.error('Vui lòng thêm ít nhất 1 ảnh');
      return;
    }

    console.log('✅ All validations passed, submitting form');
    postMutation.mutate(formData);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    
    // Validate file types
    const validFiles = files.filter(file => 
      file.type.match(/^image\/(jpeg|png|jpg)$/)
    );

    if (validFiles.length !== files.length) {
      toast.error('Chỉ chấp nhận file ảnh (jpg, png)');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Đăng tin mới</h1>
      
      <form onSubmit={handleSubmit} className="max-w-3xl bg-white p-6 rounded-lg shadow-md space-y-6">
        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Tiêu đề</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Loại phòng</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="">Chọn loại phòng</option>
              <option value="room">Phòng trọ</option>
              <option value="apartment">Chung cư mini</option>
              <option value="house">Nhà nguyên căn</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Giá thuê (VNĐ/tháng)</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Diện tích (m²)</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={formData.area}
              onChange={(e) => setFormData({...formData, area: e.target.value})}
              required
            />
          </div>
        </div>

        {/* Địa chỉ */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Địa chỉ cụ thể</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Quận/Huyện</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={formData.district}
              onChange={(e) => setFormData({...formData, district: e.target.value})}
              required
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-gray-700 mb-2">Mô tả chi tiết</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          ></textarea>
        </div>

        {/* Tiện ích */}
        <div>
          <label className="block text-gray-700 mb-2">Tiện ích</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {facilityOptions.map((facility) => (
              <label key={facility} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.facilities.includes(facility)}
                  onChange={() => handleFacilityToggle(facility)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>{facility}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Upload ảnh */}
        <div>
          <label className="block text-gray-700 mb-2">Hình ảnh</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Room ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== index)
                  }))}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <PlusIcon className="h-4 w-4 transform rotate-45" />
                </button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <PhotoIcon className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500">Thêm ảnh</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={postMutation.isPending}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {postMutation.isPending ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Đang đăng tin...</span>
            </span>
          ) : (
            '✏️ Đăng tin'
          )}
        </button>
      </form>
    </div>
  );
}