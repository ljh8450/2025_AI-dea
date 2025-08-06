import React, { useState, useEffect, useCallback } from 'react'
import QueryInput from '../components/QueryInput'
import AIResponse from '../components/AIResponse'
import TrendList from '../components/TrendList'
import SimilarList from '../components/SimilarList'
import SuggestedList from '../components/SuggestedList'
import TrendScopeSelector from '../components/TrendScopeSelector'
import Header from '../components/Header'
import axios from 'axios'

const Main = () => {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [trend, setTrend] = useState([])
  const [similar, setSimilar] = useState([])
  const [nextSuggestions, setNextSuggestions] = useState([])
  const [categorySuggestions, setCategorySuggestions] = useState([])
  const [scope, setScope] = useState({ level: 'all' })

  const handleSubmit = async () => {
    try {
      const meta = {
        school: localStorage.getItem('school') || '',
        grade:  localStorage.getItem('grade') || '',
        class:  localStorage.getItem('class') || '',
      }
      const res = await axios.post('http://localhost:5000/api/query', { message: input, ...meta })
      setResponse(res.data.answer)
      setSimilar(res.data.similar_questions || [])
      const nx = await axios.post('http://localhost:5000/api/recommend/next', { message: input })
      setNextSuggestions(nx.data.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handlePickSuggestion = (q) => {
    setInput(q)
  }

  const handleSelectCategory = async (cat) => {
    try {
      const res = await axios.get('http://localhost:5000/api/recommend/by-category', { params: { category: cat } })
      setCategorySuggestions(res.data.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTrends = useCallback(async (sc = scope) => {
    const school = localStorage.getItem('school') || ''
    const grade  = localStorage.getItem('grade') || ''
    const klass  = localStorage.getItem('class') || ''
    const params = new URLSearchParams()
    if (sc.level === 'school') params.set('school', school)
    if (sc.level === 'grade')  { params.set('school', school); params.set('grade', grade) }
    if (sc.level === 'class')  { params.set('school', school); params.set('grade', grade); params.set('class', klass) }

    const res = await axios.get(`http://localhost:5000/api/trends?${params.toString()}`)
    setTrend(res.data.topics || [])
  }, [scope])

  useEffect(() => { fetchTrends() }, [fetchTrends])
  useEffect(() => { fetchTrends(scope) }, [scope, fetchTrends])

  return (
    <div className="min-h-screen bg-blue-50 pb-14">
      <Header />
      <div className="p-6 max-w-3xl mx-auto">
        <QueryInput input={input} setInput={setInput} onSubmit={handleSubmit} />
        <AIResponse response={response} />
        <SimilarList items={similar} />
        <SuggestedList title="➡️ 다음에 이렇게 물어보면 좋아요" items={nextSuggestions} onPick={handlePickSuggestion} />
      </div>
      <div className="p-6 max-w-3xl mx-auto bg-red-50 pb-14 border border-gray-200">
        <TrendScopeSelector scope={scope} setScope={setScope} />
        <TrendList trend={trend} onSelectCategory={handleSelectCategory} />
        <SuggestedList title="📚 선택한 카테고리의 추천 질문" items={categorySuggestions} onPick={handlePickSuggestion} />
      </div>
    </div>
  )
}
export default Main
