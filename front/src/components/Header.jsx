// front/src/components/Header.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  const username = localStorage.getItem('username') || '';
  const userId = localStorage.getItem('onair_user_id') || '';

  const shellCls = 'backdrop-blur border-b';
  const shellStyle = {
    backgroundColor: 'var(--bg-dark)',
    borderColor: 'var(--primary-20)',
  };

  const base = 'px-3 py-1 rounded transition-colors text-sm md:text-base border';

  const linkClass = ({ isActive }) => {
    if (isActive) {
      return `${base} bg-[var(--primary)] text-white border-[var(--primary-20)]`;
    }
    return `${base} bg-[var(--card)] text-[var(--fg)] border-[var(--primary-20)] hover:bg-[color-mix(in_srgb,var(--primary)_18%,transparent)]`;
  };

  return (
    <header className={shellCls} style={shellStyle}>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* 로고/타이틀 */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold" style={{ color: 'var(--header-title)' }}>
            On_AIr
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
        <div className="text-xs md:text-sm" style={{ color: 'var(--fg)' }}>
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
