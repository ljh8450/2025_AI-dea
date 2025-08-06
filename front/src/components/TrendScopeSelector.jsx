import React from 'react'

const TrendScopeSelector = ({ scope, setScope }) => {
  return (
    <div className="max-w-2xl mx-auto mt-6 bg-white p-4 rounded shadow flex gap-2 items-center">
      <span className="text-sm text-gray-700">트렌드 범위:</span>
      <button className={`px-3 py-1 rounded ${scope.level==='all'?'bg-blue-600 text-white':'border'}`}
        onClick={()=>setScope({ level: 'all' })}>전체</button>
      <button className={`px-3 py-1 rounded ${scope.level==='school'?'bg-blue-600 text-white':'border'}`}
        onClick={()=>setScope({ level: 'school' })}>학교</button>
      <button className={`px-3 py-1 rounded ${scope.level==='grade'?'bg-blue-600 text-white':'border'}`}
        onClick={()=>setScope({ level: 'grade' })}>학년</button>
      <button className={`px-3 py-1 rounded ${scope.level==='class'?'bg-blue-600 text-white':'border'}`}
        onClick={()=>setScope({ level: 'class' })}>반</button>
    </div>
  )
}
export default TrendScopeSelector
