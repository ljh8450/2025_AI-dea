import React from 'react';

const SegBtn = ({ active, children, onClick, isLight }) => {
  const base =
    'px-3 py-1 rounded-md text-sm transition-colors border';
  return (
    <button
      onClick={onClick}
      className={
        active
          ? (isLight
              ? `${base} bg-blue-600 text-white border-blue-600`
              : `${base} bg-sky-500/90 text-white border-white/10`)
          : (isLight
              ? `${base} bg-white hover:bg-blue-50 text-slate-700 border-slate-200`
              : `${base} bg-white/5 hover:bg-white/10 text-slate-200 border-white/10`)
      }
    >
      {children}
    </button>
  );
};

const TrendScopeSelector = ({ scope, setScope, variant = 'light' }) => {
  const isLight = variant === 'light';

  return (
    <div
      className={`max-w-3xl mx-auto mt-2 rounded-xl p-4 flex gap-2 items-center ${
        isLight
          ? 'bg-white border border-slate-200'
          : 'bg-white/5 border border-white/10 backdrop-blur'
      }`}
    >
      <span className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
        트렌드 범위:
      </span>
      <div className="flex gap-2">
        <SegBtn
          active={scope.level === 'all'}
          onClick={() => setScope({ level: 'all' })}
          isLight={isLight}
        >
          전체
        </SegBtn>
        <SegBtn
          active={scope.level === 'school'}
          onClick={() => setScope({ level: 'school' })}
          isLight={isLight}
        >
          학교
        </SegBtn>
        <SegBtn
          active={scope.level === 'grade'}
          onClick={() => setScope({ level: 'grade' })}
          isLight={isLight}
        >
          학년
        </SegBtn>
        <SegBtn
          active={scope.level === 'class'}
          onClick={() => setScope({ level: 'class' })}
          isLight={isLight}
        >
          반
        </SegBtn>
      </div>
    </div>
  );
};

export default TrendScopeSelector;
