-- EpiQuest — Database schema
-- Canonical reference for the PostgreSQL schema used by the backend.
-- The backend also applies this schema idempotently on startup
-- (see backend/index.js → initDatabase), so running this file by hand
-- is optional but useful for documentation and manual provisioning.

-- Authenticated users (created on Google OAuth login).
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  google_id   VARCHAR(100) UNIQUE NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- One score row per user. The upsert in POST /players relies on the
-- UNIQUE constraint on user_id (ON CONFLICT (user_id)).
CREATE TABLE IF NOT EXISTS players (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER UNIQUE REFERENCES users(id),
  pseudo      VARCHAR(100) NOT NULL,
  avatar      TEXT,
  score       INTEGER NOT NULL DEFAULT 0,
  correct     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Quiz questions. `options` is a JSON array of strings; `answer` is the
-- zero-based index into that array of the correct option.
CREATE TABLE IF NOT EXISTS questions (
  id          SERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL,
  answer      INTEGER NOT NULL
);
