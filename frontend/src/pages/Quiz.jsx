import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API } from '../config'

export default function Quiz() {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [answered, setAnswered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('token', token)
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
      localStorage.setItem('player', JSON.stringify({ pseudo: payload.name, avatar: payload.avatar_url }))
    } else {
      const existing = localStorage.getItem('token')
      if (!existing) { navigate('/'); return }
      const payload = JSON.parse(atob(existing.split('.')[1]))
      setUser(payload)
    }
    fetch(`${API}/questions`)
      .then(r => r.json())
      .then(data => { setQuestions(data); setLoading(false) })
  }, [])

useEffect(() => {
    if (answered || loading || questions.length === 0) return
    if (timeLeft === 0) { handleNext(); return }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, answered, loading, questions])


  const handleSelect = (i) => {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    const isCorrect = i === questions[current].answer
    let newScore = score
    let newCorrect = correct
    if (isCorrect) {
      newScore = score + Math.ceil((timeLeft / 20) * 100) + 50
      newCorrect = correct + 1
      setScore(newScore)
      setCorrect(newCorrect)
    }
    setTimeout(() => handleNext(newScore, newCorrect), 1000)
  }

  const handleNext = (currentScore, currentCorrect) => {
    const finalScore = currentScore ?? score
    const finalCorrect = currentCorrect ?? correct
    if (current + 1 >= questions.length) {
      const token = localStorage.getItem('token')
      fetch(`${API}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ score: finalScore, correct: finalCorrect })
      }).then(() => {
        localStorage.setItem('result', JSON.stringify({
          pseudo: user?.name,
          avatar: user?.avatar_url,
          score: finalScore,
          total: questions.length
        }))
        navigate('/leaderboard')
      })
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
      setTimeLeft(20)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center">
      <p className="text-gray-400 text-sm">Chargement des questions...</p>
    </div>
  )

  const q = questions[current]
  const letters = ['A', 'B', 'C', 'D']

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl">

        {user && (
          <div className="bg-indigo-50 px-4 py-2 flex items-center gap-2 border-b border-indigo-100">
            <img src={user.avatar_url} className="w-6 h-6 rounded-full" alt="avatar" />
            <span className="text-xs font-medium text-indigo-700">{user.name}</span>
          </div>
        )}

        <div className="bg-[#1A1A2E] px-5 py-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/50 text-xs">Question {current + 1} / {questions.length}</span>
            <span className={`font-mono font-bold text-sm ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}s
            </span>
            <span className="text-purple-400 text-xs font-bold">{score} pts</span>
          </div>
          <div className="bg-white/10 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(current / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-800 font-medium text-sm leading-relaxed">{q.question}</p>
          </div>
          <div className="flex flex-col gap-2">
            {q.options.map((opt, i) => {
              let style = 'bg-white border-gray-200 text-gray-800'
              if (answered) {
                if (i === q.answer) style = 'bg-green-50 border-green-500 text-green-800'
                else if (i === selected) style = 'bg-red-50 border-red-400 text-red-800'
                else style = 'bg-white border-gray-100 text-gray-400'
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${style}`}
                >
                  <span className={[
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    answered && i === q.answer ? 'bg-green-500 text-white' :
                    answered && i === selected ? 'bg-red-400 text-white' :
                    'bg-gray-100 text-gray-500'
                  ].join(' ')}>
                    {letters[i]}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}