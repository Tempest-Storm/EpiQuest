import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API } from '../config'
import { computeScore, MAX_TIME } from '../lib/score'

// Safely decode the payload of a JWT without verifying its signature.
// Returns null for anything malformed so callers can redirect to login
// instead of crashing the whole page.
function decodeToken(t) {
  try {
    return JSON.parse(atob(t.split('.')[1]))
  } catch {
    return null
  }
}

export default function Quiz() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // The token may arrive in the URL (fresh login) or already be in
  // localStorage (returning player). Resolve it and the decoded user once,
  // synchronously, on first render.
  const [token] = useState(() => searchParams.get('token') || localStorage.getItem('token'))
  const [user] = useState(() => (token ? decodeToken(token) : null))

  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(MAX_TIME)
  const [answered, setAnswered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Persist the session for returning players, or bounce to login if there
  // is no valid token.
  useEffect(() => {
    if (!user) {
      localStorage.removeItem('token')
      navigate('/')
      return
    }
    localStorage.setItem('token', token)
    localStorage.setItem('player', JSON.stringify({ pseudo: user.name, avatar: user.avatar_url }))
  }, [user, token, navigate])

  // Load the questions once the player is authenticated.
  useEffect(() => {
    if (!user) return
    fetch(`${API}/questions`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Unexpected response')
        setQuestions(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load questions:', err)
        setError(true)
        setLoading(false)
      })
  }, [user])

  const handleNext = useCallback((currentScore, currentCorrect) => {
    const finalScore = currentScore ?? score
    const finalCorrect = currentCorrect ?? correct
    if (current + 1 >= questions.length) {
      // Store the local recap first so the player always sees their result,
      // even if persisting the score to the server fails.
      localStorage.setItem('result', JSON.stringify({
        pseudo: user?.name,
        avatar: user?.avatar_url,
        score: finalScore,
        correct: finalCorrect,
        total: questions.length
      }))
      fetch(`${API}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ score: finalScore, correct: finalCorrect })
      })
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`) })
        .catch(err => console.error('Failed to save score:', err))
        .finally(() => navigate('/leaderboard'))
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
      setTimeLeft(MAX_TIME)
    }
  }, [score, correct, current, questions, user, token, navigate])

  const handleSelect = (i) => {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    const isCorrect = i === questions[current].answer
    let newScore = score
    let newCorrect = correct
    if (isCorrect) {
      newScore = score + computeScore(timeLeft)
      newCorrect = correct + 1
      setScore(newScore)
      setCorrect(newCorrect)
    }
    setTimeout(() => handleNext(newScore, newCorrect), 1000)
  }

  useEffect(() => {
    if (answered || loading || questions.length === 0 || timeLeft <= 0) return
    // On each tick, either count down or — when the last second elapses —
    // advance to the next question. Doing both inside the timer callback
    // keeps the state updates out of the effect body.
    const t = setTimeout(() => {
      if (timeLeft <= 1) handleNext()
      else setTimeLeft(v => v - 1)
    }, 1000)
    return () => clearTimeout(t)
  }, [timeLeft, answered, loading, questions, handleNext])

  if (loading) return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center">
      <p className="text-gray-400 text-sm">Chargement des questions...</p>
    </div>
  )

  if (error || questions.length === 0) return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-xl flex flex-col gap-4">
        <p className="text-gray-600 text-sm">
          Impossible de charger le quiz pour le moment. Réessaie un peu plus tard.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-2xl text-sm"
        >
          Retour à l'accueil
        </button>
      </div>
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