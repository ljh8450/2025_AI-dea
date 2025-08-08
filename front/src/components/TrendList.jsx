import React from 'react';

const TrendList = ({ trend = [], onSelectCategory, variant = 'light' }) => {
  const isLight = variant === 'light';

  if (!trend) return null;
  if (trend.length === 0) {
    return (
      <p className={`text-center mt-4 ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
        😶 아직 충분한 관심사 데이터가 없어요.
      </p>
    );
  }

  const shellCls = isLight
    ? 'bg-white border border-slate-200'
    : 'bg-white/5 border border-white/10 backdrop-blur';
  const headingCls = isLight ? 'text-slate-900' : 'text-slate-100';
  const itemBorder = isLight ? 'border-slate-200' : 'border-white/10';
  const itemText = isLight ? 'text-slate-800' : 'text-slate-100';
  const btnCls = isLight
    ? 'text-blue-600 hover:underline'
    : 'text-sky-300 hover:underline';

  return (
    <div className="mt-6 max-w-3xl mx-auto text-left">
      <h2 className={`text-lg font-bold mb-4 ${headingCls}`}>🔥 이번 주 관심사 TOP 5</h2>
      <ul className={`rounded shadow p-6 space-y-2 ${shellCls}`}>
        {trend.map((topic, idx) => (
          <li
            key={idx}
            className={`flex justify-between items-center border-b last:border-none pb-2 ${itemBorder}`}
          >
            <span className={`${itemText} font-medium`}>
              {idx + 1}. {topic}
            </span>
            {onSelectCategory && (
              <button
                className={`text-sm ${btnCls}`}
                onClick={() => onSelectCategory(topic)}
              >
                이 카테고리로 추천받기
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendList;
