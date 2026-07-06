import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Games from './pages/Games'
import Quiz from './pages/Quiz'
import Memory from './pages/Memory'
import CodeOrder from './pages/CodeOrder'
import Leaderboard from './pages/Leaderboard'

export default function App() {
  return (
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
  )
}