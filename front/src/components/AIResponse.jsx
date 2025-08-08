// front/src/components/AIResponse.jsx
import React from 'react';

const AIResponse = ({ response, variant = 'light', title = '💡 AI의 응답' }) => {
  if (!response) return null;
  const isLight = variant === 'light';

  return (
    <div className="mt-8 max-w-3xl mx-auto">
      <div
        className={[
          'border-l-4 rounded shadow p-6',
          isLight
            ? 'bg-white border-blue-500'
            : 'bg-white/5 border-sky-400/80 backdrop-blur'
        ].join(' ')}
      >
        <h2 className={['text-lg font-bold mb-2',
          isLight ? 'text-blue-700' : 'text-sky-300'
        ].join(' ')}>
          {title}
        </h2>
        <p className={isLight ? 'text-slate-800' : 'text-slate-200'} style={{ whiteSpace: 'pre-line' }}>
          {response}
        </p>
      </div>
    </div>
  );
};

export default AIResponse;
