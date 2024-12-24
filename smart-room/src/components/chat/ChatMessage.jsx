export default function ChatMessage({ message, isOwn }) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[70%] rounded-lg p-3 ${
            isOwn
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <p>{message.content}</p>
          <span className={`text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'} block mt-1`}>
            {message.timestamp}
          </span>
        </div>
      </div>
    );
  };