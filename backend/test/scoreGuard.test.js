const test = require('node:test')
const assert = require('node:assert/strict')
const {
  isPlausibleScore,
  MAX_POINTS_PER_QUESTION,
  isValidGame,
  isPlausibleMemoryScore,
  MEMORY_PAIRS,
  MAX_MEMORY_SCORE,
} = require('../scoreGuard')

const TOTAL = 12

test('accepts a realistic submission', () => {
  assert.equal(isPlausibleScore(800, 8, TOTAL), true)
})

test('accepts a perfect run at the exact upper bound', () => {
  assert.equal(isPlausibleScore(TOTAL * MAX_POINTS_PER_QUESTION, TOTAL, TOTAL), true)
})

test('accepts a zero score', () => {
  assert.equal(isPlausibleScore(0, 0, TOTAL), true)
})

test('rejects more correct answers than there are questions', () => {
  assert.equal(isPlausibleScore(0, TOTAL + 1, TOTAL), false)
})

test('rejects a score above what the correct answers allow', () => {
  assert.equal(isPlausibleScore(MAX_POINTS_PER_QUESTION + 1, 1, TOTAL), false)
  assert.equal(isPlausibleScore(999999, 1, TOTAL), false)
})

test('rejects an inflated score with zero correct answers', () => {
  assert.equal(isPlausibleScore(500, 0, TOTAL), false)
})

test('isValidGame only accepts known games', () => {
  assert.equal(isValidGame('quiz'), true)
  assert.equal(isValidGame('memory'), true)
  assert.equal(isValidGame('snake'), false)
  assert.equal(isValidGame(undefined), false)
})

test('memory: accepts a realistic submission', () => {
  assert.equal(isPlausibleMemoryScore(1500, MEMORY_PAIRS), true)
})

test('memory: accepts the exact maximum score', () => {
  assert.equal(isPlausibleMemoryScore(MAX_MEMORY_SCORE, MEMORY_PAIRS), true)
})

test('memory: rejects more matched pairs than the board has', () => {
  assert.equal(isPlausibleMemoryScore(0, MEMORY_PAIRS + 1), false)
})

test('memory: rejects a score above the maximum', () => {
  assert.equal(isPlausibleMemoryScore(MAX_MEMORY_SCORE + 1, MEMORY_PAIRS), false)
})
