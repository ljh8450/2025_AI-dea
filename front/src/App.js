// front/src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/Chat';
import Trends from './pages/Trends';
import LiteracyLab from './components/LiteracyLab'; // 경로 그대로 쓰세요
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  // ✅ 전역 테마 상태 (라이트/다크)
  const [variant, setVariant] = useState(localStorage.getItem('ui:variant') || 'light');
  useEffect(() => {
    localStorage.setItem('ui:variant', variant);
  }, [variant]);
  const toggleVariant = () => setVariant(v => (v === 'light' ? 'dark' : 'light'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* 👇 각 페이지에 전달 */}
        <Route path="/home" element={<Home variant={variant} toggleVariant={toggleVariant} />} />
        <Route path="/login" element={<Login variant={variant} toggleVariant={toggleVariant} />} />
        <Route path="/chat" element={<Chat variant={variant} toggleVariant={toggleVariant} />} />
        <Route path="/trends" element={<Trends variant={variant} toggleVariant={toggleVariant} />} />
        <Route path="/literacy" element={<LiteracyLab variant={variant} toggleVariant={toggleVariant} />} />

        <Route path="*" element={<div className="p-6">404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
