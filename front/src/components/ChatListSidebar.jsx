// front/src/components/ChatListSidebar.jsx
import React from 'react'

const ChatListSidebar = ({ chats, selectedId, onSelect, onNew, onDelete, variant='light' }) => {
  const isLight = variant === 'light';

  return (
    <aside
      className={`w-64 h-full p-3 flex flex-col border-r backdrop-blur`}
      style={{
        backgroundColor: 'var(--bg-dark)',
        color: 'var(--fg)',
        borderColor: 'var(--primary-20)',
      }}
    >
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
            className={`group flex items-center gap-2 px-3 py-2 rounded cursor-pointer truncate ${
              selectedId === c.chat_id ? 'bg-gray-500' : 'hover:bg-gray-400'
            }`}
            onClick={() => onSelect(c.chat_id)}
            title={c.title}
          >
            <span className="flex-1 truncate">{c.title || c.chat_id}</span>

            {/* 삭제 버튼 (hover 시 나타남) */}
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-300 hover:text-red-200 px-1 rounded"
              title="삭제"
              aria-label="채팅 삭제"
              onClick={(e) => {
                e.stopPropagation(); // 항목 선택 방지
                onDelete?.(c.chat_id, c.title || c.chat_id);
              }}
            >
              🗑️
            </button>
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
