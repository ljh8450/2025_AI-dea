// front/src/pages/Trends.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import TrendScopeSelector from '../components/TrendScopeSelector';
import TrendList from '../components/TrendList';
import SuggestedList from '../components/SuggestedList';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const Trends = ({ variant = 'light' }) => {
  const [scope, setScope] = useState({ level: 'all' });
  const [trend, setTrend] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState(null);
  const [categorySuggestions, setCategorySuggestions] = useState([]);

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
    <div className="relative z-10">
      {/* 헤더는 그대로 variant만 전달 */}
      <Header variant={variant} />

      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-4 card">
          <TrendScopeSelector scope={scope} setScope={setScope} variant={variant} />
        </div>

        {trendLoading && <p className="text-sm muted">불러오는 중…</p>}
        {trendError && <p className="text-sm text-red-500">{trendError}</p>}

        <div className="card">
          <TrendList trend={trend} onSelectCategory={handleSelectCategory} variant={variant} />
        </div>

        <div className="mt-6 card">
          <SuggestedList
            title="📚 선택한 카테고리의 추천 질문"
            items={categorySuggestions}
            onPick={handlePickSuggestion}
            variant={variant}
          />
        </div>
      </div>
    </div>
  );
};

export default Trends;
