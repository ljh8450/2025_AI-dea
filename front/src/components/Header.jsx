import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const username = localStorage.getItem('username');

  return (
    <header className="w-full border-b-2 border-gray-300 bg-white py-4 shadow-sm">
      <div className="max-w-4xl mx-auto flex justify-between items-center px-4 ">
        <h1 className="text-xl font-bold text-blue-600">📡 On_AIr</h1>
        <div className='flex gap-4'>
          <Link to="/main" className='text-gray-700'>메인</Link>
          <Link to="/literacy" className='text-gray-700'>리터러시 체험</Link>
        </div>
        <span className="text-gray-700 font-medium">👋 {username || '익명 사용자'}</span>
      </div>
    </header>
  );
};

export default Header;
