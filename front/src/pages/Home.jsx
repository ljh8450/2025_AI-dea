// front/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import AmbientBG from '../components/AmbientBG';
import ThemeDock from '../components/ThemeDock';

const Home = ({ variant, toggleVariant }) => {
  return (
    <div className="relative min-h-screen overflow-hidden app-bg">
      {/* 배경 레이어 */}
      <AmbientBG
        variant={variant}       // 라이트/다크만 영향을 줌
        interactive
        rippleTrail={false}
        auroraOpacity={0.9}
        rippleOpacity={1}
      />

      {/* 라이트/다크 토글 그대로 */}
      <ThemeDock variant={variant} onToggle={toggleVariant} />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-2xl text-center">
          <div className="mx-auto card">
            <h1 className="title">🎓 On_AIr</h1>
            <p className="muted">친구들의 관심사, AI로 연결되다.</p>
            <Link to="/login" className="btn-primary">
              시작하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
