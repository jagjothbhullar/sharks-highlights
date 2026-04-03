const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function fetchJson(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export function getPlayers() {
  return fetchJson('/api/players');
}

export function getPlayer(id) {
  return fetchJson(`/api/players/${id}`);
}

export function getGames(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return fetchJson(`/api/games${qs ? `?${qs}` : ''}`);
}

export function getGame(id) {
  return fetchJson(`/api/games/${id}`);
}

export function getGoals(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return fetchJson(`/api/goals${qs ? `?${qs}` : ''}`);
}

export function getClipUrl(brightcoveId) {
  return fetchJson(`/api/clips/${brightcoveId}/playback`);
}

export function getStats() {
  return fetchJson('/api/stats/leaders');
}

export function getSummary() {
  return fetchJson('/api/stats/summary');
}

export function getYearbookEntries(playerId) {
  return fetchJson(`/api/yearbook?playerId=${playerId}`);
}

export function getPopularHighlights() {
  return fetchJson('/api/yearbook/popular');
}

export async function signYearbook({ playerId, favoriteGoalId, note, signerName }) {
  const res = await fetch(`${BASE}/api/yearbook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, favoriteGoalId, note, signerName }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
