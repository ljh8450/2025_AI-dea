import React from 'react';

const QueryInput = ({
  input,
  setInput,
  onSubmit,
  variant = 'light',
  suggestEnabled = true,
  onToggleSuggest,
}) => {
  const isLight = variant === 'light';

  const shell = isLight
    ? 'bg-white border-slate-300'
    : 'bg-white/5 border-white/15';
  const textCls = isLight ? 'text-slate-900' : 'text-white';
  const placeholder = isLight ? 'placeholder-slate-400' : 'placeholder-slate-400';
  const ringFocus = isLight ? 'focus:ring-blue-300' : 'focus:ring-sky-600';

  const btnCls = isLight
    ? 'bg-blue-600 hover:bg-blue-700 text-white'
    : 'bg-sky-500/90 hover:bg-sky-500 text-white';

  return (
    <div className="flex flex-col items-center w-full">
      <textarea
        className={`w-full max-w-3xl border p-4 rounded-lg shadow focus:outline-none ${ringFocus} ${shell} ${textCls} ${placeholder}`}
        rows={4}
        placeholder="🤖 AI에게 질문하거나 관심사를 입력해보세요!"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* 하단 행: 왼쪽 스위치 / 오른쪽 전송 버튼 */}
      <div className="mt-3 w-full max-w-3xl flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm select-none">
          <span className={isLight ? 'text-slate-700' : 'text-slate-200'}>
            제안 받기
          </span>
          <button
            type="button"
            aria-pressed={suggestEnabled}
            onClick={onToggleSuggest}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              suggestEnabled
                ? (isLight ? 'bg-blue-600' : 'bg-sky-500')
                : (isLight ? 'bg-slate-300' : 'bg-white/20')
            }`}
            title="유사/추천 질문 표시 여부"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                suggestEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>

        <button
          className={`px-6 py-2 rounded-full font-semibold shadow transition ${btnCls}`}
          onClick={onSubmit}
        >
          🚀 질문하기
        </button>
      </div>
    </div>
  );
};

export default QueryInput;
