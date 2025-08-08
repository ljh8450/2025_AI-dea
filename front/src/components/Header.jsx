import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = ({ variant = 'light' }) => {
  const isLight = variant === 'light';
  const username = localStorage.getItem('username') || '';
  const userId = localStorage.getItem('onair_user_id') || '';

  const shellCls = isLight
    ? 'bg-blue-100/80 border-b border-slate-200'
    : 'bg-slate-900/70 border-b border-white/10 backdrop-blur';

  // NavLink 스타일: 활성/비활성 + 라이트/다크 분기
  const base = 'px-3 py-1 rounded transition-colors text-sm md:text-base border';
  const linkClass = ({ isActive }) => {
    if (isActive) {
      return isLight
        ? `${base} bg-white border-slate-200 text-slate-900`
        : `${base} bg-white/10 border-white/10 text-white`;
    }
    return isLight
      ? `${base} bg-blue-50 hover:bg-white border-slate-200 text-slate-700`
      : `${base} bg-white/5 hover:bg-white/10 border-white/10 text-slate-200`;
  };

  const userTextCls = isLight ? 'text-gray-700' : 'text-slate-300';

  return (
    <header className={shellCls}>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* 로고/타이틀 */}
        <div className="flex items-center justify-between">
          <h1 className={`text-lg md:text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            On_AIr: 교내 AI 채널
          </h1>
        </div>

        {/* 내비게이션 */}
        <nav className="flex gap-2">
          <NavLink to="/chat" className={linkClass}>
            💬 채팅
          </NavLink>
          <NavLink to="/trends" className={linkClass}>
            📈 트렌드
          </NavLink>
          <NavLink to="/literacy" className={linkClass}>
            🧠 리터러시 체험
          </NavLink>
        </nav>

        {/* 사용자 표시 */}
        <div className={`text-xs md:text-sm ${userTextCls}`}>
          <span className="mr-2">
            사용자: <b>{username || '—'}</b>
          </span>
          <span className="opacity-60">ID: {userId || '—'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
