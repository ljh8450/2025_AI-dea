import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ⬇️ Aurora/Ripple 개별 import 제거
import AmbientBG from '../components/AmbientBG';
import ThemeDock from '../components/ThemeDock';

const Login = ({ variant = 'light', toggleVariant }) => {
  const navigate = useNavigate();
  const isLight = variant === 'light';

  // 입력값
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [school, setSchool]     = useState(localStorage.getItem('school') || '');
  const [grade, setGrade]       = useState(localStorage.getItem('grade') || '');
  const [klass, setKlass]       = useState(localStorage.getItem('class') || '');

  const handleLogin = (e) => {
    e?.preventDefault();
    if (!username.trim()) return alert('이름을 입력해주세요');
    localStorage.setItem('username', username.trim());
    localStorage.setItem('school',   school.trim());
    localStorage.setItem('grade',    grade.trim());
    localStorage.setItem('class',    klass.trim());
    navigate('/chat');
  };

  return (
    <div className={`relative min-h-screen overflow-hidden ${isLight ? 'bg-blue-50 text-slate-900' : 'bg-slate-950 text-white'}`}>
      {/* ✅ AmbientBG 한 장으로 통합 (z-0) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AmbientBG variant={variant} interactive /> 
      </div>

      {/* 테마 토글 */}
      <ThemeDock variant={variant} onToggle={toggleVariant} />

      {/* 콘텐츠 (z-10) */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className={`w-full max-w-md rounded-2xl border shadow-xl p-8 ${isLight ? 'border-slate-200 bg-white/75 backdrop-blur-sm' : 'border-white/10 bg-white/5 backdrop-blur-md'}`}>
          <h1 className={`text-2xl font-bold mb-6 text-center ${isLight ? 'text-blue-700' : ''}`}>로그인</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`block mb-1 text-sm ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>이름</label>
              <input
                className={`w-full rounded-lg border p-3 outline-none focus:ring-2 ${isLight ? 'border-slate-300 bg-white focus:ring-blue-300 text-slate-900' : 'border-white/10 bg-black/20 focus:ring-sky-400 text-white placeholder-white/60'}`}
                placeholder="이름을 입력하세요"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className={`block mb-1 text-sm ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>학교</label>
              <input
                className={`w-full rounded-lg border p-3 outline-none focus:ring-2 ${isLight ? 'border-slate-300 bg-white focus:ring-blue-300 text-slate-900' : 'border-white/10 bg-black/20 focus:ring-sky-400 text-white placeholder-white/60'}`}
                placeholder="학교명"
                value={school}
                onChange={(e)=>setSchool(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className={`block mb-1 text-sm ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>학년</label>
                <input
                  className={`w-full rounded-lg border p-3 outline-none focus:ring-2 ${isLight ? 'border-slate-300 bg-white focus:ring-blue-300 text-slate-900' : 'border-white/10 bg-black/20 focus:ring-sky-400 text-white placeholder-white/60'}`}
                  placeholder="예: 2"
                  value={grade}
                  onChange={(e)=>setGrade(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className={`block mb-1 text-sm ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>반</label>
                <input
                  className={`w-full rounded-lg border p-3 outline-none focus:ring-2 ${isLight ? 'border-slate-300 bg-white focus:ring-blue-300 text-slate-900' : 'border-white/10 bg-black/20 focus:ring-sky-400 text-white placeholder-white/60'}`}
                  placeholder="예: 3"
                  value={klass}
                  onChange={(e)=>setKlass(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`mt-2 w-full rounded-lg p-3 font-semibold transition ${isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-sky-500/90 hover:bg-sky-500 text-white'}`}
            >
              시작하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
