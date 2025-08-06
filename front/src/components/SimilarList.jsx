import React from 'react'

const SimilarList = ({ items = [] }) => {
  if (!items || items.length === 0) return null
  return (
    <div className="mt-6 max-w-2xl mx-auto text-center">
      <h3 className="text-md font-semibold text-gray-800 mb-3">💬 이런 질문도 있었어요</h3>
      <ul className="bg-white shadow rounded p-5 space-y-2 text-left">
        {items.map((q, i) => (
          <li key={i} className="text-gray-700 border-b last:border-none pb-1">{q}</li>
        ))}
      </ul>
    </div>
  )
}

export default SimilarList
