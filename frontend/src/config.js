// Base URL of the EpiQuest backend (REST API + Socket.io).
// Override per-environment with VITE_API_URL (see .env.example);
// falls back to the local dev server.
export const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
