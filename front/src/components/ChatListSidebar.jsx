import React from 'react'

const ChatListSidebar = ({ chats, selectedId, onSelect, onNew }) => {
  return (
    <aside className="w-64 bg-gray-900 text-gray-100 h-full p-3 flex flex-col">
      <button
        className="mb-3 bg-emerald-600 hover:bg-emerald-700 rounded px-3 py-2"
        onClick={onNew}
      >
        + 새 채팅
      </button>
      <div className="flex-1 overflow-y-auto space-y-1">
        {chats.map(c => (
          <div
            key={c.chat_id}
            onClick={() => onSelect(c.chat_id)}
            className={`px-3 py-2 rounded cursor-pointer truncate ${
              selectedId === c.chat_id ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
            title={c.title}
          >
            {c.title || c.chat_id}
          </div>
        ))}
        {chats.length === 0 && (
          <div className="text-xs text-gray-400 mt-2">채팅방이 없습니다. 새 채팅을 만들어보세요.</div>
        )}
      </div>
    </aside>
  )
}

export default ChatListSidebar
