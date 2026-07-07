import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAuth } from './useAuth.js'

function fakeToken(payload) {
  return `header.${btoa(JSON.stringify(payload))}.sig`
}

// Minimal consumer so the hook can run under a router.
function Probe() {
  const { user } = useAuth()
  return <p>{user ? `hello ${user.name}` : 'anonymous'}</p>
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => vi.restoreAllMocks())

test('resolves the user from a URL token and persists the session', async () => {
  const token = fakeToken({ name: 'Ada', avatar_url: 'x' })
  render(
    <MemoryRouter initialEntries={[`/games?token=${token}`]}>
      <Probe />
    </MemoryRouter>
  )
  expect(await screen.findByText('hello Ada')).toBeInTheDocument()
  expect(localStorage.getItem('token')).toBe(token)
})

test('scrubs the token from the address bar once consumed', async () => {
  const spy = vi.spyOn(window.history, 'replaceState')
  const token = fakeToken({ name: 'Ada', avatar_url: 'x' })
  render(
    <MemoryRouter initialEntries={[`/games?token=${token}`]}>
      <Probe />
    </MemoryRouter>
  )
  await screen.findByText('hello Ada')
  await waitFor(() => expect(spy).toHaveBeenCalled())
})

test('does not touch history when the token came from localStorage', async () => {
  localStorage.setItem('token', fakeToken({ name: 'Zoe', avatar_url: '' }))
  const spy = vi.spyOn(window.history, 'replaceState')
  render(
    <MemoryRouter initialEntries={['/games']}>
      <Probe />
    </MemoryRouter>
  )
  await screen.findByText('hello Zoe')
  expect(spy).not.toHaveBeenCalled()
})

test('clears a malformed stored token', async () => {
  localStorage.setItem('token', 'garbage')
  render(
    <MemoryRouter initialEntries={['/games']}>
      <Probe />
    </MemoryRouter>
  )
  await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
})
