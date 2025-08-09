import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AmbientBG from '../components/AmbientBG';
import ThemeDock from '../components/ThemeDock';
import '../index.css'; // tailwind가 여기서 적용됨

const Login = ({ variant = 'light', toggleVariant }) => {
  const navigate = useNavigate();
  const isLight = variant === 'light';

  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [school, setSchool] = useState(localStorage.getItem('school') || '');
  const [grade, setGrade] = useState(localStorage.getItem('grade') || '');
  const [klass, setKlass] = useState(localStorage.getItem('class') || '');

  const handleLogin = (e) => {
    e?.preventDefault();
    if (!username.trim()) return alert('이름을 입력해주세요');
    localStorage.setItem('username', username.trim());
    localStorage.setItem('school', school.trim());
    localStorage.setItem('grade', grade.trim());
    localStorage.setItem('class', klass.trim());
    navigate('/chat');
  };

  return (
    <div className="relative min-h-screen app-bg overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AmbientBG variant={variant} interactive />
      </div>

      <ThemeDock variant={variant} onToggle={toggleVariant} />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md card card-solid">
          <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm muted">이름</label>
              <input
                className="field"
                placeholder="이름을 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm muted">학교</label>
              <input
                className="field"
                placeholder="학교명"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block mb-1 text-sm muted">학년</label>
                <input
                  className="field"
                  placeholder="예: 2"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm muted">반</label>
                <input
                  className="field"
                  placeholder="예: 3"
                  value={klass}
                  onChange={(e) => setKlass(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="mt-2 w-full btn-primary">
              시작하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
