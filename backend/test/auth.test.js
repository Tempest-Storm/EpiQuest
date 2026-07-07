const test = require('node:test')
const assert = require('node:assert/strict')
const jwt = require('jsonwebtoken')

process.env.JWT_SECRET = 'test_secret'
const { authMiddleware } = require('../auth')

// Minimal mock of an Express response that records what the handler did.
function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

test('rejects a request with no Authorization header', () => {
  const req = { headers: {} }
  const res = mockRes()
  let nextCalled = false
  authMiddleware(req, res, () => { nextCalled = true })

  assert.equal(nextCalled, false)
  assert.equal(res.statusCode, 401)
  assert.deepEqual(res.body, { error: 'No token' })
})

test('rejects a request with an invalid token', () => {
  const req = { headers: { authorization: 'Bearer not.a.real.token' } }
  const res = mockRes()
  let nextCalled = false
  authMiddleware(req, res, () => { nextCalled = true })

  assert.equal(nextCalled, false)
  assert.equal(res.statusCode, 401)
  assert.deepEqual(res.body, { error: 'Invalid token' })
})

test('rejects a token signed with the wrong secret', () => {
  const token = jwt.sign({ id: 1 }, 'a_different_secret')
  const req = { headers: { authorization: `Bearer ${token}` } }
  const res = mockRes()
  let nextCalled = false
  authMiddleware(req, res, () => { nextCalled = true })

  assert.equal(nextCalled, false)
  assert.equal(res.statusCode, 401)
})

test('rejects an unsigned (alg: none) token', () => {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const token = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ id: 1 })}.`
  const req = { headers: { authorization: `Bearer ${token}` } }
  const res = mockRes()
  let nextCalled = false
  authMiddleware(req, res, () => { nextCalled = true })

  assert.equal(nextCalled, false)
  assert.equal(res.statusCode, 401)
})

test('rejects a token signed with a non-pinned algorithm', () => {
  // Correct secret but HS512 — the middleware pins HS256, so this must fail.
  const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { algorithm: 'HS512' })
  const req = { headers: { authorization: `Bearer ${token}` } }
  const res = mockRes()
  let nextCalled = false
  authMiddleware(req, res, () => { nextCalled = true })

  assert.equal(nextCalled, false)
  assert.equal(res.statusCode, 401)
})

test('accepts a valid token and attaches the payload to req.user', () => {
  const token = jwt.sign({ id: 42, name: 'Ada', email: 'ada@example.com' }, process.env.JWT_SECRET)
  const req = { headers: { authorization: `Bearer ${token}` } }
  const res = mockRes()
  let nextCalled = false
  authMiddleware(req, res, () => { nextCalled = true })

  assert.equal(nextCalled, true)
  assert.equal(res.statusCode, null)
  assert.equal(req.user.id, 42)
  assert.equal(req.user.name, 'Ada')
})
