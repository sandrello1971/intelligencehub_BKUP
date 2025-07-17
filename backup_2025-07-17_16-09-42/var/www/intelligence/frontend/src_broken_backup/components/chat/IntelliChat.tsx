import React, { useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const IntelliChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Ciao! Sono IntelliChat, il tuo assistente AI per IntelligenceHUB. Come posso aiutarti oggi?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900">💬 IntelliChat</h1>
        <p className="text-gray-600">Assistente AI con accesso al database aziendale</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md rounded-lg p-3 ${
              message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-white border'
            }`}>
              <div className="text-sm font-medium mb-1">
                {message.type === 'user' ? '👤 Tu' : '🤖 IntelliChat'}
              </div>
              <div>{message.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
            📤
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntelliChat;
