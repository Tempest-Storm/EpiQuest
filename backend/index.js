const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const { Pool } = require('pg')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const jwt = require('jsonwebtoken')
const session = require('express-session')
const { authMiddleware } = require('./auth')
const { assertEnv } = require('./config')
require('dotenv').config()

// Fail fast with a clear message if the server is misconfigured.
try {
  assertEnv()
} catch (err) {
  console.error(`❌ ${err.message}`)
  console.error('   See backend/.env.example for the full list of variables.')
  process.exit(1)
}

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL, credentials: true } })

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

const seedQuestions = require('./seedQuestions')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Create / migrate the schema in a single ordered transaction so that
// dependent objects (foreign keys, the user_id unique constraint the
// upsert relies on) are guaranteed to exist before any request is served.
// Each statement is idempotent, so this is safe to run on every boot.
async function initDatabase() {
  const client = await pool.connect()
  try {
    const { rows } = await client.query('SELECT NOW()')
    console.log('✅ DB connected at', rows[0].now)

    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        pseudo VARCHAR(100) NOT NULL,
        avatar TEXT,
        score INTEGER NOT NULL DEFAULT 0,
        correct INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // For pre-existing player tables created before user_id was introduced.
    await client.query('ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)')
    // The POST /players upsert uses ON CONFLICT (user_id); a unique index is required.
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS players_user_id_key ON players(user_id)')

    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        answer INTEGER NOT NULL
      )
    `)

    await client.query('COMMIT')

    await seedQuestionsIfEmpty()
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('❌ DB initialization failed:', err.message)
    throw err
  } finally {
    client.release()
  }
}

// Populate the questions table with the default Epitech quiz the first time
// the app runs against an empty database. Existing questions are never touched.
async function seedQuestionsIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM questions')
  if (rows[0].count > 0) return
  for (const q of seedQuestions) {
    await pool.query(
      'INSERT INTO questions (question, options, answer) VALUES ($1, $2, $3)',
      [q.question, JSON.stringify(q.options), q.answer]
    )
  }
  console.log(`🌱 Seeded ${seedQuestions.length} default questions`)
}

// ── PASSPORT ──────────────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const existing = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id])
    if (existing.rows.length > 0) return done(null, existing.rows[0])
    const newUser = await pool.query(
      'INSERT INTO users (google_id, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [profile.id, profile.emails[0].value, profile.displayName, profile.photos[0]?.value]
    )
    return done(null, newUser.rows[0])
  } catch (err) {
    return done(err, null)
  }
}))

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    done(null, result.rows[0])
  } catch (err) {
    done(err)
  }
})

// ── AUTH ROUTES ───────────────────────────────────────────────
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

app.get('/auth/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}?error=auth` }, (err, user, info) => {
      if (err) { console.error('❌ Auth error:', err); return res.redirect(`${process.env.FRONTEND_URL}?error=auth`) }
      if (!user) { console.error('❌ No user:', info); return res.redirect(`${process.env.FRONTEND_URL}?error=auth`) }
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      )
      res.redirect(`${process.env.FRONTEND_URL}/quiz?token=${token}`)
    })(req, res, next)
  }
)

// ── HEALTH ────────────────────────────────────────────────────
// Lightweight liveness/readiness probe for deployment (Docker, VPS,
// load balancers). Reports 200 only when the database is reachable.
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', db: 'up' })
  } catch (err) {
    console.error('❌ Health check failed:', err.message)
    res.status(503).json({ status: 'error', db: 'down' })
  }
})

// ── GAME ROUTES ───────────────────────────────────────────────
app.get('/questions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/players', authMiddleware, async (req, res) => {
  const { score, correct } = req.body
  const { id, name, avatar_url } = req.user

  // Reject anything that isn't a sane, non-negative integer.
  const isValid = (n) => Number.isInteger(n) && n >= 0
  if (!isValid(score) || !isValid(correct)) {
    return res.status(400).json({ error: 'score and correct must be non-negative integers' })
  }

  try {
    // Upsert — keep the player's best score. correct and created_at are
    // only updated when this run beats the stored score, so they always
    // describe the same run as the score that is kept.
    const result = await pool.query(`
      INSERT INTO players (user_id, pseudo, avatar, score, correct)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id)
      DO UPDATE SET
        score = GREATEST(players.score, EXCLUDED.score),
        correct = CASE WHEN EXCLUDED.score > players.score THEN EXCLUDED.correct ELSE players.correct END,
        created_at = CASE WHEN EXCLUDED.score > players.score THEN NOW() ELSE players.created_at END
      RETURNING *
    `, [id, name, avatar_url, score, correct])
    io.emit('leaderboard:update')
    res.json(result.rows[0])
  } catch (err) {
    console.error('❌ POST /players error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT pseudo, avatar, score, correct FROM players ORDER BY score DESC LIMIT 10'
    )
    res.json(result.rows)
  } catch (err) {
    console.error('❌ GET /leaderboard error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

io.on('connection', (socket) => {
  console.log('🔌 Player connected:', socket.id)
  socket.on('disconnect', () => console.log('❌ Player disconnected:', socket.id))
})

const PORT = process.env.PORT || 3001

initDatabase()
  .then(() => {
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('❌ Fatal: could not initialize database, shutting down:', err.message)
    process.exit(1)
  })

// Graceful shutdown: stop accepting connections, then close the DB pool so
// container/VPS restarts don't leak connections or drop in-flight requests.
let shuttingDown = false
function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`\n${signal} received — shutting down gracefully...`)
  server.close(() => {
    pool.end().finally(() => process.exit(0))
  })
  // Don't hang forever if connections refuse to close.
  setTimeout(() => process.exit(1), 10000).unref()
}
;['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)))