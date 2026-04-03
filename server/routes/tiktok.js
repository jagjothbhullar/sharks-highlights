import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const router = Router();
const prisma = new PrismaClient();

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || 'https://sharks-highlights-server.onrender.com/auth/tiktok/callback';
const SERVER_URL = process.env.SERVER_URL || 'https://sharks-highlights-server.onrender.com';

// In-memory token storage (move to DB for production persistence)
let tiktokTokens = {
  accessToken: null,
  refreshToken: null,
  openId: null,
  expiresAt: null,
};

// GET /auth/tiktok — redirect to TikTok OAuth
router.get('/auth', (req, res) => {
  const csrfState = Math.random().toString(36).substring(2);
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&response_type=code&scope=video.publish&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${csrfState}`;
  res.redirect(authUrl);
});

// GET /auth/tiktok/callback — exchange code for token
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.send(`<h1>TikTok Auth Error</h1><p>${error}</p>`);
  }

  try {
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await tokenRes.json();

    if (data.access_token) {
      tiktokTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        openId: data.open_id,
        expiresAt: Date.now() + (data.expires_in * 1000),
      };
      res.send('<h1>TikTok Connected!</h1><p>You can close this window. Your account is now linked for auto-posting.</p>');
    } else {
      res.send(`<h1>Token Error</h1><pre>${JSON.stringify(data, null, 2)}</pre>`);
    }
  } catch (err) {
    res.send(`<h1>Error</h1><pre>${err.message}</pre>`);
  }
});

// Refresh token if expired
async function ensureValidToken() {
  if (!tiktokTokens.accessToken) throw new Error('Not authenticated with TikTok');

  if (tiktokTokens.expiresAt && Date.now() > tiktokTokens.expiresAt - 60000) {
    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: tiktokTokens.refreshToken,
      }),
    });
    const data = await res.json();
    if (data.access_token) {
      tiktokTokens.accessToken = data.access_token;
      tiktokTokens.refreshToken = data.refresh_token;
      tiktokTokens.expiresAt = Date.now() + (data.expires_in * 1000);
    }
  }

  return tiktokTokens.accessToken;
}

// GET /api/tiktok/status — check connection status
router.get('/status', (req, res) => {
  res.json({
    connected: !!tiktokTokens.accessToken,
    openId: tiktokTokens.openId,
    expiresAt: tiktokTokens.expiresAt ? new Date(tiktokTokens.expiresAt).toISOString() : null,
  });
});

// POST /api/tiktok/post — post a goal clip to TikTok
router.post('/post', async (req, res) => {
  const { goalId, caption } = req.body;

  try {
    const token = await ensureValidToken();

    // Get the goal and its video
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        scorer: true,
        game: true,
      },
    });

    if (!goal || !goal.brightcoveId) {
      return res.status(400).json({ error: 'Goal not found or has no video clip' });
    }

    // Resolve the MP4 URL from Brightcove
    const { getPlaybackUrl } = await import('../services/brightcove.js');
    const playback = await getPlaybackUrl(goal.brightcoveId);
    const videoUrl = playback.url;

    // Get video size
    const headRes = await fetch(videoUrl, { method: 'HEAD' });
    const videoSize = parseInt(headRes.headers.get('content-length') || '0');

    if (!videoSize) {
      return res.status(500).json({ error: 'Could not determine video size' });
    }

    // Build caption
    const date = goal.game.gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const defaultCaption = `${goal.scorerName} ${goal.goalType === 'PP' ? 'PPG' : 'goal'} vs ${goal.game.opponentAbbrev} (${date}) #SanJoseSharks #NHL #Hockey #SJSharks`;
    const postTitle = caption || defaultCaption;

    // Initialize upload with FILE_UPLOAD (download then upload)
    const videoData = await fetch(videoUrl).then(r => r.arrayBuffer());
    const videoBuffer = Buffer.from(videoData);

    const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: postTitle.substring(0, 2200),
          privacy_level: 'SELF_ONLY',
          disable_duet: false,
          disable_stitch: false,
          disable_comment: false,
          video_cover_timestamp_ms: 3000,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: videoBuffer.length,
          chunk_size: videoBuffer.length,
          total_chunk_count: 1,
        },
      }),
    });

    const initData = await initRes.json();

    if (initData.error?.code !== 'ok') {
      return res.status(502).json({ error: 'TikTok init failed', detail: initData });
    }

    const { publish_id, upload_url } = initData.data;

    // Upload the video in one chunk
    const uploadRes = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(videoBuffer.length),
        'Content-Range': `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
      },
      body: videoBuffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return res.status(502).json({ error: 'TikTok upload failed', detail: errText });
    }

    res.json({
      success: true,
      publishId: publish_id,
      caption: postTitle,
      goal: {
        scorer: goal.scorerName,
        opponent: goal.game.opponentAbbrev,
        date: goal.game.gameDate,
      },
    });
  } catch (err) {
    console.error('[tiktok] Post error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tiktok/post-random — post a random Sharks goal
router.post('/post-random', async (req, res) => {
  try {
    const count = await prisma.goal.count({
      where: { isSharksGoal: true, brightcoveId: { not: null } },
    });
    const skip = Math.floor(Math.random() * count);
    const [goal] = await prisma.goal.findMany({
      where: { isSharksGoal: true, brightcoveId: { not: null } },
      skip,
      take: 1,
    });

    if (!goal) return res.status(404).json({ error: 'No goals found' });

    // Forward to the post endpoint
    req.body = { goalId: goal.id, caption: req.body?.caption };
    return router.handle(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
export { ensureValidToken, tiktokTokens };
