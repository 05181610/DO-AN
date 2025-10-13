import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const ChatWidget = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý click vào tin nhắn để điều hướng đến trang chi tiết phòng
  const handleMessageClick = (content) => {
    const roomIdMatch = content.match(/phòng (?:số )?(\d+)/i);
    if (roomIdMatch) {
      const roomId = roomIdMatch[1];
      navigate(`/rooms/${roomId}`);
    }
  };
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

      // Thêm phản hồi từ chatbot
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data
      };

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
                <p className="mt-2">Ví dụ: "Tìm phòng trọ dưới 3 triệu ở Quy Nhơn"</p>
              </div>
            )}
            {messages.map(message => (
              <div 
                key={message.id}
                onClick={() => message.type === 'bot' && handleMessageClick(message.content)}
                className={`p-3 rounded-lg max-w-[80%] break-words ${
                  message.type === 'user' 
                    ? 'bg-primary text-white ml-auto' 
                    : 'bg-gray-100 hover:bg-gray-200 cursor-pointer'
                }`}
              >
                {message.content}
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