const test = require('node:test')
const assert = require('node:assert/strict')
const seedQuestions = require('../seedQuestions')

test('exports a non-empty array of questions', () => {
  assert.ok(Array.isArray(seedQuestions))
  assert.ok(seedQuestions.length > 0)
})

test('every question is well-formed', () => {
  seedQuestions.forEach((q, i) => {
    assert.equal(typeof q.question, 'string', `question ${i} text`)
    assert.ok(q.question.trim().length > 0, `question ${i} is not empty`)

    assert.ok(Array.isArray(q.options), `question ${i} options is an array`)
    assert.ok(q.options.length >= 2 && q.options.length <= 4, `question ${i} has 2-4 options`)
    q.options.forEach((opt, j) => {
      assert.equal(typeof opt, 'string', `question ${i} option ${j} is a string`)
      assert.ok(opt.trim().length > 0, `question ${i} option ${j} is not empty`)
    })

    assert.equal(typeof q.answer, 'number', `question ${i} answer is a number`)
    assert.ok(Number.isInteger(q.answer), `question ${i} answer is an integer`)
    assert.ok(
      q.answer >= 0 && q.answer < q.options.length,
      `question ${i} answer index is within options range`
    )
  })
})

test('no duplicate question text', () => {
  const texts = seedQuestions.map(q => q.question)
  assert.equal(new Set(texts).size, texts.length)
})
