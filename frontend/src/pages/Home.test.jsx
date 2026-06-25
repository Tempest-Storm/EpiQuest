import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home.jsx'
import { API } from '../config'

let originalLocation

beforeEach(() => {
  originalLocation = window.location
  // Replace location so the login redirect can be observed without jsdom
  // actually navigating.
  delete window.location
  window.location = { href: '' }
})

afterEach(() => {
  window.location = originalLocation
  vi.restoreAllMocks()
})

test('renders the title and the Google login call to action', () => {
  render(<MemoryRouter><Home /></MemoryRouter>)
  expect(screen.getByText('EpiQuest')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /continuer avec google/i })).toBeInTheDocument()
})

test('clicking the login button redirects to the backend OAuth endpoint', () => {
  render(<MemoryRouter><Home /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: /continuer avec google/i }))
  expect(window.location.href).toBe(`${API}/auth/google`)
})
