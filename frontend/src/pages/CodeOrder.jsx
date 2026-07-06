import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../config'
import { useAuth } from '../hooks/useAuth'
import snippets from '../lib/codeSnippets'
import { scoreRound, countCorrect, isSolved, CODE_ROUNDS } from '../lib/codeScore'

// Fisher–Yates shuffle returning a new array.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Pick CODE_ROUNDS random snippets and shuffle each into a starting order that
// isn't already solved.
function buildRounds() {
  return shuffle(snippets).slice(0, CODE_ROUNDS).map((s) => {
    let order = shuffle(s.lines)
    let guard = 0
    while (isSolved(order, s.lines) && guard++ < 10) order = shuffle(s.lines)
    return { solution: s.lines, initialOrder: order, lang: s.lang }
  })
}

// A single round: reorder the shuffled lines, then validate. Owns its own order
// and timer; a fresh instance is mounted per round via `key`, so no state needs
// to be reset in an effect.
function Round({ round, roundNumber, onDone }) {
  const [order, setOrder] = useState(() => round.initialOrder)
  const [startTime] = useState(() => Date.now())
  const [result, setResult] = useState(null) // null until the player validates
  const checked = result !== null

  const move = (i, dir) => {
    if (checked) return
    const j = i + dir
    if (j < 0 || j >= order.length) return
    const next = [...order]
    ;[next[i], next[j]] = [next[j], next[i]]
    setOrder(next)
  }

  const validate = () => {
    const seconds = (Date.now() - startTime) / 1000
    const correct = countCorrect(order, round.solution)
    const perfect = isSolved(order, round.solution)
    setResult({ correct, perfect, score: scoreRound(correct, round.solution.length, seconds, perfect) })
  }

  const isLast = roundNumber === CODE_ROUNDS

  return (
    <>
      <div className="bg-[#1A1A2E] px-5 py-4 flex justify-between items-center">
        <span className="text-white/50 text-xs">Extrait {roundNumber}/{CODE_ROUNDS}</span>
        <span className="text-emerald-400 text-xs font-bold">{round.lang}</span>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <p className="text-xs text-gray-400 text-center">Remets les lignes dans le bon ordre 👇</p>
        <div className="flex flex-col gap-2 font-mono text-[13px]">
          {order.map((line, i) => {
            // After validation, colour each line by whether it's in the right spot.
            const lineOk = checked && line === round.solution[i]
            const codeClass = checked
              ? lineOk
                ? 'bg-emerald-900 text-emerald-100 ring-1 ring-emerald-500'
                : 'bg-rose-950 text-rose-200 ring-1 ring-rose-500'
              : 'bg-gray-900 text-emerald-200'
            return (
              <div key={line} className="flex items-center gap-2">
                <pre className={`flex-1 min-w-0 overflow-x-auto rounded-lg px-3 py-2 whitespace-pre ${codeClass}`}>{line}</pre>
                {!checked && (
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="monter"
                      className="w-7 h-6 rounded bg-gray-100 text-gray-600 text-xs disabled:opacity-30"
                    >▲</button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === order.length - 1}
                      aria-label="descendre"
                      className="w-7 h-6 rounded bg-gray-100 text-gray-600 text-xs disabled:opacity-30"
                    >▼</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {!checked ? (
          <button
            onClick={validate}
            className="mt-2 w-full bg-indigo-600 text-white font-semibold py-3 rounded-2xl text-sm"
          >
            Valider
          </button>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            <p className={`text-center text-sm font-semibold ${result.perfect ? 'text-emerald-600' : 'text-amber-600'}`}>
              {result.perfect
                ? '✅ Parfait !'
                : `${result.correct}/${round.solution.length} lignes bien placées`}
            </p>
            <button
              onClick={() => onDone({ score: result.score, perfect: result.perfect })}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-2xl text-sm"
            >
              {isLast ? 'Voir mon score' : 'Suivant →'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default function CodeOrder() {
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [rounds] = useState(buildRounds)
  const [roundIndex, setRoundIndex] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [solvedCount, setSolvedCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const totalRef = useRef(0)
  const solvedRef = useRef(0)
  const submittedRef = useRef(false)

  const handleRoundDone = useCallback(({ score, perfect }) => {
    totalRef.current += score
    if (perfect) solvedRef.current += 1
    setTotalScore(totalRef.current)
    setSolvedCount(solvedRef.current)

    if (roundIndex + 1 >= rounds.length) {
      if (submittedRef.current) return
      submittedRef.current = true
      setFinished(true)
      localStorage.setItem('result', JSON.stringify({
        game: 'code',
        pseudo: user?.name,
        avatar: user?.avatar_url,
        score: totalRef.current,
        correct: solvedRef.current,
        total: rounds.length,
      }))
      fetch(`${API}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ score: totalRef.current, correct: solvedRef.current, game: 'code' }),
      })
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`) })
        .catch(err => console.error('Failed to save score:', err))
        .finally(() => navigate('/leaderboard?game=code'))
    } else {
      setRoundIndex((i) => i + 1)
    }
  }, [roundIndex, rounds.length, user, token, navigate])

  if (!user) return null // useAuth redirects to '/' when unauthenticated

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl">
        {finished ? (
          <p className="text-center text-emerald-600 text-sm font-semibold p-8">
            Terminé ! Calcul du score…
          </p>
        ) : (
          <>
            <div className="bg-indigo-50 px-4 py-2 flex justify-between items-center border-b border-indigo-100">
              <span className="text-xs font-medium text-indigo-700">Réussis {solvedCount}/{rounds.length}</span>
              <span className="text-xs font-bold text-indigo-600">{totalScore} pts</span>
            </div>
            <Round
              key={roundIndex}
              round={rounds[roundIndex]}
              roundNumber={roundIndex + 1}
              onDone={handleRoundDone}
            />
          </>
        )}
      </div>
    </div>
  )
}
