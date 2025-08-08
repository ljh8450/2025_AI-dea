// front/src/components/AuroraBG.jsx
import React, { useEffect, useRef } from 'react';

const AuroraBG = ({ interactive = false, variant = 'light' }) => {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!interactive || !rootRef.current) return;

    let rafId = 0;
    let tx = 0, ty = 0;     // target
    let x = 0, y = 0;       // current (lerp)
    const lerp = (a, b, t) => a + (b - a) * t;

    const onMove = (e) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cx = (e.clientX ?? (e.touches?.[0]?.clientX ?? vw/2));
      const cy = (e.clientY ?? (e.touches?.[0]?.clientY ?? vh/2));
      tx = (cx / vw) * 2 - 1; // -1..1
      ty = (cy / vh) * 2 - 1;
    };

    const loop = () => {
      x = lerp(x, tx, 0.08);
      y = lerp(y, ty, 0.08);
      rootRef.current?.style.setProperty('--mx', x.toFixed(4));
      rootRef.current?.style.setProperty('--my', y.toFixed(4));
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchmove', onMove);
    };
  }, [interactive]);

  // 라이트/다크에 따라 색감·불투명도 조절
  const isLight = variant === 'light';
  const blobA = isLight
    ? 'from-sky-300 via-indigo-200 to-pink-200 opacity-40 blur-2xl'
    : 'from-sky-400 via-fuchsia-400 to-amber-300 opacity-40 blur-3xl';
  const blobB = isLight
    ? 'from-cyan-200 via-violet-200 to-rose-200 opacity-35 blur-2xl'
    : 'from-violet-400 via-cyan-300 to-rose-300 opacity-30 blur-3xl';
  const blobC = isLight
    ? 'from-emerald-200 via-sky-200 to-indigo-200 opacity-30 blur-2xl'
    : 'from-emerald-300 via-indigo-300 to-pink-300 opacity-30 blur-3xl';

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 커서 파랠랙스 래퍼 + 일렁임 블롭 */}
      <div className="aurora-parallax" style={{ '--d': '60px' }}>
        <div className={`absolute -top-32 -left-32 h-96 w-96 rounded-full animate-blob bg-gradient-to-br ${blobA}`} />
      </div>

      <div className="aurora-parallax" style={{ '--d': '40px' }}>
        <div className={`absolute top-1/4 -right-24 h-[28rem] w-[28rem] rounded-full animate-blob animation-delay-2000 bg-gradient-to-br ${blobB}`} />
      </div>

      <div className="aurora-parallax" style={{ '--d': '30px' }}>
        <div className={`absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full animate-blob animation-delay-4000 bg-gradient-to-br ${blobC}`} />
      </div>

      {/* 은은한 광택 */}
      <div className={isLight
        ? 'absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.35),transparent_60%)]'
        : 'absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.15),transparent_60%)]'
      }/>

      <style>{`
        .aurora-parallax {
          position: absolute; inset: 0; will-change: transform;
          transform: translate3d(calc(var(--mx, 0) * var(--d, 0px)), calc(var(--my, 0) * var(--d, 0px)), 0);
        }
        @keyframes blob {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(30px, -50px) scale(1.08); }
          66%  { transform: translate(-20px, 20px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 12s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @media (prefers-reduced-motion: reduce) { .animate-blob { animation: none; } }
      `}</style>
    </div>
  );
};

export default AuroraBG;
