import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState(localStorage.getItem('username') || '')
  const [school, setSchool] = useState(localStorage.getItem('school') || '')
  const [grade, setGrade] = useState(localStorage.getItem('grade') || '')
  const [klass, setKlass] = useState(localStorage.getItem('class') || '')

  const handleLogin = () => {
    if (!username.trim()) return alert('이름을 입력해주세요')
    localStorage.setItem('username', username.trim())
    localStorage.setItem('school', school.trim())
    localStorage.setItem('grade', grade.trim())
    localStorage.setItem('class', klass.trim())
    navigate('/chat')
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">로그인</h1>
        <input className="border p-2 rounded w-full mb-2" placeholder="이름"
          value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="border p-2 rounded w-full mb-2" placeholder="학교"
          value={school} onChange={e=>setSchool(e.target.value)} />
        <div className="flex gap-2">
          <input className="border p-2 rounded w-1/2" placeholder="학년"
            value={grade} onChange={e=>setGrade(e.target.value)} />
          <input className="border p-2 rounded w-1/2" placeholder="반"
            value={klass} onChange={e=>setKlass(e.target.value)} />
        </div>
        <button className="mt-4 bg-blue-600 text-white w-full py-2 rounded" onClick={handleLogin}>
          시작하기
        </button>
      </div>
    </div>
  )
}
export default Login
