import React from 'react'

const SuggestedList = ({ title, items = [], onPick }) => {
  if (!items || items.length === 0) return null
  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <h3 className="text-md font-semibold text-gray-800 mb-3">{title}</h3>
      <ul className="bg-white shadow rounded p-5 space-y-2">
        {items.map((q, i) => (
          <li key={i} className="flex justify-between items-start gap-3 border-b last:border-none pb-2">
            <span className="text-gray-700">{q}</span>
            {onPick && (
              <button
                className="text-blue-600 text-sm hover:underline"
                onClick={() => onPick(q)}
              >
                질문에 넣기
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SuggestedList
