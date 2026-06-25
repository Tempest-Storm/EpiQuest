// Safely decode the payload of a JWT without verifying its signature.
// Returns null for anything malformed so callers can redirect to login
// instead of crashing.
export function decodeToken(t) {
  try {
    return JSON.parse(atob(t.split('.')[1]))
  } catch {
    return null
  }
}
