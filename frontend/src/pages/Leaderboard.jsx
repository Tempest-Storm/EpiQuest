import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'

const API = 'http://localhost:3001'
const socket = io(API)

export default function Leaderboard() {
  const [scores, setScores] = useState([])
  const navigate = useNavigate()
  const result = JSON.parse(localStorage.getItem('result') || '{}')
  const player = JSON.parse(localStorage.getItem('player') || '{}')

  const fetchLeaderboard = () => {
    fetch(`${API}/leaderboard`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setScores(data)
      })
  }

  useEffect(() => {
    fetchLeaderboard()
    socket.on('leaderboard:update', fetchLeaderboard)
    return () => socket.off('leaderboard:update')
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl">

        <div className="bg-[#1A1A2E] px-6 py-5 text-center">
          <h1 className="text-white text-lg font-bold">Classement live</h1>
          <p className="text-white/30 text-xs mt-1">🟢 Mis à jour en temps réel</p>
        </div>

        {/* My score recap */}
        {result.pseudo && (
          <div className="bg-indigo-50 px-4 py-3 flex items-center gap-3 border-b border-indigo-100">
            {result.avatar && (
              <img src={result.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
            )}
            <div className="flex-1">
              <p className="text-xs font-semibold text-indigo-700">{result.pseudo}</p>
              <p className="text-xs text-indigo-400">{result.correct}/{result.total} correct</p>
            </div>
            <span className="text-indigo-600 font-bold text-sm">{result.score} pts</span>
          </div>
        )}

        <div className="p-4 flex flex-col gap-2">
          {scores.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-4">Aucun score encore...</p>
          )}
          {scores.map((p, i) => {
            const isMe = p.pseudo === player.pseudo
            return (
              <div key={i} className={`flex items-center gap-3 rounded-xl px-3 py-3 border-2
                ${i === 0 ? 'bg-yellow-50 border-yellow-300' :
                  i === 1 ? 'bg-gray-100 border-gray-200' :
                  i === 2 ? 'bg-orange-50 border-orange-200' :
                  isMe ? 'bg-indigo-50 border-indigo-500' :
                  'bg-white border-gray-100'}`}>
                <span className="text-lg w-6 text-center flex-shrink-0">
                  {medals[i] || `#${i + 1}`}
                </span>
                {p.avatar && (
                  <img src={p.avatar} className="w-7 h-7 rounded-full flex-shrink-0" alt="avatar" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isMe ? 'text-indigo-700' : 'text-gray-800'}`}>
                    {p.pseudo}
                  </p>
                  <p className="text-xs text-gray-400">{p.correct} correct</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${isMe ? 'text-indigo-600' : 'text-gray-700'}`}>
                  {p.score} pts
                </span>
              </div>
            )
          })}

          <button
            onClick={() => navigate('/quiz')}
            className="mt-2 w-full bg-indigo-600 text-white font-semibold py-4 rounded-2xl text-sm"
          >
            ↺ Rejouer
          </button>
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/') }}
            className="w-full bg-gray-100 text-gray-500 font-medium py-3 rounded-2xl text-sm"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}