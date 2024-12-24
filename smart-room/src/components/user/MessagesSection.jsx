import { useState } from 'react';
import ChatBox from '../chat/ChatBox';
export default function MessagesSection() {
 const [selectedChat, setSelectedChat] = useState(null);
 const [chats] = useState([
   {
     id: 1,
     name: "Nguyễn Văn A",
     avatar: "https://via.placeholder.com/40",
     lastMessage: "Xin chào, tôi muốn hỏi về phòng trọ",
     timestamp: "10:30"
   },
   // Thêm dữ liệu mẫu khác nếu cần
 ]);
  return (
   <div>
     <h2 className="text-2xl font-bold mb-6">Tin nhắn</h2>
     <div className="grid md:grid-cols-3 gap-4">
       {/* Danh sách chat */}
       <div className="bg-white rounded-lg shadow-md overflow-hidden">
         <div className="divide-y">
           {chats.map((chat) => (
             <div
               key={chat.id}
               onClick={() => setSelectedChat(chat)}
               className={`p-4 cursor-pointer hover:bg-gray-50 ${
                 selectedChat?.id === chat.id ? 'bg-gray-50' : ''
               }`}
             >
               <div className="flex items-center space-x-3">
                 <img
                   src={chat.avatar}
                   alt={chat.name}
                   className="w-10 h-10 rounded-full"
                 />
                 <div className="flex-1 min-w-0">
                   <p className="font-semibold truncate">{chat.name}</p>
                   <p className="text-sm text-gray-500 truncate">
                     {chat.lastMessage}
                   </p>
                 </div>
                 <span className="text-xs text-gray-500">{chat.timestamp}</span>
               </div>
             </div>
           ))}
         </div>
       </div>
        {/* Chat box */}
       <div className="md:col-span-2">
         {selectedChat ? (
           <ChatBox receiver={selectedChat} />
         ) : (
           <div className="h-full flex items-center justify-center text-gray-500">
             Chọn một cuộc trò chuyện để bắt đầu
           </div>
         )}
       </div>
     </div>
   </div>
 );
}