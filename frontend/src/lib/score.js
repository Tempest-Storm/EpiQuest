// Number of seconds allotted to answer each question.
export const MAX_TIME = 20

// Points awarded for a correct answer: a flat base plus a time bonus that
// rewards answering quickly. A correct answer at full time is worth
// BASE_POINTS + TIME_BONUS; at the last instant it is worth BASE_POINTS.
export const BASE_POINTS = 50
export const TIME_BONUS = 100

// Compute the points earned for a correct answer given the time left on the
// clock. timeLeft is clamped to [0, maxTime] so out-of-range inputs can never
// produce a negative or inflated score.
export function computeScore(timeLeft, maxTime = MAX_TIME) {
  const clamped = Math.max(0, Math.min(timeLeft, maxTime))
  return Math.ceil((clamped / maxTime) * TIME_BONUS) + BASE_POINTS
}
