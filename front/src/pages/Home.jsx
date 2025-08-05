import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-br from-blue-100 to-white px-4">
      <h1 className="text-5xl font-bold mb-4 text-blue-700">🎓 On_AIr</h1>
      <p className="text-gray-700 text-lg mb-10">
        친구들의 관심사, AI로 연결되다.
      </p>
      <Link
        to="/login"
        className="bg-blue-500 text-white px-8 py-3 rounded-full text-lg shadow-lg hover:bg-blue-600 transition"
      >
        시작하기
      </Link>
    </div>
  );
};

export default Home;