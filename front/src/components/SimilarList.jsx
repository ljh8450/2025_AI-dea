import React from 'react';

const SimilarList = ({ items = [], variant = 'light', onPick }) => {
  if (!items || items.length === 0) return null;

  const isLight = variant === 'light';
  const shellCls = isLight
    ? 'bg-white border border-slate-200'
    : 'bg-white/5 border border-white/10 backdrop-blur';
  const headingCls = isLight ? 'text-slate-800' : 'text-slate-200';
  const itemBorder = isLight ? 'border-slate-200' : 'border-white/10';
  const itemText = isLight ? 'text-slate-700' : 'text-slate-200/90';
  const itemHover = onPick ? (isLight ? 'hover:bg-blue-50' : 'hover:bg-white/10') : '';

  return (
    <div className="mt-6 max-w-3xl mx-auto text-left">
      <h3 className={`text-sm font-semibold mb-3 ${headingCls}`}>
        💬 이런 질문도 있었어요
      </h3>
      <ul className={`rounded shadow p-5 space-y-2 ${shellCls}`}>
        {items.map((q, i) => (
          <li
            key={i}
            className={`pb-2 last:pb-0 border-b last:border-none ${itemBorder} ${itemText}`}
          >
            {onPick ? (
              <button
                type="button"
                onClick={() => onPick(q)}
                className={`w-full text-left rounded px-1 py-0.5 ${itemHover}`}
                title="이 질문으로 채팅창에 채워넣기"
              >
                {q}
              </button>
            ) : (
              q
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SimilarList;
