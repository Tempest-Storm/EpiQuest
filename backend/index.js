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
const { isValidGame, isPlausibleScore, isPlausibleMemoryScore, isPlausibleCodeScore } = require('./scoreGuard')
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
// Behind a hosting proxy (Render, etc.) trust X-Forwarded-* so req.protocol
// is https — otherwise Passport builds an http OAuth callback that Google,
// configured with an https redirect URI, rejects.
app.set('trust proxy', 1)
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
        game VARCHAR(20) NOT NULL DEFAULT 'quiz',
        score INTEGER NOT NULL DEFAULT 0,
        correct INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // For pre-existing player tables created before these columns existed.
    await client.query('ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)')
    await client.query("ALTER TABLE players ADD COLUMN IF NOT EXISTS game VARCHAR(20) NOT NULL DEFAULT 'quiz'")
    // Widen columns that older/manual schemas under-sized. Google avatar URLs
    // and display names are long; a narrow VARCHAR rejected real inserts with
    // "value too long". Widening is a safe, idempotent no-op once applied.
    await client.query('ALTER TABLE players ALTER COLUMN avatar TYPE TEXT')
    await client.query('ALTER TABLE players ALTER COLUMN pseudo TYPE VARCHAR(100)')

    // A player now keeps one best score per game (ON CONFLICT (user_id, game)),
    // so any legacy single-column UNIQUE(user_id) constraint/index must go —
    // it would block a user from having a row per game. The name varies across
    // environments (players_user_id_key, players_user_id_unique, ...), so drop
    // whichever UNIQUE constraint is defined on exactly (user_id).
    await client.query(`
      DO $$
      DECLARE c record;
      BEGIN
        FOR c IN
          SELECT conname FROM pg_constraint
          WHERE conrelid = 'players'::regclass
            AND contype = 'u'
            AND conkey = ARRAY[(
              SELECT attnum FROM pg_attribute
              WHERE attrelid = 'players'::regclass AND attname = 'user_id'
            )]::smallint[]
        LOOP
          EXECUTE format('ALTER TABLE players DROP CONSTRAINT %I', c.conname);
        END LOOP;
      END $$;
    `)
    await client.query('DROP INDEX IF EXISTS players_user_id_key')
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS players_user_game_key ON players(user_id, game)')

    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        answer INTEGER NOT NULL
      )
    `)

    // Normalize a legacy text[] options column to jsonb (some manually-created
    // schemas used text[]). to_jsonb converts existing arrays without data
    // loss; it's a no-op when the column is already jsonb.
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'questions' AND column_name = 'options' AND data_type <> 'jsonb'
        ) THEN
          ALTER TABLE questions ALTER COLUMN options TYPE jsonb USING to_jsonb(options);
        END IF;
      END $$;
    `)

    await client.query('COMMIT')

    await seedMissingQuestions()
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('❌ DB initialization failed:', err.message)
    throw err
  } finally {
    client.release()
  }
}

// Ensure every default question is present, inserting only the ones missing
// (matched by question text). This keeps the pool in sync as new questions are
// added over time, without duplicating existing rows or clobbering any that an
// admin may have added or edited.
async function seedMissingQuestions() {
  let inserted = 0
  for (const q of seedQuestions) {
    const res = await pool.query(
      `INSERT INTO questions (question, options, answer)
       SELECT $1, $2, $3
       WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question = $1)`,
      [q.question, JSON.stringify(q.options), q.answer]
    )
    inserted += res.rowCount
  }
  if (inserted > 0) console.log(`🌱 Seeded ${inserted} new question(s)`)
}

// ── PASSPORT ──────────────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // Relative by default (works locally); set GOOGLE_CALLBACK_URL to the full
  // public URL in production so it exactly matches the URI registered in the
  // Google Cloud console, e.g. https://epiquest-api.onrender.com/auth/google/callback
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
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
      res.redirect(`${process.env.FRONTEND_URL}/games?token=${token}`)
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
// Returns quiz questions. With ?limit=N, returns a random N from the pool
// (so a larger pool gives variety without lengthening each game); otherwise
// returns them all in id order.
app.get('/questions', async (req, res) => {
  const rawLimit = parseInt(req.query.limit, 10)
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : null
  try {
    const result = limit
      ? await pool.query('SELECT * FROM questions ORDER BY RANDOM() LIMIT $1', [limit])
      : await pool.query('SELECT * FROM questions ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/players', authMiddleware, async (req, res) => {
  const { score, correct, game = 'quiz' } = req.body
  const { id, name, avatar_url } = req.user

  if (!isValidGame(game)) {
    return res.status(400).json({ error: 'unknown game' })
  }
  // Reject anything that isn't a sane, non-negative integer.
  const isValid = (n) => Number.isInteger(n) && n >= 0
  if (!isValid(score) || !isValid(correct)) {
    return res.status(400).json({ error: 'score and correct must be non-negative integers' })
  }

  try {
    // Scoring is computed client-side, so guard against spoofed submissions.
    let plausible
    if (game === 'quiz') {
      const { rows: [{ count }] } = await pool.query('SELECT COUNT(*)::int AS count FROM questions')
      plausible = isPlausibleScore(score, correct, count)
    } else if (game === 'code') {
      plausible = isPlausibleCodeScore(score, correct)
    } else {
      plausible = isPlausibleMemoryScore(score, correct)
    }
    if (!plausible) {
      return res.status(400).json({ error: 'Submitted score is not plausible' })
    }

    // Upsert — keep the player's best score for this game. correct and
    // created_at are only updated when this run beats the stored score, so
    // they always describe the same run as the score that is kept.
    const result = await pool.query(`
      INSERT INTO players (user_id, pseudo, avatar, game, score, correct)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, game)
      DO UPDATE SET
        score = GREATEST(players.score, EXCLUDED.score),
        correct = CASE WHEN EXCLUDED.score > players.score THEN EXCLUDED.correct ELSE players.correct END,
        created_at = CASE WHEN EXCLUDED.score > players.score THEN NOW() ELSE players.created_at END
      RETURNING *
    `, [id, name, avatar_url, game, score, correct])
    // Push the new standings for this game to every client in a single query,
    // instead of signalling each client to re-fetch /leaderboard (which scaled
    // as submissions × connected clients). Clients fall back to fetching if the
    // payload is ever missing.
    io.emit('leaderboard:update', { game, rows: await fetchTopPlayers(game) })
    res.json(result.rows[0])
  } catch (err) {
    console.error('❌ POST /players error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Top 10 players by score for a given game — the shape the leaderboard renders.
async function fetchTopPlayers(game = 'quiz') {
  const result = await pool.query(
    'SELECT pseudo, avatar, score, correct FROM players WHERE game = $1 ORDER BY score DESC LIMIT 10',
    [game]
  )
  return result.rows
}

app.get('/leaderboard', async (req, res) => {
  const game = req.query.game || 'quiz'
  if (!isValidGame(game)) {
    return res.status(400).json({ error: 'unknown game' })
  }
  try {
    res.json(await fetchTopPlayers(game))
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