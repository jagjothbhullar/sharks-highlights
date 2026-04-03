const ACCOUNT_ID = process.env.BRIGHTCOVE_ACCOUNT_ID || '6415718365001';
const POLICY_KEY = (process.env.BRIGHTCOVE_POLICY_KEY || 'BCpkADawqM3l37Vq8trLJ95vVwxubXYZXYglAopEZXQTHTWX3YdalyF9xmkuknxjBgiMYwt8VZ_OZ1jAjYxz_yzuNh_cjC3uOaMspVTD-hZfNUHtNnBnhVD0Gmsih8TBF8QlQFXiCQM3W_u4ydJ1qK2Rx8ZutCUg3PHb7Q').replace(/\s+/g, '');

// In-memory cache: brightcoveId -> { url, expiresAt }
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getPlaybackUrl(brightcoveId) {
  const cached = cache.get(brightcoveId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const res = await fetch(
    `https://edge.api.brightcove.com/playback/v1/accounts/${ACCOUNT_ID}/videos/${brightcoveId}`,
    { headers: { Accept: `application/json;pk=${POLICY_KEY}` } }
  );

  if (!res.ok) throw new Error(`Brightcove ${res.status} for video ${brightcoveId}`);

  const data = await res.json();
  const mp4Source = data.sources?.find(
    s => s.container === 'MP4' && s.src?.startsWith('https')
  );

  if (!mp4Source) throw new Error(`No MP4 source for video ${brightcoveId}`);

  cache.set(brightcoveId, { url: mp4Source.src, expiresAt: Date.now() + CACHE_TTL });
  return mp4Source.src;
}

export function getVideoMeta(brightcoveData) {
  return {
    name: brightcoveData.name,
    duration: brightcoveData.duration,
    thumbnail: brightcoveData.poster,
  };
}
