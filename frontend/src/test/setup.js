// Adds custom DOM matchers (toBeInTheDocument, etc.) and cleans up the
// rendered tree between tests.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
