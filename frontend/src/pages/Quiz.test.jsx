import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Quiz from './Quiz.jsx'

// Build a fake (unsigned) JWT whose payload decodes to the given object.
// Quiz only reads the payload via atob(token.split('.')[1]).
function fakeToken(payload) {
  return `header.${btoa(JSON.stringify(payload))}.sig`
}

// Questions ship WITHOUT the answer — correctness comes from the (mocked)
// server-side /answers/check endpoint, like in production.
const QUESTIONS = [
  { id: 1, question: 'Question un ?', options: ['A1', 'B1', 'C1', 'D1'] },
  { id: 2, question: 'Question deux ?', options: ['A2', 'B2', 'C2', 'D2'] },
]
const ANSWERS = { 1: 0, 2: 2 }

const USER = { name: 'Ada Lovelace', avatar_url: 'https://example.com/a.png' }

function renderQuiz() {
  const token = fakeToken(USER)
  return render(
    <MemoryRouter initialEntries={[`/quiz?token=${token}`]}>
      <Quiz />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  globalThis.fetch = vi.fn((url, opts) => {
    if (String(url).includes('/answers/check')) {
      const { id, choice } = JSON.parse(opts.body)
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ correct: ANSWERS[id] === choice, answer: ANSWERS[id] }),
      })
    }
    if (String(url).includes('/questions')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(QUESTIONS) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('shows a loading state then the first question and the player name', async () => {
  renderQuiz()
  expect(screen.getByText(/chargement des questions/i)).toBeInTheDocument()

  expect(await screen.findByText('Question un ?')).toBeInTheDocument()
  QUESTIONS[0].options.forEach((opt) => {
    expect(screen.getByText(opt)).toBeInTheDocument()
  })
  expect(screen.getByText(USER.name)).toBeInTheDocument()
  expect(screen.getByText('Question 1 / 2')).toBeInTheDocument()
})

test('persists the token to localStorage on a fresh login', async () => {
  renderQuiz()
  await screen.findByText('Question un ?')
  expect(localStorage.getItem('token')).toMatch(/^header\./)
  expect(JSON.parse(localStorage.getItem('player'))).toEqual({
    pseudo: USER.name,
    avatar: USER.avatar_url,
  })
})

test('a correct answer is verified by the server, awards points and advances', async () => {
  renderQuiz()
  await screen.findByText('Question un ?')
  expect(screen.getByText('0 pts')).toBeInTheDocument()

  // Click the correct answer (index 0) for question one.
  fireEvent.click(screen.getByText('A1'))

  // The check request carries the question id, the choice and the JWT.
  await waitFor(() => {
    const call = globalThis.fetch.mock.calls.find(([u]) => String(u).includes('/answers/check'))
    expect(call).toBeTruthy()
    expect(JSON.parse(call[1].body)).toEqual({ id: 1, choice: 0 })
    expect(call[1].headers.Authorization).toMatch(/^Bearer /)
  })

  // After the 1s reveal delay, the quiz advances to question two.
  expect(await screen.findByText('Question deux ?', {}, { timeout: 2000 })).toBeInTheDocument()
  expect(screen.getByText('Question 2 / 2')).toBeInTheDocument()
  // A correct answer is worth at least the base points (50), so no longer 0.
  expect(screen.queryByText('0 pts')).not.toBeInTheDocument()
})

test('a wrong answer earns no points and still advances', async () => {
  renderQuiz()
  await screen.findByText('Question un ?')

  fireEvent.click(screen.getByText('B1')) // wrong (correct is A1)

  expect(await screen.findByText('Question deux ?', {}, { timeout: 2000 })).toBeInTheDocument()
  expect(screen.getByText('0 pts')).toBeInTheDocument()
})

test('a failed answer check counts as wrong but the game keeps moving', async () => {
  globalThis.fetch = vi.fn((url) => {
    if (String(url).includes('/answers/check')) return Promise.reject(new Error('network down'))
    if (String(url).includes('/questions')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(QUESTIONS) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
  renderQuiz()
  await screen.findByText('Question un ?')

  fireEvent.click(screen.getByText('A1'))

  expect(await screen.findByText('Question deux ?', {}, { timeout: 2000 })).toBeInTheDocument()
  expect(screen.getByText('0 pts')).toBeInTheDocument()
})

test('redirects to home when there is no token', async () => {
  localStorage.clear()
  render(
    <MemoryRouter initialEntries={['/quiz']}>
      <Quiz />
    </MemoryRouter>
  )
  // With no token the questions fetch should never fire.
  await waitFor(() => {
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})
