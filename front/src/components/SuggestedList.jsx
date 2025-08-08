import React from 'react'

const copyToClipboard = async (text) => {
  try {
    // 최신 API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // 무시하고 폴백 시도
  }
  // 폴백: textarea 방식
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
  } catch (e) {
    return false;
  }
};

const handlePickSuggestion = async (q) => {
  const ok = await copyToClipboard(q);
  if (ok) {
    alert('복사했어요. 채팅 페이지에서 붙여넣어 질문하세요!');
  } else {
    // 복사가 안되면 채팅 페이지로 이동하며 입력 프리필
    window.location.href = `/chat?prefill=${encodeURIComponent(q)}`;
  }
};

const SuggestedList = ({ title, items = [] }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <h3 className="text-md font-semibold text-gray-800 mb-3">{title}</h3>
      <ul className="bg-white shadow rounded p-5 space-y-2">
        {items.map((q, i) => (
          <li
            key={i}
            className="flex justify-between items-start gap-3 border-b last:border-none pb-2"
          >
            <span className="text-gray-700">{q}</span>
            <button
              className="text-blue-600 text-sm hover:underline"
              onClick={() => handlePickSuggestion(q)}
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
