import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const ChatWidget = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    // Thêm tin nhắn người dùng
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Gửi yêu cầu đến chatbot
      const response = await axiosClient.post('/chatbot/query', {
        query: input
      });

      // Parse response từ backend
      const responseData = response.data?.data || response.data;
      
      let botMessage;

      // Xử lý theo từng loại response
      if (responseData.type === 'searchResults') {
        // Hiển thị danh sách phòng
        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: responseData.message,
          data: responseData,
          isResults: true
        };
      } else if (responseData.type === 'noResults') {
        // Không có kết quả
        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: responseData.message,
          data: responseData,
          isNoResults: true
        };
      } else if (responseData.type === 'roomDetail') {
        // Chi tiết phòng
        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: responseData.message,
          data: responseData.room,
          isDetail: true
        };
      } else if (responseData.type === 'greeting') {
        // Lời chào
        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: responseData.message
        };
      } else if (responseData.type === 'needMoreInfo') {
        // Cần thêm thông tin
        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: responseData.message
        };
      } else if (responseData.type === 'error') {
        // Lỗi
        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: responseData.message || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.'
        };
      } else {
        // Default - nếu là message string
        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: responseData.message || JSON.stringify(responseData)
        };
      }

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      // Thêm tin nhắn lỗi
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-all"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border">
          <div className="p-4 border-b bg-primary text-white rounded-t-lg">
            <h3 className="font-bold">Trợ lý tìm phòng</h3>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
            {messages.length === 0 && (
              <div className="text-center text-gray-500">
                <p>Xin chào! Tôi có thể giúp bạn tìm phòng.</p>
                <p className="mt-2">Ví dụ: "Tìm phòng trọ dưới 3 triệu"</p>
              </div>
            )}
            {messages.map(message => (
              <div key={message.id}>
                {message.type === 'user' ? (
                  // User message
                  <div className="p-3 rounded-lg max-w-[80%] break-words bg-primary text-white ml-auto">
                    {message.content}
                  </div>
                ) : (
                  // Bot message
                  <div>
                    {/* Message text */}
                    <div className="p-3 rounded-lg max-w-[80%] bg-gray-100">
                      {message.content}
                    </div>

                    {/* Search results - hiển thị room cards */}
                    {message.isResults && message.data?.rooms && (
                      <div className="mt-3 space-y-2 max-w-md">
                        {message.data.rooms.map((room, idx) => (
                          <div
                            key={room.id}
                            onClick={() => navigate(`/rooms/${room.id}`)}
                            className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-bold text-sm text-gray-900">{room.title}</p>
                                <p className="text-xs text-gray-700 mt-1">
                                  📍 {room.district} • {room.location}
                                </p>
                                <p className="text-sm font-semibold text-blue-600 mt-1">
                                  💰 {room.priceFormatted}/tháng
                                </p>
                                {room.facilities && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    ✨ {room.facilities}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                #{room.rank}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No results with suggestions */}
                    {message.isNoResults && message.data?.suggestions && (
                      <div className="mt-3 space-y-2 max-w-md">
                        <p className="text-sm font-semibold text-gray-700 mt-2">Gợi ý cho bạn:</p>
                        {message.data.suggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors text-sm"
                            onClick={() => {
                              if (suggestion.type === 'priceRange') {
                                setInput(`Tìm phòng dưới ${suggestion.newPrice / 1000000} triệu`);
                              } else if (suggestion.type === 'district') {
                                setInput(`Tìm phòng ở ${suggestion.availableDistricts[0]}`);
                              } else if (suggestion.type === 'facilities') {
                                setInput('Tìm phòng loại bỏ tiện ích');
                              }
                            }}
                          >
                            <p className="font-semibold">{suggestion.title}</p>
                            <p className="text-gray-600">{suggestion.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Room detail */}
                    {message.isDetail && message.data && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg max-w-md">
                        <h3 className="font-bold text-gray-900">{message.data.title}</h3>
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Giá:</strong> {message.data.priceFormatted}/tháng
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Địa chỉ:</strong> {message.data.location}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Khu vực:</strong> {message.data.district}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Loại:</strong> {message.data.type}
                        </p>
                        {message.data.area && (
                          <p className="text-sm text-gray-700">
                            <strong>Diện tích:</strong> {message.data.area} m²
                          </p>
                        )}
                        {message.data.facilities && (
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Tiện ích:</strong> {message.data.facilities}
                          </p>
                        )}
                        <button
                          onClick={() => navigate(`/rooms/${message.data.id}`)}
                          className="mt-3 w-full px-3 py-2 bg-blue-500 text-white rounded text-sm font-semibold hover:bg-blue-600"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex space-x-2 p-3 bg-gray-100 rounded-lg w-16">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            )}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Nhập yêu cầu tìm phòng..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                disabled={isLoading}
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                disabled={isLoading}
              >
                Gửi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;