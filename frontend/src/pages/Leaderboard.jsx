import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { API } from '../config'

const socket = io(API)

// Per-game display: heading and the label for the `correct` column.
const GAME_META = {
  quiz: { title: 'Quiz Epitech', unit: 'correct', route: '/quiz' },
  memory: { title: 'Mémoire Epitech', unit: 'paires', route: '/memory' },
  code: { title: 'Code dans l’ordre', unit: 'réussis', route: '/code' },
}

export default function Leaderboard() {
  const [scores, setScores] = useState([])
  const [me, setMe] = useState(null) // the player's own standing (with rank)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const game = GAME_META[searchParams.get('game')] ? searchParams.get('game') : 'quiz'
  const meta = GAME_META[game]

  const result = JSON.parse(localStorage.getItem('result') || '{}')
  const player = JSON.parse(localStorage.getItem('player') || '{}')
  const showRecap = result.pseudo && result.game === game

  useEffect(() => {
    const fetchLeaderboard = () => {
      fetch(`${API}/leaderboard?game=${game}`)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setScores(data) })
        .catch(err => console.error('Failed to load leaderboard:', err))
    }

    // The player's own rank, so they can see their standing even outside the
    // top 10. Requires the auth token; skipped for anonymous viewers.
    const fetchMe = () => {
      const token = localStorage.getItem('token')
      if (!token) return
      fetch(`${API}/players/me?game=${game}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => (r.ok ? r.json() : null))
        .then(data => setMe(data && typeof data.rank === 'number' ? data : null))
        .catch(err => console.error('Failed to load rank:', err))
    }

    fetchLeaderboard()
    fetchMe()
    // The server pushes the updated standings for a game with the event
    // payload; ignore events for other games and fall back to a fetch only if
    // the payload is missing or malformed. Refresh our own rank on every update.
    const onUpdate = (payload) => {
      if (!payload || payload.game !== game) return
      if (Array.isArray(payload.rows)) setScores(payload.rows)
      else fetchLeaderboard()
      fetchMe()
    }
    socket.on('leaderboard:update', onUpdate)
    return () => socket.off('leaderboard:update', onUpdate)
  }, [game])

  // Show the pinned "your rank" row only when the player exists but is beyond
  // the visible top rows.
  const showMyRank = me && me.rank > scores.length

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl">

        <div className="bg-[#1A1A2E] px-6 py-5 text-center">
          <h1 className="text-white text-lg font-bold">Classement — {meta.title}</h1>
          <p className="text-white/30 text-xs mt-1">🟢 Mis à jour en temps réel</p>
        </div>

        {/* My score recap */}
        {showRecap && (
          <div className="bg-indigo-50 px-4 py-3 flex items-center gap-3 border-b border-indigo-100">
            {result.avatar && (
              <img src={result.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
            )}
            <div className="flex-1">
              <p className="text-xs font-semibold text-indigo-700">{result.pseudo}</p>
              <p className="text-xs text-indigo-400">{result.correct}/{result.total} {meta.unit}</p>
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
                  <p className="text-xs text-gray-400">{p.correct} {meta.unit}</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${isMe ? 'text-indigo-600' : 'text-gray-700'}`}>
                  {p.score} pts
                </span>
              </div>
            )
          })}

          {/* The player's own standing when they're outside the visible top rows. */}
          {showMyRank && (
            <>
              <p className="text-center text-gray-300 text-xs">• • •</p>
              <div className="flex items-center gap-3 rounded-xl px-3 py-3 border-2 bg-indigo-50 border-indigo-500">
                <span className="text-sm font-bold w-8 text-center flex-shrink-0 text-indigo-600">#{me.rank}</span>
                {me.avatar && (
                  <img src={me.avatar} className="w-7 h-7 rounded-full flex-shrink-0" alt="avatar" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-indigo-700">{me.pseudo} <span className="text-indigo-400 font-normal">(toi)</span></p>
                  <p className="text-xs text-indigo-400">{me.correct} {meta.unit}</p>
                </div>
                <span className="text-sm font-bold flex-shrink-0 text-indigo-600">{me.score} pts</span>
              </div>
            </>
          )}

          <button
            onClick={() => navigate(meta.route)}
            className="mt-2 w-full bg-indigo-600 text-white font-semibold py-4 rounded-2xl text-sm"
          >
            ↺ Rejouer
          </button>
          <button
            onClick={() => navigate('/games')}
            className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-2xl text-sm"
          >
            🎮 Autres jeux
          </button>
        </div>
      </div>
    </div>
  )
}
