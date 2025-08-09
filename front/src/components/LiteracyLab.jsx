import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';

const API_BASE = 'http://localhost:5000';

const LiteracyLab = () => {
  const [mode, setMode] = useState('spot'); // 'spot' | 'compare' | 'quiz'
  const [q, setQ] = useState('');

  // ✅ username은 항상 localStorage의 'username'에서 읽기
  const [nickname, setNickname] = useState(() => localStorage.getItem('username') || '');

  // ✅ user_id는 onair_user_id를 사용 (없으면 자동 생성)
  const [userId, setUserId] = useState(() => localStorage.getItem('onair_user_id') || '');

  const [result, setResult] = useState(null);
  const [challengeId, setChallengeId] = useState(null);

  // Spot
  const [spots, setSpots] = useState([]);
  const [finalAns, setFinalAns] = useState('');
  const [submitResult, setSubmitResult] = useState(null);

  // Quiz
  const [userQuizAnswers, setUserQuizAnswers] = useState({}); // { [question]: 'O'|'X' }
  const [quizGrade, setQuizGrade] = useState(null);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbMode, setLbMode] = useState('all');
  const [lbWindow, setLbWindow] = useState('30d');
  const [lbTop, setLbTop] = useState(10);

  // ── 초기화: userId 없으면 생성 저장, username 반영 ───────────────────
  useEffect(() => {
    // user_id 보장
    if (!userId) {
      const id = window.crypto?.randomUUID?.() || 'anon-' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('onair_user_id', id);
      setUserId(id);
    }
    // username 반영
    if (!nickname) {
      const uname = localStorage.getItem('username') || '';
      setNickname(uname);
    }

    // 다른 탭에서 username이 바뀌는 경우 대응(선택)
    const onStorage = (e) => {
      if (e.key === 'username') {
        setNickname(e.newValue || '');
      }
      if (e.key === 'onair_user_id') {
        setUserId(e.newValue || '');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAll = () => {
    setResult(null);
    setChallengeId(null);
    setSpots([]);
    setFinalAns('');
    setSubmitResult(null);
    setUserQuizAnswers({});
    setQuizGrade(null);
  };

  const switchMode = (m) => {
    setMode(m);
    resetAll();
  };

  // ── 생성 호출 ─────────────────────────────────────────
  const getChallenge = async () => {
    if (!q.trim()) {
      alert('질문/주제를 입력해주세요.');
      return;
    }
    try {
      resetAll();
      const url =
        mode === 'spot'
          ? '/api/literacy/challenge'
          : mode === 'compare'
          ? '/api/literacy/compare'
          : '/api/literacy/quiz';

      const res = await axios.post(`${API_BASE}${url}`, {
        question: q,
        topic: q, // 백엔드에서 둘 다 허용
      });
      setResult(res.data);
      setChallengeId(res.data.challenge_id || null);
    } catch (err) {
      console.error(err);
      alert('요청 중 오류가 발생했습니다.');
    }
  };

  // ── 제출/채점 ─────────────────────────────────────────
  const submit = async () => {
    if (mode === 'spot') {
      try {
        const res = await axios.post(`${API_BASE}/api/literacy/submit`, {
          challenge_id: challengeId,
          question: q,
          user_spots: spots,
          final_answer: finalAns,
          user_id: userId,
          nickname: nickname, // ← username을 그대로 전송
        });
        setSubmitResult(res.data);
      } catch (err) {
        console.error(err);
        alert('채점 중 오류가 발생했습니다.');
      }
    } else if (mode === 'quiz') {
      if (!result?.items?.length) {
        alert('채점할 문제가 없습니다.');
        return;
      }
      const answers = result.items.map((it) => ({
        question: it.question,
        true_answer: it.answer,
        answer: userQuizAnswers[it.question] || '',
      }));
      try {
        const res = await axios.post(`${API_BASE}/api/literacy/quiz-grade`, {
          answers,
          user_id: userId,
          nickname: nickname, // ← username을 그대로 전송
          topic: q,
        });
        setQuizGrade(res.data);
      } catch (err) {
        console.error(err);
        alert('채점 중 오류가 발생했습니다.');
      }
    } else {
      alert('비교 모드는 결과 비교만 가능합니다.');
    }
  };

  // ── 리더보드 ─────────────────────────────────────────
  const fetchLeaderboard = async () => {
    try {
      const params = new URLSearchParams({
        mode: lbMode,
        window: lbWindow,
        top: String(lbTop),
      });
      const res = await axios.get(`${API_BASE}/api/literacy/leaderboard?${params.toString()}`);
      setLeaderboard(res.data.items || []);
    } catch (err) {
      console.error(err);
      alert('리더보드 조회 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchLeaderboard().catch(() => {});
  }, []);

  // ── 하이라이트 렌더 ──────────────────────────────────
  const highlightText = (text = '', keywords = []) => {
    if (!keywords || keywords.length === 0) return text;
    const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = text.split(re);
    return parts.map((part, i) =>
      escaped.some(k => new RegExp(`^${k}$`, 'i').test(part))
        ? <mark key={i} className="bg-yellow-200 px-1">{part}</mark>
        : part
    );
  };

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold">🧠 AI 리터러시 체험실</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="mr-3">사용자: <b>{nickname || '사용자명 없음'}</b></span>
            <span className="opacity-60">ID: {userId || '...'}</span>
          </div>
        </header>

        <div className="flex gap-3 mb-3">
          {['spot', 'compare', 'quiz'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-2 rounded ${mode === m ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            >
              {m === 'spot' ? 'Spot the Lie' : m === 'compare' ? 'Model Compare' : 'OX 퀴즈'}
            </button>
          ))}
        </div>

        <textarea
          className="w-full border p-3 rounded mb-3"
          rows={3}
          placeholder={mode === 'quiz' ? '퀴즈 주제를 입력하세요' : '질문을 입력하세요'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-5 py-2 rounded" onClick={getChallenge}>
          {mode === 'quiz' ? 'OX 퀴즈 생성' : '응답 생성'}
        </button>

        {/* Spot */}
        {mode === 'spot' && result?.ai_answer && (
          <section className="mt-6 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">AI 답변 (오류 포함)</h2>
            <p className="whitespace-pre-line">
              {highlightText(result.ai_answer, result.highlight_tokens || [])}
            </p>
            {result.hints?.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">힌트: {result.hints.join(' / ')}</p>
            )}

            <div className="mt-4">
              <h3 className="font-semibold mb-2">틀린 부분 표시 + 이유</h3>
              <SpotForm onAdd={(s) => setSpots((prev) => [...prev, s])} />
              {spots.length > 0 && (
                <ul className="mt-2 list-disc ml-5 text-sm">
                  {spots.map((s, i) => (
                    <li key={i}>
                      <b>{s.text}</b> — {s.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">정정/최종 답변</h3>
              <textarea
                className="w-full border p-3 rounded"
                rows={3}
                placeholder="정확한 답을 작성해 보세요"
                value={finalAns}
                onChange={(e) => setFinalAns(e.target.value)}
              />
            </div>

            <button className="mt-4 bg-emerald-600 text-white px-5 py-2 rounded" onClick={submit}>
              제출
            </button>

            {submitResult && (
              <div className="mt-6 bg-gray-50 p-3 rounded border">
                <h4 className="font-semibold mb-1">채점 결과</h4>
                <p className="mb-1">
                  정답 여부: <b className={submitResult.correct ? 'text-green-600' : 'text-red-500'}>
                    {submitResult.correct ? '정답' : '오답'}
                  </b>
                </p>
                <p className="mb-1">오류표시 점수: {submitResult.score.spot} / 100</p>
                <p className="mb-1">최종답 유사도: {submitResult.score.similarity} / 100</p>
                <p className="text-sm text-gray-600 mt-2">
                  실제 오류: {submitResult.feedback.true_errors?.join(', ') || '없음'}
                </p>
                <p className="text-sm text-gray-600">
                  내가 맞춘 표시: {submitResult.feedback.matched_spots?.join(', ') || '없음'}
                </p>
                {typeof submitResult.score.final === 'number' && (
                  <p className="text-sm mt-1">종합 점수: <b>{submitResult.score.final}</b></p>
                )}
              </div>
            )}
          </section>
        )}

        {/* Compare */}
        {mode === 'compare' && result?.modelA && (
          <section className="mt-6 grid md:grid-cols-2 gap-4">
            <ModelCard title={result.modelA.name} text={result.modelA.answer} />
            <ModelCard title={result.modelB.name} text={result.modelB.answer} />
          </section>
        )}

        {/* Quiz */}
        {mode === 'quiz' && (
          <section>
            {result && Array.isArray(result.items) && result.items.length === 0 && (
              <p className="text-sm text-red-600">퀴즈 항목이 비어있습니다. 주제를 변경해보세요.</p>
            )}

            {result && Array.isArray(result.items) && result.items.length > 0 && (
              <div className="mt-6 bg-white p-4 rounded shadow">
            	<h3 className="font-semibold mb-3">📘 OX 퀴즈</h3>
                <ul className="space-y-4">
                  {result.items.map((it, idx) => (
                    <li key={idx}>
                      <p className="mb-2">{idx + 1}. {it.question}</p>
                      <div className="flex gap-2">
                        <button
                          className={`px-4 py-1 rounded ${
                            userQuizAnswers[it.question] === 'O' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                          }`}
                          onClick={() => setUserQuizAnswers((prev) => ({ ...prev, [it.question]: 'O' }))}
                        >
                          ⭕ O
                        </button>
                        <button
                          className={`px-4 py-1 rounded ${
                            userQuizAnswers[it.question] === 'X' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                          }`}
                          onClick={() => setUserQuizAnswers((prev) => ({ ...prev, [it.question]: 'X' }))}
                        >
                          ❌ X
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <button className="mt-6 bg-indigo-600 text-white px-5 py-2 rounded" onClick={submit}>
                  채점하기
                </button>
              </div>
            )}

            {quizGrade && (
              <div className="mt-6 bg-gray-50 p-3 rounded border">
                <h4 className="font-semibold mb-2">✅ 퀴즈 채점 결과</h4>
                <p className="mb-2">맞춘 개수: {quizGrade.correct} / {quizGrade.total}</p>
                <ul className="list-disc ml-5 text-sm mt-2">
                  {quizGrade.results?.map((r, i) => (
                    <li key={i}>
                      {r.question} → 내 답: <b>{r.user_answer || '-'}</b>{' '}
                      {r.correct ? (
                        <span className="text-green-600">(정답)</span>
                      ) : (
                        <span className="text-red-500">(오답, 정답: {r.true_answer || '-'})</span>
                      )}
                    </li>
                  ))}
                </ul>
                {typeof quizGrade.score === 'number' && (
                  <p className="text-sm mt-2">점수: <b>{quizGrade.score}</b></p>
                )}
              </div>
            )}
          </section>
        )}

        {/* Leaderboard */}
        <section className="mt-8 bg-white p-4 rounded shadow">
          <div className="flex flex-wrap items-end gap-3">
            <h3 className="font-semibold mr-auto">🏆 리더보드</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm">모드</label>
              <select className="border rounded px-2 py-1" value={lbMode} onChange={(e) => setLbMode(e.target.value)}>
                <option value="all">전체</option>
                <option value="spot">Spot</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">기간</label>
              <select className="border rounded px-2 py-1" value={lbWindow} onChange={(e) => setLbWindow(e.target.value)}>
                <option value="7d">7일</option>
                <option value="30d">30일</option>
                <option value="all">전체</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Top</label>
              <input
                type="number"
                min={1}
                className="border rounded px-2 py-1 w-20"
                value={lbTop}
                onChange={(e) => setLbTop(Number(e.target.value || 10))}
              />
            </div>
            <button className="bg-gray-800 text-white px-3 py-1 rounded" onClick={fetchLeaderboard}>
              새로고침
            </button>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-sm text-gray-500 mt-3">아직 랭킹 데이터가 없어요.</p>
          ) : (
            <ol className="mt-3">
              {leaderboard.map((r, i) => (
                <li key={i} className="flex justify-between border-b py-1">
                  <span>{i + 1}. {r.display_name || r.user_id}</span>
                  <span>
                    {r.avg_score}점 <span className="text-gray-400 text-xs">({r.plays}회)</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
};

const SpotForm = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [reason, setReason] = useState('');
  return (
    <div className="flex gap-2 items-center">
      <input
        className="border p-2 rounded flex-1"
        placeholder="틀린 부분 텍스트"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        className="border p-2 rounded flex-1"
        placeholder="왜 틀렸나요?"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button
        className="bg-gray-800 text-white px-3 py-2 rounded"
        onClick={() => {
          if (text && reason) {
            onAdd({ text, reason });
            setText('');
            setReason('');
          }
        }}
      >
        추가
      </button>
    </div>
  );
};

const ModelCard = ({ title, text }) => (
  <div className="bg-white p-4 rounded shadow">
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="whitespace-pre-line">{text}</p>
  </div>
);

export default LiteracyLab;
