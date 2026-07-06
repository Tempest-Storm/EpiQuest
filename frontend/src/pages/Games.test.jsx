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

beforeEach(() => {
  localStorage.clear()
  navigateMock.mockClear()
})

afterEach(() => vi.restoreAllMocks())

test('greets the player and shows the three games', () => {
  renderGames()
  expect(screen.getByText(/salut ada/i)).toBeInTheDocument()
  expect(screen.getByText('Quiz Epitech')).toBeInTheDocument()
  expect(screen.getByText('Mémoire Epitech')).toBeInTheDocument()
  expect(screen.getByText('Code dans l’ordre')).toBeInTheDocument()
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
