import React from 'react';

const AIResponse = ({ response }) => {
  if (!response) return null;

  return (
    <div className="mt-8 bg-white border-l-4 border-blue-500 p-6 shadow rounded max-w-2xl mx-auto text-center">
      <h2 className="text-lg font-bold mb-2 text-blue-700">💡 AI의 응답</h2>
      <p className="text-gray-800 leading-relaxed whitespace-pre-line">{response}</p>
    </div>
  );
};

export default AIResponse;
