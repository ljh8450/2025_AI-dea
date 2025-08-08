import React from 'react';

const ThemeDock = ({ variant, onToggle }) => (
  <div className="fixed right-4 bottom-4 z-40">
    <button
      onClick={onToggle}
      className="rounded-full px-4 py-2 shadow bg-white/80 backdrop-blur hover:bg-white text-sm font-medium"
      title="라이트/다크 토글"
    >
      {variant === 'light' ? '🌞 Light' : '🌙 Dark'}
    </button>
  </div>
);

export default ThemeDock;
