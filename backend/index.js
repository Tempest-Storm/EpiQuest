const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const { Pool } = require('pg')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const jwt = require('jsonwebtoken')
const session = require('express-session')
require('dotenv').config()

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

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('❌ DB connection failed:', err.message)
  else console.log('✅ DB connected at', res.rows[0].now)
})

// Create users table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )
`)

// Update players table to link to users
pool.query(`
  ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
`)

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
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
  done(null, result.rows[0])
})

// ── AUTH ROUTES ───────────────────────────────────────────────
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

app.get('/auth/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}?error=auth` }, (err, user, info) => {
      if (err) { console.error('❌ Auth error:', err); return res.status(500).send(err.message) }
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

// ── MIDDLEWARE ────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

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
    console.log('📥 POST /players hit', req.body, req.user)
  const { score, correct } = req.body
  const { id, name, avatar_url } = req.user
  try {
    // Upsert — update score if better
    const result = await pool.query(`
      INSERT INTO players (user_id, pseudo, avatar, score, correct)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id)
      DO UPDATE SET
        score = GREATEST(players.score, EXCLUDED.score),
        correct = EXCLUDED.correct,
        created_at = NOW()
      RETURNING *
    `, [id, name, avatar_url, score, correct])
    io.emit('leaderboard:update')
    res.json(result.rows[0])
  } catch (err) {
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
    console.error('❌ POST /players error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

io.on('connection', (socket) => {
  console.log('🔌 Player connected:', socket.id)
  socket.on('disconnect', () => console.log('❌ Player disconnected:', socket.id))
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))