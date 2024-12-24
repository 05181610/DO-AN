import { HomeIcon, CalendarIcon, ChatBubbleLeftRightIcon, BellIcon } from '@heroicons/react/24/outline';

export default function OverviewSection() {
  const stats = [
    { label: 'Phòng đã đăng', value: 5, icon: HomeIcon },
   { label: 'Lịch xem phòng', value: 3, icon: CalendarIcon },
   { label: 'Tin nhắn mới', value: 12, icon: ChatBubbleLeftRightIcon },
   { label: 'Thông báo', value: 4, icon: BellIcon },
 ];
  return (
   <div>
     <h2 className="text-2xl font-bold mb-6">Tổng quan</h2>
     
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
       {stats.map((stat, index) => (
         <div key={index} className="bg-white p-4 rounded-lg shadow">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-gray-600">{stat.label}</p>
               <p className="text-2xl font-bold">{stat.value}</p>
             </div>
             <stat.icon className="h-8 w-8 text-primary" />
           </div>
         </div>
       ))}
     </div>
   </div>
 );
}