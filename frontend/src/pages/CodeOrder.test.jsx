import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const navigateMock = vi.fn()
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => navigateMock,
}))

import CodeOrder from './CodeOrder.jsx'
import { CODE_ROUNDS } from '../lib/codeScore.js'

function fakeToken(payload) {
  return `header.${btoa(JSON.stringify(payload))}.sig`
}

function renderGame() {
  const token = fakeToken({ name: 'Ada', avatar_url: '' })
  return render(
    <MemoryRouter initialEntries={[`/code?token=${token}`]}>
      <CodeOrder />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  navigateMock.mockClear()
  globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
})

afterEach(() => vi.restoreAllMocks())

test('shows the first round with a Valider button and reorder controls', () => {
  renderGame()
  expect(screen.getByText(`Extrait 1/${CODE_ROUNDS}`)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Valider' })).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'monter' }).length).toBeGreaterThan(0)
})

test('reordering swaps two lines', () => {
  renderGame()
  const codeBefore = screen.getAllByRole('button', { name: 'Valider' }) // ensure rendered
  expect(codeBefore.length).toBe(1)
  // Move the last line up; the DOM order of the <pre> code rows should change.
  const before = screen.getAllByText(/./, { selector: 'pre' }).map((n) => n.textContent)
  const downs = screen.getAllByRole('button', { name: 'descendre' })
  fireEvent.click(downs[0]) // move first line down one
  const after = screen.getAllByText(/./, { selector: 'pre' }).map((n) => n.textContent)
  expect(after).not.toEqual(before)
  expect(after.slice().sort()).toEqual(before.slice().sort()) // same lines, reordered
})

test('validating all rounds submits a code score and opens the code leaderboard', async () => {
  renderGame()
  for (let r = 0; r < CODE_ROUNDS; r++) {
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }))
    const nextLabel = r === CODE_ROUNDS - 1 ? /voir mon score/i : /suivant/i
    fireEvent.click(screen.getByRole('button', { name: nextLabel }))
  }

  await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/leaderboard?game=code'))

  const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
  expect(body.game).toBe('code')
  expect(body.correct).toBeGreaterThanOrEqual(0)
  expect(body.correct).toBeLessThanOrEqual(CODE_ROUNDS)
  expect(typeof body.score).toBe('number')

  const result = JSON.parse(localStorage.getItem('result'))
  expect(result.game).toBe('code')
  expect(result.total).toBe(CODE_ROUNDS)
})
