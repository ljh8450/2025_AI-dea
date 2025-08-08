import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import TrendScopeSelector from '../components/TrendScopeSelector';
import TrendList from '../components/TrendList';
import SuggestedList from '../components/SuggestedList';
import ThemeDock from '../components/ThemeDock';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const Trends = ({ variant = 'light', toggleVariant }) => {
  const isLight = variant === 'light';

  const [scope, setScope] = useState({ level: 'all' });
  const [trend, setTrend] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState(null);
  const [categorySuggestions, setCategorySuggestions] = useState([]);

  // fetchTrends는 scope를 인자로 받고, 훅 의존성은 비워 안정화
  const fetchTrends = useCallback(async (sc) => {
    try {
      setTrendLoading(true);
      setTrendError(null);

      const school = localStorage.getItem('school') || '';
      const grade  = localStorage.getItem('grade') || '';
      const klass  = localStorage.getItem('class') || '';

      const params = new URLSearchParams();
      if (sc?.level === 'school') params.set('school', school);
      if (sc?.level === 'grade')  { params.set('school', school); params.set('grade', grade); }
      if (sc?.level === 'class')  { params.set('school', school); params.set('grade', grade); params.set('class', klass); }

      const res = await axios.get(`${API_BASE}/api/trends?${params.toString()}`);
      setTrend(res.data.topics || []);
    } catch (err) {
      console.error(err);
      setTrendError('트렌드를 불러오지 못했어요.');
      setTrend([]);
    } finally {
      setTrendLoading(false);
    }
  }, []);

  // scope가 바뀔 때마다 새로 요청
  useEffect(() => { fetchTrends(scope); }, [scope, fetchTrends]);

  const handleSelectCategory = async (cat) => {
    try {
      const res = await axios.get(`${API_BASE}/api/recommend/by-category`, { params: { category: cat } });
      setCategorySuggestions(res.data.items || []);
    } catch (err) { console.error(err); }
  };

  const handlePickSuggestion = (q) => {
    navigator.clipboard?.writeText(q).catch(()=>{});
    alert('복사했어요. 채팅 페이지에서 붙여넣어 질문하세요!');
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-blue-50 text-slate-900' : 'bg-slate-950 text-white'}`}>
      {/* 테마 토글 버튼 */}
      <ThemeDock variant={variant} onToggle={toggleVariant} />

      {/* ✅ 헤더도 테마 반영 */}
      <Header variant={variant} />

      <div className="p-6 max-w-3xl mx-auto">
        <div className={`mb-4 rounded-xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10 backdrop-blur'}`}>
          <TrendScopeSelector scope={scope} setScope={setScope} variant={variant} />
        </div>

        {trendLoading && <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>불러오는 중…</p>}
        {trendError && <p className="text-sm text-red-500">{trendError}</p>}

        <div className={`rounded-xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10 backdrop-blur'}`}>
          <TrendList trend={trend} onSelectCategory={handleSelectCategory} variant={variant} />
        </div>

        <div className={`mt-6 rounded-xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10 backdrop-blur'}`}>
          <SuggestedList 
            title="📚 선택한 카테고리의 추천 질문" 
            items={categorySuggestions} 
            onPick={handlePickSuggestion} variant={variant} />
        </div>
      </div>
    </div>
  );
};

export default Trends;
