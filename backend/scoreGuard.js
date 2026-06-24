// Highest score a single question can yield: BASE_POINTS (50) + TIME_BONUS
// (100). Kept in sync with frontend/src/lib/score.js.
const MAX_POINTS_PER_QUESTION = 150

// Server-side sanity check for client-computed scores. A run cannot have more
// correct answers than there are questions, and each correct answer is worth
// at most MAX_POINTS_PER_QUESTION, so this is a tight upper bound that never
// rejects a legitimate submission.
function isPlausibleScore(score, correct, totalQuestions, maxPerQuestion = MAX_POINTS_PER_QUESTION) {
  if (correct > totalQuestions) return false
  if (score > correct * maxPerQuestion) return false
  return true
}

module.exports = { MAX_POINTS_PER_QUESTION, isPlausibleScore }
