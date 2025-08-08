import React, { useState, useEffect, useCallback } from 'react'
import Header from '../components/Header'
import TrendScopeSelector from '../components/TrendScopeSelector'
import TrendList from '../components/TrendList'
import SuggestedList from '../components/SuggestedList'
import axios from 'axios'

const Trends = () => {
  const [scope, setScope] = useState({ level: 'all' })
  const [trend, setTrend] = useState([])
  const [trendLoading, setTrendLoading] = useState(false)
  const [trendError, setTrendError] = useState(null)
  const [categorySuggestions, setCategorySuggestions] = useState([])

  const fetchTrends = useCallback(async (sc = scope) => {
    try {
      setTrendLoading(true)
      setTrendError(null)

      const school = localStorage.getItem('school') || ''
      const grade  = localStorage.getItem('grade') || ''
      const klass  = localStorage.getItem('class') || ''

      const params = new URLSearchParams()
      if (sc.level === 'school') params.set('school', school)
      if (sc.level === 'grade')  { params.set('school', school); params.set('grade', grade) }
      if (sc.level === 'class')  { params.set('school', school); params.set('grade', grade); params.set('class', klass) }

      const res = await axios.get(`http://localhost:5000/api/trends?${params.toString()}`)
      setTrend(res.data.topics || [])
    } catch (err) {
      console.error(err)
      setTrendError('트렌드를 불러오지 못했어요.')
      setTrend([])
    } finally {
      setTrendLoading(false)
    }
  }, [scope])

  useEffect(() => { fetchTrends(scope) }, [scope, fetchTrends])

  const handleSelectCategory = async (cat) => {
    try {
      const res = await axios.get('http://localhost:5000/api/recommend/by-category', { params: { category: cat } })
      setCategorySuggestions(res.data.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handlePickSuggestion = (q) => {
    // 트렌드 페이지에서는 클릭 시 클립보드에 복사해 주거나, 토스트 띄워 주는 식으로 UX 처리 가능
    navigator.clipboard?.writeText(q).catch(()=>{})
    alert('복사했어요. 채팅 페이지에서 붙여넣어 질문하세요!')
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />
      <div className="p-6 max-w-3xl mx-auto bg-white border rounded">
        <div className="mb-4">
          <TrendScopeSelector scope={scope} setScope={setScope} />
        </div>

        {trendLoading && <p className="text-sm text-gray-600">불러오는 중…</p>}
        {trendError && <p className="text-sm text-red-600">{trendError}</p>}

        <TrendList trend={trend} onSelectCategory={handleSelectCategory} />

        <SuggestedList
          title="📚 선택한 카테고리의 추천 질문"
          items={categorySuggestions}
          onPick={handlePickSuggestion}
        />
      </div>
    </div>
  )
}

export default Trends
