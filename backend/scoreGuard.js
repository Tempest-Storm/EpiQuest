// The games that can submit scores. Used to validate the `game` field and to
// scope each player's best score per game.
const GAMES = ['quiz', 'memory', 'code']

function isValidGame(game) {
  return GAMES.includes(game)
}

// ── Quiz ──────────────────────────────────────────────────────
// Highest score a single question can yield: BASE_POINTS (50) + TIME_BONUS
// (100). Kept in sync with frontend/src/lib/score.js.
const MAX_POINTS_PER_QUESTION = 150

// Server-side sanity check for client-computed quiz scores. A run cannot have
// more correct answers than there are questions, and each correct answer is
// worth at most MAX_POINTS_PER_QUESTION, so this is a tight upper bound that
// never rejects a legitimate submission.
function isPlausibleScore(score, correct, totalQuestions, maxPerQuestion = MAX_POINTS_PER_QUESTION) {
  if (correct > totalQuestions) return false
  if (score > correct * maxPerQuestion) return false
  return true
}

// ── Memory Match ──────────────────────────────────────────────
// The board has MEMORY_PAIRS pairs; the client scoring formula
// (frontend/src/lib/memoryScore.js) caps at MAX_MEMORY_SCORE.
const MEMORY_PAIRS = 6
const MAX_MEMORY_SCORE = 2000

// `correct` here is the number of matched pairs. A run cannot match more pairs
// than the board has, nor exceed the maximum achievable score.
function isPlausibleMemoryScore(score, correct, pairs = MEMORY_PAIRS, maxScore = MAX_MEMORY_SCORE) {
  if (correct > pairs) return false
  if (score > maxScore) return false
  return true
}

// ── Code dans l'ordre ─────────────────────────────────────────
// A game is CODE_ROUNDS snippets; the client scoring formula
// (frontend/src/lib/codeScore.js) caps each round at 300, so the run caps at
// CODE_ROUNDS * 300.
const CODE_ROUNDS = 4
const MAX_CODE_SCORE = CODE_ROUNDS * 300 // 1200

// `correct` here is the number of snippets ordered perfectly. A run cannot
// solve more snippets than there are rounds, nor exceed the maximum score.
function isPlausibleCodeScore(score, correct, rounds = CODE_ROUNDS, maxScore = MAX_CODE_SCORE) {
  if (correct > rounds) return false
  if (score > maxScore) return false
  return true
}

module.exports = {
  GAMES,
  isValidGame,
  MAX_POINTS_PER_QUESTION,
  isPlausibleScore,
  MEMORY_PAIRS,
  MAX_MEMORY_SCORE,
  isPlausibleMemoryScore,
  CODE_ROUNDS,
  MAX_CODE_SCORE,
  isPlausibleCodeScore,
}
