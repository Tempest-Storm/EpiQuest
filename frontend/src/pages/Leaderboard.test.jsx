import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Leaderboard opens a Socket.io connection at module load; stub it so no real
// network connection is attempted during tests. Captured handlers let tests
// drive the 'leaderboard:update' event.
const socketHandlers = {}
vi.mock('socket.io-client', () => ({
  io: () => ({
    on: (event, cb) => { socketHandlers[event] = cb },
    off: vi.fn(),
  }),
}))

import Leaderboard from './Leaderboard.jsx'

const SCORES = [
  { pseudo: 'Alice', avatar: '', score: 300, correct: 3 },
  { pseudo: 'Bob', avatar: '', score: 200, correct: 2 },
]

function renderLeaderboard() {
  return render(
    <MemoryRouter>
      <Leaderboard />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(SCORES) })
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('renders the fetched scores ranked', async () => {
  renderLeaderboard()
  expect(await screen.findByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('Bob')).toBeInTheDocument()
  expect(screen.getByText('300 pts')).toBeInTheDocument()
  expect(screen.getByText('200 pts')).toBeInTheDocument()
})

test('shows the personal recap from localStorage', async () => {
  localStorage.setItem('result', JSON.stringify({
    pseudo: 'Alice', avatar: '', score: 300, correct: 3, total: 5,
  }))
  renderLeaderboard()
  expect(await screen.findByText('3/5 correct')).toBeInTheDocument()
})

test('shows an empty state when there are no scores', async () => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  )
  renderLeaderboard()
  expect(await screen.findByText(/aucun score encore/i)).toBeInTheDocument()
})

test('updates from the socket event payload without re-fetching', async () => {
  renderLeaderboard()
  await screen.findByText('Alice')
  globalThis.fetch.mockClear()

  const updated = [{ pseudo: 'Carol', avatar: '', score: 999, correct: 9 }]
  await act(async () => {
    socketHandlers['leaderboard:update'](updated)
  })

  expect(await screen.findByText('Carol')).toBeInTheDocument()
  expect(screen.getByText('999 pts')).toBeInTheDocument()
  // The payload is used directly — no extra fetch.
  expect(globalThis.fetch).not.toHaveBeenCalled()
})

test('falls back to fetching when the socket event has no payload', async () => {
  renderLeaderboard()
  await screen.findByText('Alice')
  globalThis.fetch.mockClear()

  await act(async () => {
    socketHandlers['leaderboard:update'](undefined)
  })

  expect(globalThis.fetch).toHaveBeenCalledTimes(1)
})

test('tolerates a non-array leaderboard response without crashing', async () => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ error: 'boom' }) })
  )
  renderLeaderboard()
  // Falls back to the empty state rather than throwing.
  expect(await screen.findByText(/aucun score encore/i)).toBeInTheDocument()
})
