import React from 'react';

const ControlDock = ({ effect, onToggleEffect, variant, onToggleVariant }) => {
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col gap-2">
      <button
        onClick={onToggleEffect}
        className="rounded-full px-4 py-2 shadow bg-white/80 backdrop-blur hover:bg-white text-sm font-medium"
        title="배경 효과 토글"
      >
        {effect === 'aurora' ? '🌌 Aurora' : '💧 Ripple'}
      </button>
      <button
        onClick={onToggleVariant}
        className="rounded-full px-4 py-2 shadow bg-white/80 backdrop-blur hover:bg-white text-sm font-medium"
        title="라이트/다크 테마"
      >
        {variant === 'light' ? '🌞 Light' : '🌙 Dark'}
      </button>
    </div>
  );
};

export default ControlDock;
