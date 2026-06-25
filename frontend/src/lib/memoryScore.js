// Memory Match scoring. Kept in sync with the server-side guard in
// backend/scoreGuard.js (MEMORY_PAIRS, MAX_MEMORY_SCORE).
export const MEMORY_PAIRS = 6
export const MEMORY_BASE = 1000
export const MEMORY_TIME_BONUS_MAX = 1000
export const MEMORY_MAX_SCORE = MEMORY_BASE + MEMORY_TIME_BONUS_MAX // 2000

// Score a completed game from the number of attempts (pairs of flips) and the
// elapsed seconds:
//   score = BASE + timeBonus - movePenalty
//   timeBonus  decays by 10/sec to 0 at 100s
//   movePenalty is 25 per attempt beyond the perfect minimum (one per pair)
// Clamped to [0, MEMORY_MAX_SCORE] so it can never go negative or exceed the
// cap the server enforces.
export function computeMemoryScore(attempts, seconds, pairs = MEMORY_PAIRS) {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const safeAttempts = Math.max(0, Math.floor(attempts))
  const timeBonus = Math.max(0, MEMORY_TIME_BONUS_MAX - safeSeconds * 10)
  const movePenalty = Math.max(0, safeAttempts - pairs) * 25
  const raw = MEMORY_BASE + timeBonus - movePenalty
  return Math.max(0, Math.min(MEMORY_MAX_SCORE, Math.round(raw)))
}
