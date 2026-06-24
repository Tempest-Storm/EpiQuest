// Environment variables the server cannot run correctly without. PORT is
// intentionally excluded because it has a sensible default (3001).
const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET',
  'FRONTEND_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
]

// Return the names of any required variables that are missing or blank.
function getMissingEnv(env = process.env) {
  return REQUIRED_ENV.filter((key) => {
    const value = env[key]
    return value === undefined || value === null || String(value).trim() === ''
  })
}

// Throw a descriptive error if any required variable is missing, so the
// server fails fast at startup instead of breaking cryptically per-request.
function assertEnv(env = process.env) {
  const missing = getMissingEnv(env)
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

module.exports = { REQUIRED_ENV, getMissingEnv, assertEnv }
