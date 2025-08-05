import React from 'react';

const QueryInput = ({ input, setInput, onSubmit }) => {
  return (
    <div className="mt-6 flex flex-col items-center justify-center text-center w-full">
      <textarea
        className="w-full max-w-2xl border border-gray-300 p-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
        rows={4}
        placeholder="🤖 AI에게 질문하거나 관심사를 입력해보세요!"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
        onClick={onSubmit}
      >
        🚀 질문하기
      </button>
    </div>
  );
};

export default QueryInput;