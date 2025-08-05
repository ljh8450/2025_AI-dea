import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username.trim()) {
      localStorage.setItem('username', username);
      navigate('/main');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
      <div className="max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">👤 이름을 입력하세요</h2>
        <input
          type="text"
          className="w-full border border-gray-300 p-3 rounded-md mb-4 focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="예: 2학년3반 김지훈"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition"
        >
          입장하기
        </button>
      </div>
    </div>
  );
};

export default Login;
