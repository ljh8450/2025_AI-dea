// front/src/components/RootLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AmbientBG from './AmbientBG';
import ThemeDock from './ThemeDock';

export default function RootLayout({ variant, toggleVariant }) {
  return (
    <div className="relative min-h-screen overflow-hidden app-bg">
      {/* 배경(전 페이지 공통) */}
      <AmbientBG
        variant={variant}        // 라이트/다크만 영향
        interactive
        rippleTrail={false}
        auroraOpacity={0.9}
        rippleOpacity={1}
      />
      <div className="vibe-overlay" />

      {/* 라이트/다크 토글(원하면 헤더로 이동 가능) */}
      <ThemeDock variant={variant} onToggle={toggleVariant} />

      {/* 여기 안에 각 페이지가 렌더링됨 */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
