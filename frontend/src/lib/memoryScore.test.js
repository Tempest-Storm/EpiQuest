import { test, expect } from 'vitest'
import {
  computeMemoryScore,
  MEMORY_PAIRS,
  MEMORY_BASE,
  MEMORY_MAX_SCORE,
} from './memoryScore.js'

test('a perfect, instant game scores the maximum', () => {
  expect(computeMemoryScore(MEMORY_PAIRS, 0)).toBe(MEMORY_MAX_SCORE)
})

test('extra attempts reduce the score', () => {
  const perfect = computeMemoryScore(MEMORY_PAIRS, 10)
  const sloppy = computeMemoryScore(MEMORY_PAIRS + 4, 10)
  expect(sloppy).toBeLessThan(perfect)
  expect(perfect - sloppy).toBe(4 * 25)
})

test('slower games score less (time bonus decays)', () => {
  expect(computeMemoryScore(MEMORY_PAIRS, 0)).toBeGreaterThan(computeMemoryScore(MEMORY_PAIRS, 50))
})

test('time bonus bottoms out at the base after 100s', () => {
  expect(computeMemoryScore(MEMORY_PAIRS, 100)).toBe(MEMORY_BASE)
  expect(computeMemoryScore(MEMORY_PAIRS, 250)).toBe(MEMORY_BASE)
})

test('never returns a negative score', () => {
  expect(computeMemoryScore(1000, 100)).toBeGreaterThanOrEqual(0)
})

test('never exceeds the maximum the server allows', () => {
  for (let s = 0; s <= 120; s += 5) {
    expect(computeMemoryScore(MEMORY_PAIRS, s)).toBeLessThanOrEqual(MEMORY_MAX_SCORE)
  }
})

test('result is always an integer', () => {
  for (let s = 0; s <= 30; s++) {
    expect(Number.isInteger(computeMemoryScore(MEMORY_PAIRS + 1, s))).toBe(true)
  }
})
