import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// The games available from the hub. `to` is the route that launches the game.
const GAMES = [
  {
    key: 'quiz',
    to: '/quiz',
    icon: '🧠',
    title: 'Quiz Epitech',
    desc: 'Teste tes connaissances sur l’école',
    accent: 'bg-indigo-600',
  },
  {
    key: 'memory',
    to: '/memory',
    icon: '🃏',
    title: 'Mémoire Epitech',
    desc: 'Retrouve les paires le plus vite possible',
    accent: 'bg-emerald-600',
  },
]

export default function Games() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // useAuth redirects to '/' when unauthenticated; render nothing meanwhile.
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl">

        <div className="bg-[#1A1A2E] px-6 pt-7 pb-6 text-center">
          {user.avatar_url && (
            <img src={user.avatar_url} className="w-14 h-14 rounded-full mx-auto mb-3" alt="avatar" />
          )}
          <h1 className="text-white text-xl font-bold">Salut {user.name?.split(' ')[0]} 👋</h1>
          <p className="text-white/40 text-xs mt-1">Choisis ton jeu</p>
        </div>

        <div className="p-5 flex flex-col gap-3">
          {GAMES.map((g) => (
            <button
              key={g.key}
              onClick={() => navigate(g.to)}
              className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-indigo-300 rounded-2xl p-4 text-left transition-all"
            >
              <span className={`${g.accent} w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                {g.icon}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-gray-800">{g.title}</span>
                <span className="block text-xs text-gray-400">{g.desc}</span>
              </span>
              <span className="text-gray-300 text-xl">›</span>
            </button>
          ))}

          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/') }}
            className="mt-1 w-full bg-gray-100 text-gray-500 font-medium py-3 rounded-2xl text-sm"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
