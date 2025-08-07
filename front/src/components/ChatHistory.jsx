// src/components/ChatHistory.jsx
import React from 'react'

const ChatHistory = ({ history }) => {
  return (
    <div className="mt-6 space-y-4">
      {history.map((msg, i) => (
        <div key={i} className={`p-4 rounded-lg max-w-2xl ${msg.role === 'user' ? 'bg-white text-right ml-auto' : 'bg-blue-100 text-left mr-auto'}`}>
          <p className="text-sm text-gray-500 mb-1">{msg.role === 'user' ? '👤 사용자' : '🤖 AI'}</p>
          <p className="whitespace-pre-line">{msg.content}</p>
        </div>
      ))}
    </div>
  )
}

export default ChatHistory