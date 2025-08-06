import React, { useState } from 'react'
import axios from 'axios'

const LiteracyLab = () => {
  const [mode, setMode] = useState('spot') // 'spot' | 'compare'
  const [q, setQ] = useState('')
  const [result, setResult] = useState(null)          // challenge or compare 결과
  const [challengeId, setChallengeId] = useState(null)
  const [spots, setSpots] = useState([])              // [{text, reason}]
  const [finalAns, setFinalAns] = useState('')
  const [submitResult, setSubmitResult] = useState(null) // 채점 결과

  const getChallenge = async () => {
    setSubmitResult(null)
    const url = mode === 'spot' ? '/api/literacy/challenge' : '/api/literacy/compare'
    const res = await axios.post(`http://localhost:5000${url}`, { question: q })
    setResult(res.data)
    setChallengeId(res.data.challenge_id || null)
  }

  const submit = async () => {
    if (mode === 'spot') {
      const res = await axios.post('http://localhost:5000/api/literacy/submit', {
        challenge_id: challengeId,
        mode,
        question: q,
        ai_answer: result?.ai_answer,
        user_spots: spots,
        final_answer: finalAns,
      })
      setSubmitResult(res.data)
    } else {
      // compare 모드는 별도 채점 없이 표시만
      setSubmitResult(null)
      alert('비교 모드는 현재 채점 없이 결과만 표시합니다.')
    }
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">🧠 AI 리터러시 체험실</h1>

        <div className="flex gap-3 mb-3">
          <button onClick={() => setMode('spot')}
            className={`px-4 py-2 rounded ${mode==='spot'?'bg-blue-600 text-white':'bg-white border'}`}>
            Spot the Lie
          </button>
          <button onClick={() => setMode('compare')}
            className={`px-4 py-2 rounded ${mode==='compare'?'bg-blue-600 text-white':'bg-white border'}`}>
            Model Compare
          </button>
        </div>

        <textarea className="w-full border p-3 rounded mb-3" rows={3}
          placeholder="질문을 입력하세요" value={q} onChange={e=>setQ(e.target.value)} />
        <button className="bg-blue-500 text-white px-5 py-2 rounded" onClick={getChallenge}>생성하기</button>

        {mode==='spot' && result?.ai_answer && (
          <div className="mt-6 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">AI 답변 (일부 오류 포함)</h2>
            <p className="whitespace-pre-line">{result.ai_answer}</p>
            {result.hints?.length>0 && (
              <div className="mt-3 text-sm text-gray-600">힌트: {result.hints.join(' / ')}</div>
            )}

            <div className="mt-4">
              <h3 className="font-semibold mb-2">틀린 부분 표시 + 이유</h3>
              <SpotForm onAdd={(s)=>setSpots([...spots, s])} />
              {spots.length>0 && (
                <ul className="mt-2 list-disc ml-5 text-sm">
                  {spots.map((s,i)=><li key={i}><b>{s.text}</b> — {s.reason}</li>)}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">정정/최종 답변</h3>
              <textarea className="w-full border p-3 rounded" rows={3}
                placeholder="정확한 답을 작성해 보세요" value={finalAns} onChange={e=>setFinalAns(e.target.value)} />
            </div>

            <button className="mt-4 bg-emerald-600 text-white px-5 py-2 rounded" onClick={submit}>제출</button>
          </div>
        )}

        {submitResult && (
          <div className="mt-6 bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">채점 결과</h3>
            <p className="mb-1">정답 여부: <b>{submitResult.correct ? '정답' : '오답'}</b></p>
            <p className="mb-1">오류표시 점수: {submitResult.score.spot} / 100</p>
            <p className="mb-1">최종답 유사도: {submitResult.score.similarity} / 100</p>
            <p className="text-sm text-gray-600 mt-2">
              실제 오류 토큰: {submitResult.feedback.true_errors?.join(', ') || '없음'}
            </p>
            <p className="text-sm text-gray-600">
              내가 맞춘 표시: {submitResult.feedback.matched_spots?.join(', ') || '없음'}
            </p>
          </div>
        )}

        {mode==='compare' && result?.modelA && (
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <ModelCard title={result.modelA.name} text={result.modelA.answer} />
            <ModelCard title={result.modelB.name} text={result.modelB.answer} />
          </div>
        )}
      </div>
    </div>
  )
}

const SpotForm = ({ onAdd }) => {
  const [text, setText] = useState('')
  const [reason, setReason] = useState('')
  return (
    <div className="flex gap-2 items-center">
      <input className="border p-2 rounded flex-1" placeholder="틀린 부분 텍스트"
        value={text} onChange={e=>setText(e.target.value)} />
      <input className="border p-2 rounded flex-1" placeholder="왜 틀렸나요?"
        value={reason} onChange={e=>setReason(e.target.value)} />
      <button className="bg-gray-800 text-white px-3 py-2 rounded"
        onClick={()=>{ if(text&&reason) onAdd({text, reason}); }}>추가</button>
    </div>
  )
}

const ModelCard = ({ title, text }) => (
  <div className="bg-white p-4 rounded shadow">
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="whitespace-pre-line">{text}</p>
  </div>
)

export default LiteracyLab
