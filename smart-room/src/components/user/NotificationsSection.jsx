import { useState } from 'react';
import { BellIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
export default function NotificationsSection() {
 const [notifications] = useState([
   {
     id: 1,
     title: 'Lịch xem phòng mới',
     message: 'Có người muốn xem phòng của bạn vào ngày 20/03/2024',
     type: 'booking',
     isRead: false,
     timestamp: '5 phút trước'
   },
   // Thêm dữ liệu mẫu khác nếu cần
 ]);
  return (
   <div>
     <h2 className="text-2xl font-bold mb-6">Thông báo</h2>
     <div className="space-y-4">
       {notifications.map((notification) => (
         <div
           key={notification.id}
           className={`p-4 rounded-lg border ${
             notification.isRead ? 'bg-white' : 'bg-blue-50'
           }`}
         >
           <div className="flex items-start space-x-4">
             <div className={`p-2 rounded-full ${
               notification.type === 'booking' ? 'bg-blue-100 text-blue-600'
               : notification.type === 'success' ? 'bg-green-100 text-green-600'
               : 'bg-red-100 text-red-600'
             }`}>
               <BellIcon className="h-6 w-6" />
             </div>
             <div className="flex-1">
               <h3 className="font-semibold">{notification.title}</h3>
               <p className="text-gray-600">{notification.message}</p>
               <span className="text-sm text-gray-500">{notification.timestamp}</span>
             </div>
           </div>
         </div>
       ))}
     </div>
   </div>
 );
}