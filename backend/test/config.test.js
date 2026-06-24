const test = require('node:test')
const assert = require('node:assert/strict')
const { REQUIRED_ENV, getMissingEnv, assertEnv } = require('../config')

// A complete, valid environment for the tests to mutate.
function fullEnv() {
  return Object.fromEntries(REQUIRED_ENV.map((k) => [k, 'value']))
}

test('reports nothing missing when all variables are set', () => {
  assert.deepEqual(getMissingEnv(fullEnv()), [])
})

test('reports a variable that is absent', () => {
  const env = fullEnv()
  delete env.JWT_SECRET
  assert.deepEqual(getMissingEnv(env), ['JWT_SECRET'])
})

test('treats blank / whitespace-only values as missing', () => {
  const env = fullEnv()
  env.DATABASE_URL = ''
  env.FRONTEND_URL = '   '
  assert.deepEqual(getMissingEnv(env).sort(), ['DATABASE_URL', 'FRONTEND_URL'].sort())
})

test('assertEnv throws listing every missing variable', () => {
  const env = fullEnv()
  delete env.GOOGLE_CLIENT_ID
  delete env.GOOGLE_CLIENT_SECRET
  assert.throws(() => assertEnv(env), /GOOGLE_CLIENT_ID/)
  assert.throws(() => assertEnv(env), /GOOGLE_CLIENT_SECRET/)
})

test('assertEnv passes for a complete environment', () => {
  assert.doesNotThrow(() => assertEnv(fullEnv()))
})
