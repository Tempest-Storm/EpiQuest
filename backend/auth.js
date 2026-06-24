const jwt = require('jsonwebtoken')

// Express middleware that authenticates a request from a Bearer JWT.
// On success it attaches the decoded payload to req.user and calls next();
// otherwise it responds 401. The signing secret is read from
// process.env.JWT_SECRET at call time so it stays in sync with the rest
// of the app's configuration.
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = { authMiddleware }
