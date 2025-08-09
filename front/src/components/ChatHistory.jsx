// front/src/components/ChatHistory.jsx
import React from 'react';

const ChatHistory = ({ history = [], variant = 'light' }) => {
  const isLight = variant === 'light';
  if (!Array.isArray(history) || history.length === 0) return null;

  return (
    <div className="mt-2 space-y-3">
      {history.map((m, i) => {
        const mine = m.role === 'user';
        const base = mine
          ? (isLight ? 'bg-blue-200 text-right ml-auto border border-slate-200' : 'bg-sky-900/30 text-right ml-auto border border-white/10')
          : (isLight ? 'bg-blue-100/70 text-left mr-auto' : 'bg-white/10 text-left mr-auto');
        return (
          <div
            key={i}
            className={`max-w-2xl rounded-2xl px-4 py-3 whitespace-pre-line shadow-sm ${base}`}
          >
            <p className={`text-xs mb-1 ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
              {mine ? '👤 사용자' : '🤖 AI'}
            </p>
            <div className="text-sm leading-relaxed">{m.content}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatHistory;
