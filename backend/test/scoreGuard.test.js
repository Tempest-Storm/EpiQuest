const test = require('node:test')
const assert = require('node:assert/strict')
const { isPlausibleScore, MAX_POINTS_PER_QUESTION } = require('../scoreGuard')

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
