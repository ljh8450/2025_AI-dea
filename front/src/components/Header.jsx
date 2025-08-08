// src/components/Header.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  const username = localStorage.getItem('username') || '';
  const userId = localStorage.getItem('onair_user_id') || '';

  const linkBase =
    'px-3 py-1 rounded transition-colors text-sm md:text-base';
  const linkClass = ({ isActive }) =>
    isActive
      ? `${linkBase} bg-white border text-gray-900`
      : `${linkBase} bg-gray-100 border text-gray-700 hover:bg-white`;

  return (
    <header className="bg-blue-100 border-b">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* 로고/타이틀 */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold">
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
        <div className="text-xs md:text-sm text-gray-700">
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
