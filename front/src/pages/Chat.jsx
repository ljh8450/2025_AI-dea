import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import QueryInput from '../components/QueryInput';
import ChatHistory from '../components/ChatHistory';
import SimilarList from '../components/SimilarList';
import SuggestedList from '../components/SuggestedList';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';

// 입력바 고정 높이(패딩 계산용)
const INPUT_BAR_H = 76; // px: 헤더 아래 고정 입력줄 높이(필요시 조정)

const Chat = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);        // [{role, content}]
  const [similar, setSimilar] = useState([]);
  const [nextSuggestions, setNextSuggestions] = useState([]);
  const [sp] = useSearchParams();

  const bottomRef = useRef(null);

  useEffect(() => {
    const pf = sp.get('prefill');
    if (pf) setInput(pf);
  }, [sp]);

  // 메시지 추가/변경 시 맨 아래로 스크롤
  useEffect(() => {
    const id = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 0);
    return () => clearTimeout(id);
  }, [history]);

  const handleSubmit = async () => {
    const msg = input.trim();
    if (!msg) return;

    const meta = {
      school: localStorage.getItem('school') || '',
      grade:  localStorage.getItem('grade') || '',
      class:  localStorage.getItem('class') || '',
    };

    try {
      setHistory(prev => [...prev, { role: 'user', content: msg }]);
      setInput('');

      const res = await axios.post(`${API_BASE}/api/query`, { message: msg, ...meta });
      const answer = res?.data?.answer ?? '응답을 불러오지 못했어요.';
      const sims = res?.data?.similar_questions ?? [];

      setHistory(prev => [...prev, { role: 'assistant', content: answer }]);
      setSimilar(Array.isArray(sims) ? sims : []);

      // (옵션) 후속 추천
      // const nx = await axios.post(`${API_BASE}/api/recommend/next`, { message: msg });
      // setNextSuggestions(Array.isArray(nx?.data?.items) ? nx.data.items : []);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'assistant', content: '오류가 발생했어요. 잠시 후 다시 시도해 주세요.' }]);
    }
  };

  const handlePickSuggestion = (q) => setInput(q);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />

      {/* 스크롤 영역: 좌측 정렬, 위에서부터 쌓이기 */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          // 입력바가 fixed라서 겹치지 않도록 아래 패딩 확보
          paddingBottom: INPUT_BAR_H + 24, // 입력바 높이 + 여유
        }}
      >
        <div className="w-full max-w-3xl mx-auto px-4 py-4">
          {/* 메시지는 위에서부터 자연스럽게(가운데 X) */}
          <ChatHistory history={Array.isArray(history) ? history : []} />

          {/* 유사 질문 */}
          <SimilarList items={Array.isArray(similar) ? similar : []} />

          {/* 후속 추천 */}
          <SuggestedList
            title="➡️ 다음에 이렇게 물어보면 좋아요"
            items={Array.isArray(nextSuggestions) ? nextSuggestions : []}
          />

          <div ref={bottomRef} />
        </div>
      </div>

      {/* 입력바: 항상 화면 하단에 고정 */}
      <div
        className="fixed left-0 right-0 bottom-20 border-t bg-blue-50/95 backdrop-blur"
        style={{ height: INPUT_BAR_H }}
      >
        <div className="h-full max-w-3xl mx-auto px-4 flex items-center">
          <QueryInput input={input} setInput={setInput} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
