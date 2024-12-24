export default function RoomInfo({ room }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-4">{room.title}</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <span className="text-gray-600">Giá thuê:</span>
          <p className="font-semibold text-primary">
            {new Intl.NumberFormat('vi-VN').format(room.price)} đ/tháng
          </p>
        </div>
        <div>
          <span className="text-gray-600">Diện tích:</span>
          <p className="font-semibold">{room.area} m²</p>
        </div>
        <div>
          <span className="text-gray-600">Khu vực:</span>
          <p className="font-semibold">{room.district}</p>
        </div>
        <div>
          <span className="text-gray-600">Loại phòng:</span>
          <p className="font-semibold">{room.type}</p>
        </div>
      </div>

      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mb-2">Mô tả</h2>
        <p className="text-gray-600 whitespace-pre-line">{room.description}</p>
      </div>
    </div>
  );
} 