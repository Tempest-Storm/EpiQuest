import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { decodeToken } from '../lib/auth'

// Resolves the logged-in player from a JWT that arrives either in the URL
// (fresh Google login) or in localStorage (returning player). The token and a
// lightweight player profile are persisted; if no valid token is present the
// user is redirected to the landing page. Returns { user, token }.
export function useAuth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Resolve once, synchronously, on first render.
  const [token] = useState(() => searchParams.get('token') || localStorage.getItem('token'))
  const [user] = useState(() => (token ? decodeToken(token) : null))

  useEffect(() => {
    if (!user) {
      localStorage.removeItem('token')
      navigate('/')
      return
    }
    localStorage.setItem('token', token)
    localStorage.setItem('player', JSON.stringify({ pseudo: user.name, avatar: user.avatar_url }))
  }, [user, token, navigate])

  return { user, token }
}
