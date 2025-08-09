// front/src/App.js
import React, { useLayoutEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/Chat';
import Trends from './pages/Trends';
import LiteracyLab from './components/LiteracyLab';
import Home from './pages/Home';
import Login from './pages/Login';
import RootLayout from './components/RootLayout';

const SEASON = 'base';

function App() {
  const [variant, setVariant] = useState(localStorage.getItem('ui:variant') || 'light');

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', SEASON);
    root.setAttribute('data-variant', variant);
    localStorage.setItem('season-theme', SEASON);
    localStorage.setItem('ui:variant', variant);
  }, [variant]);

  const toggleVariant = () => setVariant(v => (v === 'light' ? 'dark' : 'light'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        {/* ✅ 공통 레이아웃 */}
        <Route element={<RootLayout variant={variant} toggleVariant={toggleVariant} />}>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/literacy" element={<LiteracyLab />} />
        </Route>

        <Route path="*" element={<div className="p-6">404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
