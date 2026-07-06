// Scoring for "Code dans l'ordre". Kept in sync with the server-side guard in
// backend/scoreGuard.js (CODE_ROUNDS, MAX_CODE_SCORE).
export const CODE_ROUNDS = 4
export const CODE_ROUND_BASE = 200 // full credit for placing every line correctly
export const CODE_ROUND_BONUS = 100 // max speed bonus, only for a perfect round
export const CODE_MAX_SCORE = CODE_ROUNDS * (CODE_ROUND_BASE + CODE_ROUND_BONUS) // 1200

// Score a single round:
//   placement = share of lines in their correct position × CODE_ROUND_BASE
//   bonus     = speed bonus (decays 5/sec), ONLY if the round is perfect
// Clamped to [0, CODE_ROUND_BASE + CODE_ROUND_BONUS].
export function scoreRound(linesCorrect, totalLines, seconds, perfect) {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const placement = totalLines > 0 ? Math.round((linesCorrect / totalLines) * CODE_ROUND_BASE) : 0
  const bonus = perfect ? Math.max(0, CODE_ROUND_BONUS - safeSeconds * 5) : 0
  const max = CODE_ROUND_BASE + CODE_ROUND_BONUS
  return Math.max(0, Math.min(max, placement + bonus))
}

// How many lines sit in their correct position.
export function countCorrect(order, solution) {
  return order.reduce((n, line, i) => (line === solution[i] ? n + 1 : n), 0)
}

// True when the arrangement exactly matches the solution.
export function isSolved(order, solution) {
  return order.length === solution.length && order.every((line, i) => line === solution[i])
}
