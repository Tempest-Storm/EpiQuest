import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const navigateMock = vi.fn()
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => navigateMock,
}))

import Games from './Games.jsx'

function fakeToken(payload) {
  return `header.${btoa(JSON.stringify(payload))}.sig`
}

function renderGames(withToken = true) {
  const entry = withToken ? `/games?token=${fakeToken({ name: 'Ada Lovelace', avatar_url: '' })}` : '/games'
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Games />
    </MemoryRouter>
  )
}

// What GET /players/me/all resolves to for the current test.
let standings = {}

beforeEach(() => {
  localStorage.clear()
  navigateMock.mockClear()
  standings = {}
  globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(standings) }))
})

afterEach(() => vi.restoreAllMocks())

test('greets the player and shows the three games', () => {
  renderGames()
  expect(screen.getByText(/salut ada/i)).toBeInTheDocument()
  expect(screen.getByText('Quiz Epitech')).toBeInTheDocument()
  expect(screen.getByText('Mémoire Epitech')).toBeInTheDocument()
  expect(screen.getByText('Code dans l’ordre')).toBeInTheDocument()
})

test('shows the personal best on a card once standings load', async () => {
  localStorage.setItem('token', 'header.payload.sig')
  standings = { quiz: { score: 150, correct: 2, rank: 1 } }
  renderGames()
  expect(await screen.findByText(/150 pts · #1/)).toBeInTheDocument()
})

test('choosing a game navigates to its route', () => {
  renderGames()
  fireEvent.click(screen.getByText('Quiz Epitech'))
  expect(navigateMock).toHaveBeenCalledWith('/quiz')
  fireEvent.click(screen.getByText('Code dans l’ordre'))
  expect(navigateMock).toHaveBeenCalledWith('/code')
})

test('redirects to the landing page when not logged in', () => {
  renderGames(false)
  expect(navigateMock).toHaveBeenCalledWith('/')
})
