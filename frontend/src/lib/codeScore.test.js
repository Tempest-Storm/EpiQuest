import { test, expect } from 'vitest'
import {
  scoreRound,
  countCorrect,
  isSolved,
  CODE_ROUND_BASE,
  CODE_ROUND_BONUS,
} from './codeScore.js'

test('a perfect, instant round scores base + full bonus', () => {
  expect(scoreRound(5, 5, 0, true)).toBe(CODE_ROUND_BASE + CODE_ROUND_BONUS)
})

test('a perfect round loses bonus as time passes', () => {
  expect(scoreRound(5, 5, 10, true)).toBe(CODE_ROUND_BASE + (CODE_ROUND_BONUS - 50))
})

test('an imperfect round gets partial placement credit and no bonus', () => {
  // 3 of 5 lines correct, and not perfect → no speed bonus regardless of time.
  expect(scoreRound(3, 5, 0, false)).toBe(Math.round((3 / 5) * CODE_ROUND_BASE))
})

test('zero correct lines scores zero', () => {
  expect(scoreRound(0, 5, 2, false)).toBe(0)
})

test('score never exceeds the per-round max or goes negative', () => {
  for (let c = 0; c <= 5; c++) {
    for (let s = 0; s <= 40; s += 5) {
      const v = scoreRound(c, 5, s, c === 5)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(CODE_ROUND_BASE + CODE_ROUND_BONUS)
    }
  }
})

test('countCorrect counts lines in the right position', () => {
  const sol = ['a', 'b', 'c']
  expect(countCorrect(['a', 'b', 'c'], sol)).toBe(3)
  expect(countCorrect(['a', 'c', 'b'], sol)).toBe(1)
  expect(countCorrect(['c', 'b', 'a'], sol)).toBe(1)
})

test('isSolved is true only for the exact order', () => {
  const sol = ['x', 'y', 'z']
  expect(isSolved(['x', 'y', 'z'], sol)).toBe(true)
  expect(isSolved(['x', 'z', 'y'], sol)).toBe(false)
  expect(isSolved(['x', 'y'], sol)).toBe(false)
})
