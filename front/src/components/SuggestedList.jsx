import React from 'react';

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.setAttribute('readonly', '');
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
};

const defaultPick = async (q) => {
  const ok = await copyToClipboard(q);
  if (ok) alert('복사했어요. 채팅 페이지에서 붙여넣어 질문하세요!');
  else window.location.href = `/chat?prefill=${encodeURIComponent(q)}`;
};

const SuggestedList = ({ title, items = [], variant = 'light', onPick }) => {
  if (!items || items.length === 0) return null;
  const isLight = variant === 'light';

  const shellCls = isLight
    ? 'bg-white border border-slate-200'
    : 'bg-white/5 border border-white/10 backdrop-blur';
  const headingCls = isLight ? 'text-slate-800' : 'text-slate-200';
  const itemBorder = isLight ? 'border-slate-200' : 'border-white/10';
  const itemText = isLight ? 'text-slate-700' : 'text-slate-200/90';
  const linkCls = isLight
    ? 'text-blue-600 hover:underline'
    : 'text-sky-300 hover:underline';

  return (
    <div className="mt-8 max-w-3xl mx-auto">
      <h3 className={`text-sm font-semibold mb-3 ${headingCls}`}>{title}</h3>
      <ul className={`rounded shadow p-5 space-y-2 ${shellCls}`}>
        {items.map((q, i) => (
          <li
            key={i}
            className={`flex justify-between items-start gap-3 border-b last:border-none pb-2 ${itemBorder}`}
          >
            <span className={itemText}>{q}</span>
            <button
              className={`${linkCls} text-sm`}
              onClick={() => (onPick ? onPick(q) : defaultPick(q))}
            >
              질문에 넣기
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestedList;
