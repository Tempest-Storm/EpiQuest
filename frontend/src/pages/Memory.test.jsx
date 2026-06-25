import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Capture navigation while keeping the rest of react-router real (useAuth needs
// useSearchParams).
const navigateMock = vi.fn()
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => navigateMock,
}))

import Memory from './Memory.jsx'

function fakeToken(payload) {
  return `header.${btoa(JSON.stringify(payload))}.sig`
}

function renderMemory() {
  const token = fakeToken({ name: 'Ada', avatar_url: '' })
  return render(
    <MemoryRouter initialEntries={[`/memory?token=${token}`]}>
      <Memory />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  navigateMock.mockClear()
  // Deterministic shuffle: with Math.random()=0 the Fisher–Yates result pairs
  // up card indices as [[0,11],[1,2],[3,4],[5,6],[7,8],[9,10]].
  vi.spyOn(Math, 'random').mockReturnValue(0)
  globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('renders a hidden board of 12 cards', () => {
  renderMemory()
  const buttons = screen.getAllByRole('button')
  expect(buttons).toHaveLength(12)
  buttons.forEach((b) => expect(b).toHaveTextContent('?'))
  expect(screen.getByText('Paires 0/6')).toBeInTheDocument()
})

test('clicking a card reveals its symbol', () => {
  renderMemory()
  const buttons = screen.getAllByRole('button')
  fireEvent.click(buttons[0])
  expect(buttons[0]).not.toHaveTextContent('?')
})

test('completing the board submits a memory score and opens the memory leaderboard', async () => {
  renderMemory()
  const pairs = [[0, 11], [1, 2], [3, 4], [5, 6], [7, 8], [9, 10]]
  for (const [a, b] of pairs) {
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[a])
    fireEvent.click(buttons[b])
  }

  await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/leaderboard?game=memory'))

  // The score was POSTed as a memory submission with all pairs matched.
  const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
  expect(body.game).toBe('memory')
  expect(body.correct).toBe(6)
  expect(body.score).toBeGreaterThan(0)

  // The recap is stored for the memory leaderboard to show.
  const result = JSON.parse(localStorage.getItem('result'))
  expect(result.game).toBe('memory')
  expect(result.correct).toBe(6)
})
