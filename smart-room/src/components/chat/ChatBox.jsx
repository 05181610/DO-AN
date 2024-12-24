import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatBox({ receiver }) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock data - sẽ được thay thế bằng real-time messages
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'owner',
        content: 'Xin chào, tôi có thể giúp gì cho bạn?',
        timestamp: '10:00'
      },
      {
        id: 2,
        sender: 'user',
        content: 'Tôi muốn hỏi về phòng trọ của bạn',
        timestamp: '10:01'
      }
    ]);
  }, []);

  const handleSendMessage = (message) => {
    setMessages([...messages, {
      id: messages.length + 1,
      sender: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <img
            src={receiver.avatar || "https://via.placeholder.com/40"}
            alt={receiver.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">{receiver.name}</h3>
            <p className="text-sm text-gray-500">{receiver.status}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwn={message.sender === 'user'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};