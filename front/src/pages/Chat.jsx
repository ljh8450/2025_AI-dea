import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header';
import QueryInput from '../components/QueryInput';
import ChatHistory from '../components/ChatHistory';
import SimilarList from '../components/SimilarList';
import SuggestedList from '../components/SuggestedList';
import ChatListSidebar from '../components/ChatListSidebar';
import ThemeDock from '../components/ThemeDock';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';
const DEBUG = true;

// ── 디버그 로거 ───────────────────────────────────────
const logApi = {
  req(ep, payload) {
    if (!DEBUG) return;
    console.groupCollapsed(`[API:REQ] ${ep} @ ${new Date().toISOString()}`);
    if (payload) console.log('payload:', payload);
    console.groupEnd();
  },
  res(ep, res) {
    if (!DEBUG) return;
    console.groupCollapsed(`[API:RES] ${ep} status=${res?.status}`);
    if (res) {
      console.log('status:', res.status);
      console.log('data:', res.data);
      console.log('headers:', res.headers);
      console.log('config:', res.config);
    }
    console.groupEnd();
  },
  err(ep, err) {
    console.groupCollapsed(`[API:ERR] ${ep}`);
    if (err?.response) {
      console.error('status:', err.response.status);
      console.error('data:', err.response.data);
      console.error('headers:', err.response.headers);
    } else {
      console.error('message:', err?.message);
    }
    console.error('config:', err?.config);
    console.error('stack:', err?.stack);
    console.groupEnd();
  }
};

// ── 에러 텍스트 마스킹 규칙 ──────────────────────────
const isApiErrorText = (text = '') => {
  const t = String(text).toLowerCase();
  return (
    t.includes('invalid_api_key') ||
    t.includes('incorrect api key') ||
    t.includes('you can find your api key') ||
    t.includes('error code: 401') ||
    t.includes('api 응답 생성 중 오류')
  );
};

const friendlyAnswer = () =>
  '⚠️ API 오류가 발생했습니다. 브라우저 콘솔을 확인해 주세요. 고친 뒤 아래 “다시 시도”를 눌러 동일 질문을 재전송할 수 있어요.';

// ── 메시지로 제목 만들기 ─────────────────────────────
const titleFromMessage = (msg) => {
  const s = (msg || '').trim().replace(/\s+/g, ' ');
  if (!s) return '새 채팅';
  const split = s.split(/(?<=[.?!])\s|\n/);
  const firstSentence = split[0] || s;
  const title = firstSentence.slice(0, 24);
  return title || '새 채팅';
};

// ── 삭제 확인 모달 ────────────────────────────────────
const ConfirmDialog = ({ open, title, message, confirmText = '예, 삭제', cancelText = '취소', onConfirm, onCancel, dark=false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className={`relative z-50 w-full max-w-md rounded-xl shadow-lg p-5 ${dark ? 'bg-slate-900 text-white border border-white/10' : 'bg-white text-slate-900'}`}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className={`text-sm mb-4 whitespace-pre-line ${dark ? 'text-slate-200' : 'text-gray-700'}`}>{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className={`px-4 py-2 rounded border ${dark ? 'border-white/20 hover:bg-white/5' : 'hover:bg-gray-50'}`}>{cancelText}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

// ── 메인 컴포넌트 ─────────────────────────────────────
const Chat = ({ variant = 'light', toggleVariant }) => {
  const isLight = variant === 'light';

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [nextSuggestions, setNextSuggestions] = useState([]);

  // ✅ 제안 스위치 (로컬 스토리지 기억)
  const [suggestEnabled, setSuggestEnabled] = useState(() => {
    const v = localStorage.getItem('ui:suggest');
    return v === null ? true : v === '1';
  });
  useEffect(() => {
    localStorage.setItem('ui:suggest', suggestEnabled ? '1' : '0');
  }, [suggestEnabled]);

  const [chats, setChats] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [lastFailedMsg, setLastFailedMsg] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // {chatId, title}

  const [sp] = useSearchParams();
  const bottomRef = useRef(null);

  // ── 세션 목록 로드 ──────────────────────────────────
  const loadChats = useCallback(async () => {
    try {
      logApi.req('/api/chat/list');
      const res = await axios.get(`${API_BASE}/api/chat/list`);
      logApi.res('/api/chat/list', res);
      const arr = res?.data?.chats || [];
      setChats(arr);
      if (!selectedId && arr.length > 0) setSelectedId(arr[0].chat_id);
      return arr;
    } catch (e) {
      logApi.err('/api/chat/list', e);
      return [];
    }
  }, [selectedId]);

  // ── 특정 세션 히스토리 로드 ────────────────────────
  const loadHistory = useCallback(async (chatId) => {
    if (!chatId) return;
    try {
      logApi.req('/api/chat/history', { chat_id: chatId });
      const res = await axios.get(`${API_BASE}/api/chat/history`, { params: { chat_id: chatId } });
      logApi.res('/api/chat/history', res);
      setMessages(Array.isArray(res?.data?.messages) ? res.data.messages : []);
      // 새 세션 로드시 제안 블록은 초기화
      setSimilar([]);
      setNextSuggestions([]);
    } catch (e) {
      logApi.err('/api/chat/history', e);
      setMessages([]);
    }
  }, []);

  // ── 새 채팅 생성 (재사용) ───────────────────────────
  const createChat = useCallback(async (title) => {
    logApi.req('/api/chat/create', { title });
    const res = await axios.post(`${API_BASE}/api/chat/create`, { title });
    logApi.res('/api/chat/create', res);
    const newId = res?.data?.chat_id;
    await loadChats();
    setSelectedId(newId);
    await loadHistory(newId);
    return newId;
  }, [loadChats, loadHistory]);

  const handleNewChat = async () => {
    const title = prompt('채팅방 제목을 입력하세요 (예: 오늘의 고민)');
    if (!title) return;
    try {
      await createChat(title);
      setInput('');
    } catch (e) {
      logApi.err('/api/chat/create', e);
      alert('채팅방 생성에 실패했어요. 콘솔을 확인해 주세요.');
    }
  };

  // ── 세션 선택 ───────────────────────────────────────
  const handleSelectChat = async (chatId) => {
    setSelectedId(chatId);
    await loadHistory(chatId);
    setInput('');
    setLastFailedMsg(null);
  };

  // ── 삭제: 모달 열기/실행 ────────────────────────────
  const handleAskDeleteChat = (chatId, title) => {
    setPendingDelete({ chatId, title });
    setConfirmOpen(true);
  };
  const handleDeleteChat = async () => {
    if (!pendingDelete?.chatId) return;
    try {
      logApi.req('/api/chat/delete', { chat_id: pendingDelete.chatId });
      const res = await axios.post(`${API_BASE}/api/chat/delete`, { chat_id: pendingDelete.chatId });
      logApi.res('/api/chat/delete', res);

      const arr = await loadChats();

      if (selectedId === pendingDelete.chatId) {
        const nextId = arr[0]?.chat_id || null;
        setSelectedId(nextId);
        if (nextId) await loadHistory(nextId);
        else setMessages([]);
      }
    } catch (e) {
      logApi.err('/api/chat/delete', e);
      alert('삭제에 실패했어요. 콘솔을 확인해 주세요.');
    } finally {
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  // ── 프리필 ─────────────────────────────────────────
  useEffect(() => {
    const pf = sp.get('prefill');
    if (pf) setInput(pf);
  }, [sp]);

  // ── 초기 로딩 ───────────────────────────────────────
  useEffect(() => { loadChats(); }, [loadChats]);
  useEffect(() => { if (selectedId) loadHistory(selectedId); }, [selectedId, loadHistory]);

  // ── 자동 스크롤 ────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 0);
    return () => clearTimeout(id);
  }, [messages]);

  // ── 전송 로직 (재시도에서도 재사용) ─────────────────
  const sendMessage = async (msg, chatIdParam) => {
    const chatIdToUse = chatIdParam || selectedId;
    const meta = {
      school: localStorage.getItem('school') || '',
      grade:  localStorage.getItem('grade') || '',
      class:  localStorage.getItem('class') || '',
    };

    try {
      const payload = { chat_id: chatIdToUse, message: msg, ...meta };
      logApi.req('/api/chat/send', payload);

      const res = await axios.post(`${API_BASE}/api/chat/send`, payload);
      logApi.res('/api/chat/send', res);

      if (!(res.status >= 200 && res.status < 300)) {
        throw new Error(`Non-2xx status: ${res.status}`);
      }

      const answer = res?.data?.answer ?? '';
      const msgs   = Array.isArray(res?.data?.messages) ? res.data.messages : [];
      const sims   = Array.isArray(res?.data?.similar_questions) ? res.data.similar_questions : [];

      if (isApiErrorText(answer)) {
        console.warn('[sanitize] 숨김 처리된 API 오류 응답:', answer);
        setMessages(prev => [...prev, { role: 'assistant', content: friendlyAnswer() }]);
        setLastFailedMsg(msg);
      } else {
        setMessages(msgs);
        setLastFailedMsg(null);
      }

      // ✅ 제안 스위치가 켜진 경우에만 표시/요청
      if (suggestEnabled) {
        setSimilar(sims || []);
        try {
          const nx = await axios.post(`${API_BASE}/api/recommend/next`, { message: msg });
          setNextSuggestions(Array.isArray(nx?.data?.items) ? nx.data.items : []);
        } catch (e) {
          logApi.err('/api/recommend/next', e);
        }
      } else {
        setSimilar([]);
        setNextSuggestions([]);
      }
    } catch (err) {
      logApi.err('/api/chat/send', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: friendlyAnswer() }
      ]);
      setLastFailedMsg(msg);
      // 에러 시에도 제안은 비움
      setSimilar([]);
      setNextSuggestions([]);
    }
  };

  // ── 입력창 전송 핸들러 ──────────────────────────────
  const handleSubmit = async () => {
    const msg = input.trim();
    if (!msg) return;

    let chatIdForSend = selectedId;

    if (!chatIdForSend) {
      try {
        const autoTitle = titleFromMessage(msg);
        chatIdForSend = await createChat(autoTitle);
      } catch (e) {
        logApi.err('/api/chat/create(auto)', e);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: '채팅방 자동 생성에 실패했어요. 콘솔을 확인해 주세요.' }
        ]);
        return;
      }
    }

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');

    await sendMessage(msg, chatIdForSend);
  };

  // ── 재시도 버튼 ────────────────────────────────────
  const handleRetry = async () => {
    if (!lastFailedMsg) return;

    let chatIdForSend = selectedId;
    if (!chatIdForSend) {
      try {
        const autoTitle = titleFromMessage(lastFailedMsg);
        chatIdForSend = await createChat(autoTitle);
      } catch (e) {
        logApi.err('/api/chat/create(auto:retry)', e);
        return;
      }
    }
    await sendMessage(lastFailedMsg, chatIdForSend);
  };

  return (
    <div className={`min-h-screen`}>
      {/* 테마 토글 */}
      <ThemeDock variant={variant} onToggle={toggleVariant} />

      <Header variant={variant} />

      <div className="flex h-[calc(100vh-64px)]">
        {/* 왼쪽 사이드바 */}
        <div
          className={`w-64 border-r backdrop-blur ${isLight ? 'bg-white/70 border-slate-200' : 'bg-white/5 border-white/10'}`}
          style={{ height: 'calc(100vh - 64px)', position: 'sticky', top: 64 }}
        >
          <ChatListSidebar
            chats={chats}
            selectedId={selectedId}
            onSelect={handleSelectChat}
            onNew={handleNewChat}
            onDelete={handleAskDeleteChat}
            variant={variant}
          />
        </div>

        {/* 오른쪽 채팅 영역 */}
        <div className="flex-1 flex flex-col h-full">
          {/* 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto">
            <div className="w-full max-w-3xl mx-auto px-4 py-4">
              <ChatHistory history={messages} variant={variant} />

              {/* ✅ 스위치가 켜졌을 때만 노출 */}
              {suggestEnabled && (
                <>
                  <SimilarList
                    items={similar}
                    variant={variant}
                    onPick={(q) => setInput(q)}
                  />
                  <SuggestedList
                    title="➡️ 다음에 이렇게 물어보면 좋아요"
                    items={nextSuggestions}
                    variant={variant}
                    onPick={(q) => setInput(q)}
                  />
                </>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* 입력바 */}
          <div className={`sticky bottom-0 z-20 border-t backdrop-blur ${isLight ? 'bg-blue-50/95 border-slate-200' : 'bg-slate-950/80 border-white/10'}`}>
            {/* 에러 배너(재시도) */}
            {lastFailedMsg && (
              <div className="max-w-3xl mx-auto px-4 pt-3">
                <div className={`mb-2 p-3 rounded border text-sm flex items-center justify-between ${
                  isLight ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-amber-400/40 bg-amber-500/10 text-amber-200'
                }`}>
                  <div>API 오류가 발생했습니다. 콘솔 확인 후 <b>다시 시도</b>를 눌러주세요.</div>
                  <div className="flex gap-2">
                    <button onClick={handleRetry} className="px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700">
                      다시 시도
                    </button>
                    <button onClick={() => setLastFailedMsg(null)} className={`px-3 py-1 rounded border ${isLight ? 'hover:bg-amber-100' : 'border-white/20 hover:bg-white/5'}`}>
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="max-w-3xl mx-auto px-4 py-3">
              <QueryInput
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                variant={variant}
                suggestEnabled={suggestEnabled}
                onToggleSuggest={() => setSuggestEnabled(v => !v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 모달 */}
      <ConfirmDialog
        open={confirmOpen}
        title="대화 삭제"
        message={`[${pendingDelete?.title || pendingDelete?.chatId}] 대화를 정말 삭제할까요?\n삭제 후에는 복구할 수 없습니다.`}
        confirmText="예, 삭제"
        cancelText="취소"
        onConfirm={handleDeleteChat}
        onCancel={() => { setConfirmOpen(false); setPendingDelete(null); }}
        dark={!isLight}
      />
    </div>
  );
};

export default Chat;
