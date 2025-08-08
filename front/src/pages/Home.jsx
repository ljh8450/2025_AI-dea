import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AmbientBG from '../components/AmbientBG';
import ThemeDock from '../components/ThemeDock';

const Home = () => {
  // 라이트/다크 상태 (로컬스토리지와 동기화)
  const [variant, setVariant] = useState(localStorage.getItem('ui:variant') || 'light');
  useEffect(() => { localStorage.setItem('ui:variant', variant); }, [variant]);
  const toggleVariant = () => setVariant(v => (v === 'light' ? 'dark' : 'light'));
  const isLight = variant === 'light';

  return (
    <div className={`relative min-h-screen overflow-hidden ${isLight ? 'bg-blue-50 text-slate-900' : 'bg-slate-950 text-white'}`}>
      {/* 통합 배경: Aurora + Ripple */}
      <AmbientBG
        variant={variant}
        interactive
        rippleTrail={false}   // 이동 잔상 Off (원하면 true)
        auroraOpacity={0.9}
        rippleOpacity={1}
      />

      {/* 라이트/다크 토글 버튼 복구 */}
      <ThemeDock variant={variant} onToggle={toggleVariant} />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-2xl text-center">
          <div className={`mx-auto rounded-3xl border shadow-xl p-10 backdrop-blur-sm ${isLight ? 'border-slate-200 bg-white/70' : 'border-white/10 bg-white/5'}`}>
            <h1 className={`text-5xl font-extrabold mb-4 ${isLight ? 'text-blue-700' : ''}`}>🎓 On_AIr</h1>
            <p className={`text-lg mb-10 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
              친구들의 관심사, AI로 연결되다.
            </p>
            <Link
              to="/login"
              className={`inline-block px-8 py-3 rounded-full text-lg font-semibold shadow transition ${isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-sky-500/90 hover:bg-sky-500 text-white'}`}
            >
              시작하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
