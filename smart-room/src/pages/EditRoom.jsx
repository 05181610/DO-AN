import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PhotoIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

export default function EditRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    area: '',
    location: '',
    district: '',
    type: '',
    facilities: [],
    images: [],
    isAvailable: true
  });

  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

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

  // Fetch room details
  const { data: room, isLoading, isError } = useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      console.log('🔍 Fetching room details for edit:', id);
      const response = await axiosClient.get(`/rooms/${id}`);
      console.log('✅ Room details loaded:', response.data);
      return response.data;
    }
  });

  // Initialize form when room data loads
  useEffect(() => {
    if (room) {
      console.log('📝 Initializing form with room data');
      setFormData({
        title: room.title || '',
        description: room.description || '',
        price: room.price || '',
        area: room.area || '',
        location: room.location || '',
        district: room.district || '',
        type: room.type || '',
        facilities: room.facilities || [],
        images: room.images || [],
        isAvailable: room.isAvailable !== false
      });
    }
  }, [room]);

  // Update room mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      try {
        console.log('📤 Uploading new images...');
        let imageUrls = [];

        if (newImages.length > 0) {
          const uploadFormData = new FormData();
          newImages.forEach((file) => {
            console.log(`📷 Adding file: ${file.name}`);
            uploadFormData.append('images', file);
          });

          const uploadResponse = await axiosClient.post('/rooms/upload-images', uploadFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          imageUrls = uploadResponse.data.urls || [];
          console.log('✅ Images uploaded:', imageUrls);
        }

        // Combine old and new images
        const allImages = [
          ...formData.images.filter(img => !imagesToDelete.includes(img.id)),
          ...imageUrls.map(url => ({ imageUrl: url }))
        ];

        const updateData = {
          title: data.title.trim(),
          description: data.description.trim(),
          price: Number(data.price),
          area: Number(data.area),
          location: data.location.trim(),
          district: data.district,
          type: data.type,
          facilities: data.facilities,
          images: allImages,
          isAvailable: data.isAvailable
        };

        console.log('📝 Sending update:', updateData);
        const response = await axiosClient.put(`/rooms/${id}`, updateData);
        console.log('✅ Room updated:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Update error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🎉 Update success');
      toast.success('Phòng đã được cập nhật thành công');
      queryClient.invalidateQueries(['room', id]);
      queryClient.invalidateQueries(['my-rooms']);
      navigate(`/rooms/${id}`);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật';
      console.error('❌ Error details:', error.response?.data || error);
      toast.error(errorMessage);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🔍 Form validation starting...');

    // Validation
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    if (!formData.price) {
      toast.error('Vui lòng nhập giá thuê');
      return;
    }

    if (!formData.area) {
      toast.error('Vui lòng nhập diện tích');
      return;
    }

    if (!formData.location.trim()) {
      toast.error('Vui lòng nhập địa chỉ cụ thể');
      return;
    }

    if (!formData.district) {
      toast.error('Vui lòng chọn quận/huyện');
      return;
    }

    if (!formData.type) {
      toast.error('Vui lòng chọn loại phòng');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả chi tiết');
      return;
    }

    if (formData.images.length === 0 && newImages.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 ảnh');
      return;
    }

    console.log('✅ All validations passed, submitting form');
    updateMutation.mutate(formData);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);

    const validFiles = files.filter(file =>
      file.type.match(/^image\/(jpeg|png|jpg)$/)
    );

    if (validFiles.length !== files.length) {
      toast.error('Chỉ chấp nhận file ảnh (jpg, png)');
      return;
    }

    setNewImages(prev => [...prev, ...validFiles]);
  };

  const handleRemoveOldImage = (imageId) => {
    console.log('🗑️ Removing old image:', imageId);
    setImagesToDelete(prev => [...prev, imageId]);
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleRemoveNewImage = (index) => {
    console.log('🗑️ Removing new image:', index);
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="mt-4 text-gray-600">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900">Lỗi</h3>
          <p className="text-red-700 mt-2">Không thể tải thông tin phòng</p>
          <button
            onClick={() => navigate('/my-rooms')}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center space-x-2">
        <button
          onClick={() => navigate('/my-rooms')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-3xl font-bold">Chỉnh sửa phòng</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl bg-white p-6 rounded-lg shadow-md space-y-6">
        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Tiêu đề</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Loại phòng</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Diện tích (m²)</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Quận/Huyện</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          ></textarea>
        </div>

        {/* Trạng thái */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-gray-700">Phòng còn trống</span>
          </label>
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
                  className="rounded border-gray-300"
                />
                <span>{facility}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Upload ảnh */}
        <div>
          <label className="block text-gray-700 mb-2">Hình ảnh</label>

          {/* Existing Images */}
          {formData.images && formData.images.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Ảnh hiện tại</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {formData.images.map((image) => (
                  <div key={image.id} className="relative aspect-square">
                    <img
                      src={`http://localhost:5000/${image.imageUrl || image.url}`}
                      alt="Room"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOldImage(image.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <PlusIcon className="h-4 w-4 transform rotate-45" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {newImages.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Ảnh mới</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {newImages.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`New ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <PlusIcon className="h-4 w-4 transform rotate-45" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Input */}
          <label className="block aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
            <PhotoIcon className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500 mt-2">Thêm ảnh</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/my-rooms')}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
          >
            {updateMutation.isPending ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Đang cập nhật...</span>
              </span>
            ) : (
              '💾 Lưu thay đổi'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
