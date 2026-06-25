import { test, expect } from 'vitest'
import { computeScore, MAX_TIME, BASE_POINTS, TIME_BONUS } from './score.js'

test('full time left earns base + full time bonus', () => {
  expect(computeScore(MAX_TIME)).toBe(BASE_POINTS + TIME_BONUS)
})

test('zero time left still earns the base points', () => {
  expect(computeScore(0)).toBe(BASE_POINTS)
})

test('half the time left earns roughly half the time bonus', () => {
  expect(computeScore(MAX_TIME / 2)).toBe(BASE_POINTS + TIME_BONUS / 2)
})

test('score decreases as the clock runs down', () => {
  expect(computeScore(MAX_TIME)).toBeGreaterThan(computeScore(MAX_TIME / 2))
  expect(computeScore(MAX_TIME / 2)).toBeGreaterThan(computeScore(0))
})

test('out-of-range time is clamped', () => {
  expect(computeScore(-5)).toBe(BASE_POINTS)
  expect(computeScore(MAX_TIME + 100)).toBe(BASE_POINTS + TIME_BONUS)
})

test('result is always a non-negative integer', () => {
  for (let t = -2; t <= MAX_TIME + 2; t++) {
    const s = computeScore(t)
    expect(Number.isInteger(s) && s >= 0, `score for t=${t} is ${s}`).toBe(true)
  }
})
