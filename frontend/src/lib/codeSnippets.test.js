import { test, expect } from 'vitest'
import snippets from './codeSnippets.js'
import { CODE_ROUNDS } from './codeScore.js'

test('there are enough snippets to fill a game', () => {
  expect(snippets.length).toBeGreaterThanOrEqual(CODE_ROUNDS)
})

test('every snippet is well-formed', () => {
  for (const s of snippets) {
    expect(typeof s.lang).toBe('string')
    expect(Array.isArray(s.lines)).toBe(true)
    expect(s.lines.length).toBeGreaterThanOrEqual(2)
    for (const line of s.lines) {
      expect(typeof line).toBe('string')
      expect(line.length).toBeGreaterThan(0)
    }
  }
})

// The game uses the line text as the React key and compares lines by value
// (countCorrect / isSolved), so duplicate lines inside one snippet would break
// both rendering and scoring. This guards future snippet additions.
test('no snippet contains duplicate lines', () => {
  for (const s of snippets) {
    expect(new Set(s.lines).size, `duplicate line in: ${s.lines.join(' | ')}`).toBe(s.lines.length)
  }
})
