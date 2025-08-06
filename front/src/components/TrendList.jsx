import React from 'react'

const TrendList = ({ trend = [], onSelectCategory }) => {
  if (!trend) return null
  if (trend.length === 0) {
    return <p className="text-gray-500 text-center mt-4">😶 아직 충분한 관심사 데이터가 없어요.</p>
  }
  return (
    <div className="mt-10 max-w-2xl mx-auto text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🔥 이번 주 관심사 TOP 5</h2>
      <ul className="bg-white shadow rounded p-6 space-y-2 text-left">
        {trend.map((topic, idx) => (
          <li key={idx} className="flex justify-between items-center border-b last:border-none pb-1">
            <span className="text-gray-700 font-medium">{idx + 1}. {topic}</span>
            {onSelectCategory && (
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => onSelectCategory(topic)}
              >
                이 카테고리로 추천받기
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TrendList
