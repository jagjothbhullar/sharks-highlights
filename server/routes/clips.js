import { Router } from 'express';
import { getPlaybackUrl } from '../services/brightcove.js';

const router = Router();

// GET /api/clips/:brightcoveId/playback — resolve to fresh MP4 URL
router.get('/:brightcoveId/playback', async (req, res) => {
  try {
    const url = await getPlaybackUrl(req.params.brightcoveId);
    res.json({ url });
  } catch (err) {
    console.error('[clips] Error:', err);
    res.status(502).json({ error: 'Failed to resolve video URL' });
  }
});

export default router;
