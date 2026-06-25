import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary.jsx'

// A component that throws on render, to trip the boundary.
function Boom() {
  throw new Error('kaboom')
}

beforeEach(() => {
  // React logs caught errors to console.error; silence it for clean output.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('renders children when there is no error', () => {
  render(
    <ErrorBoundary>
      <p>all good</p>
    </ErrorBoundary>
  )
  expect(screen.getByText('all good')).toBeInTheDocument()
})

test('renders the fallback UI when a child throws', () => {
  render(
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>
  )
  expect(screen.getByText(/une erreur inattendue est survenue/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /retour à l'accueil/i })).toBeInTheDocument()
})
