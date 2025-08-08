import React, { useEffect, useRef } from 'react';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/**
 * RippleBG
 * - backgroundMode:
 *    'opaque'      → 단독 사용(배경을 불투명으로 다시 칠함)
 *    'transparent' → 다른 배경 위에 올릴 때(배경을 칠하지 않음, Aurora 안 가림)
 */
const RippleBG = ({
  interactive = true,
  variant = 'dark',      // 'light' | 'dark'
  trail = true,          // 이동 리플
  spawnIntervalMs = 70,
  spawnMinDist = 28,
  smallLifeMs = 1100,
  bigLifeMs = 1700,
  backgroundMode = 'opaque', // ★ NEW
}) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const ripplesRef = useRef([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const lastSpawnRef = useRef({ t: 0, x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0, hasPos: false });

  // 팔레트
  const palette = variant === 'light'
    ? {
        bg: [239, 246, 255],      // sky-50
        halo: [59, 130, 246],     // blue-500
        inks: [
          [59,130,246],           // blue
          [6,182,212],            // cyan
          [99,102,241],           // indigo
        ]
      }
    : {
        bg: [2, 6, 23],           // slate-950
        halo: [56,189,248],       // cyan-400
        inks: [
          [56,189,248],           // cyan
          [59,130,246],           // blue
          [34,197,94],            // green
        ]
      };

  const resize = () => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    sizeRef.current = { w, h };
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    c.style.width = `${w}px`;
    c.style.height = `${h}px`;
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // CSS 픽셀 기준
  };

  const spawn = (x, y, big=false) => {
    const rgb = palette.inks[(Math.random() * palette.inks.length) | 0];
    const life = big ? bigLifeMs : smallLifeMs;
    const maxR = big ? 260 : 120;
    const lineW = big ? 2.0 : 1.2;
    ripplesRef.current.push({
      x, y,
      born: performance.now(),
      lifeMs: life,
      rgb,
      maxR,
      lineW
    });
    if (ripplesRef.current.length > 400) {
      ripplesRef.current.splice(0, ripplesRef.current.length - 400);
    }
  };

  useEffect(() => {
    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    ctx.lineCap = 'round';

    const onMove = (e) => {
      const t = e.touches?.[0];
      const x = (t?.clientX ?? e.clientX ?? 0);
      const y = (t?.clientY ?? e.clientY ?? 0);
      cursorRef.current = { x, y, hasPos: true };

      if (!interactive || !trail) return;
      const now = performance.now();
      const { t: lastT, x: lx, y: ly } = lastSpawnRef.current;
      const dist = Math.hypot(x - lx, y - ly);
      if (now - lastT >= spawnIntervalMs && dist >= spawnMinDist) {
        spawn(x, y, false);
        lastSpawnRef.current = { t: now, x, y };
      }
    };

    const onDown = (e) => {
      const x = e.clientX ?? (e.touches?.[0]?.clientX ?? cursorRef.current.x);
      const y = e.clientY ?? (e.touches?.[0]?.clientY ?? cursorRef.current.y);
      cursorRef.current = { x, y, hasPos: true };
      spawn(x, y, true); // 큰 파문
    };

    if (interactive) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('touchstart', onDown, { passive: true });
    }

    const render = () => {
      const { w, h } = sizeRef.current;

      // 프레임 초기화
      ctx.clearRect(0, 0, w, h);
      // 배경은 모드에 따라 칠함
      if (backgroundMode === 'opaque') {
        const [br, bg, bb] = palette.bg;
        ctx.fillStyle = `rgb(${br}, ${bg}, ${bb})`;
        ctx.fillRect(0, 0, w, h);
      }

      // 커서 Halo
      if (cursorRef.current.hasPos) {
        const { x, y } = cursorRef.current;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 50);
        const [hr, hg, hb] = palette.halo;
        g.addColorStop(0.0, `rgba(${hr},${hg},${hb},0.16)`);
        g.addColorStop(0.6, `rgba(${hr},${hg},${hb},0.06)`);
        g.addColorStop(1.0, `rgba(${hr},${hg},${hb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - 160, y - 160, 320, 320);
      }

      // 리플(시간 기반 수명)
      const now = performance.now();
      const next = [];
      for (const rp of ripplesRef.current) {
        const prog = (now - rp.born) / rp.lifeMs; // 0..1
        if (prog >= 1) continue;
        next.push(rp);

        const r = rp.maxR * prog;
        const alpha = Math.pow(1 - prog, 1.8);
        const lineW = rp.lineW * (0.9 + 0.6 * (1 - prog));

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, r, 0, Math.PI * 2);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = lineW;
        ctx.strokeStyle = `rgba(${rp.rgb[0]}, ${rp.rgb[1]}, ${rp.rgb[2]}, ${clamp(alpha, 0, 1)})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${rp.rgb[0]}, ${rp.rgb[1]}, ${rp.rgb[2]}, ${clamp(alpha * 0.8, 0, 0.8)})`;
        ctx.stroke();
        ctx.restore();
      }
      ripplesRef.current = next;

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      if (interactive) {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('touchstart', onDown);
      }
    };
  }, [interactive, variant, trail, spawnIntervalMs, spawnMinDist, smallLifeMs, bigLifeMs, backgroundMode]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden />;
};

export default RippleBG;
