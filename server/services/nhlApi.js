const BASE = 'https://api-web.nhle.com/v1';
const STATS_BASE = 'https://api.nhle.com/stats/rest/en';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NHL API ${res.status}: ${url}`);
  return res.json();
}

export async function getSchedule(season = '20252026') {
  return fetchJson(`${BASE}/club-schedule-season/SJS/${season}`);
}

export async function getPlayByPlay(gameId) {
  return fetchJson(`${BASE}/gamecenter/${gameId}/play-by-play`);
}

export async function getLanding(gameId) {
  return fetchJson(`${BASE}/gamecenter/${gameId}/landing`);
}

export async function getScoreboard(date) {
  return fetchJson(`${BASE}/score/${date}`);
}

export async function getRoster(season = '20252026') {
  return fetchJson(`${BASE}/roster/SJS/${season}`);
}

export async function getPlayerLanding(playerId) {
  return fetchJson(`${BASE}/player/${playerId}/landing`);
}

export async function getPlayerGameLog(playerId, season = '20252026', gameType = 2) {
  return fetchJson(`${BASE}/player/${playerId}/game-log/${season}/${gameType}`);
}

export async function getClubStats(season = '20252026') {
  return fetchJson(`${BASE}/club-stats/SJS/${season}/2`);
}

export async function getStandings() {
  return fetchJson(`${BASE}/standings/now`);
}
