import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Home from './pages/Home'

// Split each route into its own chunk so the QR-scanned landing page (Home)
// loads a minimal bundle. Heavy dependencies — e.g. socket.io-client, pulled
// in only by the Leaderboard — no longer weigh down first paint.
const Games = lazy(() => import('./pages/Games'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Memory = lazy(() => import('./pages/Memory'))
const CodeOrder = lazy(() => import('./pages/CodeOrder'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))

function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F4F2] flex items-center justify-center">
      <p className="text-gray-400 text-sm">Chargement…</p>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="/code" element={<CodeOrder />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        {/* Unknown URLs fall back to the landing page instead of a blank screen. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
