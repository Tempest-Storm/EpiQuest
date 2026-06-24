import test from 'node:test'
import assert from 'node:assert/strict'
import { computeScore, MAX_TIME, BASE_POINTS, TIME_BONUS } from './score.js'

test('full time left earns base + full time bonus', () => {
  assert.equal(computeScore(MAX_TIME), BASE_POINTS + TIME_BONUS)
})

test('zero time left still earns the base points', () => {
  assert.equal(computeScore(0), BASE_POINTS)
})

test('half the time left earns roughly half the time bonus', () => {
  assert.equal(computeScore(MAX_TIME / 2), BASE_POINTS + TIME_BONUS / 2)
})

test('score decreases as the clock runs down', () => {
  assert.ok(computeScore(MAX_TIME) > computeScore(MAX_TIME / 2))
  assert.ok(computeScore(MAX_TIME / 2) > computeScore(0))
})

test('out-of-range time is clamped', () => {
  assert.equal(computeScore(-5), BASE_POINTS)
  assert.equal(computeScore(MAX_TIME + 100), BASE_POINTS + TIME_BONUS)
})

test('result is always a non-negative integer', () => {
  for (let t = -2; t <= MAX_TIME + 2; t++) {
    const s = computeScore(t)
    assert.ok(Number.isInteger(s) && s >= 0, `score for t=${t} is ${s}`)
  }
})
