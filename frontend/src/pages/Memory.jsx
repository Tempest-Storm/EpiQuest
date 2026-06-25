import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../config'
import { useAuth } from '../hooks/useAuth'
import { computeMemoryScore, MEMORY_PAIRS } from '../lib/memoryScore'

// Epitech-themed pairs. Exactly MEMORY_PAIRS of them.
const SYMBOLS = ['⚡', '🐧', '💻', '🔌', '🧠', '{ }']

// Fisher–Yates shuffle returning a new array.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build a shuffled deck of card objects: each symbol twice, with a stable id.
function buildDeck() {
  const symbols = SYMBOLS.slice(0, MEMORY_PAIRS)
  const deck = symbols.flatMap((label, p) => [
    { id: p * 2, label },
    { id: p * 2 + 1, label },
  ])
  return shuffle(deck)
}

export default function Memory() {
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [cards] = useState(buildDeck)
  const [flipped, setFlipped] = useState([]) // indices currently face-up, length 0–2
  const [matched, setMatched] = useState([]) // ids of matched cards
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false) // brief lock while a mismatch is shown
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)
  const [startTime] = useState(() => Date.now())
  const submittedRef = useRef(false)

  const allMatched = matched.length === cards.length

  // Display timer, stopped once the board is cleared.
  useEffect(() => {
    if (allMatched) return
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(t)
  }, [allMatched, startTime])

  const finish = useCallback(() => {
    if (submittedRef.current) return
    submittedRef.current = true
    setDone(true)
    const seconds = (Date.now() - startTime) / 1000
    const score = computeMemoryScore(attempts, seconds, MEMORY_PAIRS)
    // Store the recap first so the player always sees their result.
    localStorage.setItem('result', JSON.stringify({
      game: 'memory',
      pseudo: user?.name,
      avatar: user?.avatar_url,
      score,
      correct: MEMORY_PAIRS,
      total: MEMORY_PAIRS,
    }))
    fetch(`${API}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ score, correct: MEMORY_PAIRS, game: 'memory' }),
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`) })
      .catch(err => console.error('Failed to save score:', err))
      .finally(() => navigate('/leaderboard?game=memory'))
  }, [attempts, user, token, navigate, startTime])

  // When every card is matched, score and submit once.
  useEffect(() => {
    if (allMatched && !submittedRef.current) finish()
  }, [allMatched, finish])

  const handleFlip = (index) => {
    if (locked || done) return
    if (flipped.includes(index) || matched.includes(cards[index].id)) return

    const next = [...flipped, index]
    setFlipped(next)
    if (next.length < 2) return

    setAttempts((a) => a + 1)
    const [i, j] = next
    if (cards[i].label === cards[j].label) {
      setMatched((m) => [...m, cards[i].id, cards[j].id])
      setFlipped([])
    } else {
      setLocked(true)
      setTimeout(() => { setFlipped([]); setLocked(false) }, 800)
    }
  }

  if (!user) return null // useAuth redirects to '/' when unauthenticated

  const isFaceUp = (index) => flipped.includes(index) || matched.includes(cards[index].id)
  const pairsFound = matched.length / 2

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl">

        <div className="bg-[#1A1A2E] px-5 py-4 flex justify-between items-center">
          <span className="text-white/50 text-xs">Paires {pairsFound}/{MEMORY_PAIRS}</span>
          <span className="text-white font-mono font-bold text-sm">⏱ {elapsed}s</span>
          <span className="text-emerald-400 text-xs font-bold">{attempts} essais</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-3 gap-3">
            {cards.map((card, index) => {
              const faceUp = isFaceUp(index)
              const isMatched = matched.includes(card.id)
              return (
                <button
                  key={card.id}
                  onClick={() => handleFlip(index)}
                  aria-label={faceUp ? card.label : 'carte cachée'}
                  className={[
                    'aspect-square rounded-2xl text-2xl font-bold flex items-center justify-center transition-all border-2',
                    faceUp
                      ? isMatched
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                        : 'bg-indigo-50 border-indigo-400 text-indigo-700'
                      : 'bg-[#1A1A2E] border-[#1A1A2E] text-white/30',
                  ].join(' ')}
                >
                  {faceUp ? card.label : '?'}
                </button>
              )
            })}
          </div>

          {allMatched && (
            <p className="text-center text-emerald-600 text-sm font-semibold mt-4">
              Bravo ! Calcul du score…
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
