import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

import gamesRoutes from './routes/games.js';
import goalsRoutes from './routes/goals.js';
import playersRoutes from './routes/players.js';
import clipsRoutes from './routes/clips.js';
import statsRoutes from './routes/stats.js';
import yearbookRoutes from './routes/yearbook.js';
import tiktokRoutes from './routes/tiktok.js';
import clipMakerRoutes from './routes/clipMaker.js';
import { syncGames } from './jobs/syncGames.js';
import { syncRoster } from './jobs/syncRoster.js';
import { autoPostHighlight } from './jobs/autoPost.js';
import { tiktokTokens } from './routes/tiktok.js';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : true,
}));
app.use(express.json());

// Routes
app.use('/api/games', gamesRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/clips', clipsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/yearbook', yearbookRoutes);
app.use('/api/tiktok', tiktokRoutes);
app.use('/auth/tiktok', tiktokRoutes);
app.use('/api/clip-maker', clipMakerRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Sharks Yearbook API',
    season: '2025-26',
    status: 'ok',
    docs: {
      health: '/api/health',
      players: '/api/players',
      goals: '/api/goals',
      games: '/api/games',
    },
  });
});

// TikTok domain verification
app.get('/tiktoky7OoyzBX3geLE1pNSCohE0rv6hpgOvpV.txt', (req, res) => {
  res.type('text/plain').send('tiktok-developers-site-verification=y7OoyzBX3geLE1pNSCohE0rv6hpgOvpV');
});

// Static legal pages (for TikTok URL validation) — redirect to client
app.get('/terms', (req, res) => {
  res.redirect(301, `${process.env.CLIENT_URL || 'https://sharks-highlights-client.onrender.com'}/terms`);
});

app.get('/privacy', (req, res) => {
  res.redirect(301, `${process.env.CLIENT_URL || 'https://sharks-highlights-client.onrender.com'}/privacy`);
});

// Health check
app.get('/api/health', async (req, res) => {
  const gameCount = await prisma.game.count();
  const goalCount = await prisma.goal.count();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    data: { games: gameCount, goals: goalCount },
  });
});

// One-time seed endpoints (remove after initial deploy)
app.post('/api/seed-yearbook', async (req, res) => {
  const count = await prisma.yearbookEntry.count();
  if (count > 10) return res.json({ message: 'Already seeded', entries: count });
  res.json({ message: 'Yearbook seed started' });
  import('./scripts/seedYearbook.js').catch(err => console.error('[seed-yearbook] Error:', err));
});

app.post('/api/seed', async (req, res) => {
  const gameCount = await prisma.game.count();
  if (gameCount > 0) return res.json({ message: 'Already seeded', games: gameCount });
  res.json({ message: 'Seed started — check server logs' });
  // Run seed in background
  import('./scripts/seed.js').catch(err => console.error('[seed] Error:', err));
});

// Nightly game sync — 8 AM Pacific (after games are finalized + highlights posted)
cron.schedule('0 8 * * *', async () => {
  console.log('[cron] Running nightly game sync...');
  await syncGames();

  // Auto-post best highlight to TikTok 30 min after sync
  setTimeout(() => {
    console.log('[cron] Running auto-post to TikTok...');
    autoPostHighlight(tiktokTokens).catch(err => console.error('[auto-post] Error:', err));
  }, 30 * 60 * 1000);
}, { timezone: 'America/Los_Angeles' });

// Weekly roster/stats refresh — Monday 6 AM Pacific
cron.schedule('0 6 * * 1', () => {
  console.log('[cron] Running weekly roster sync...');
  syncRoster();
}, { timezone: 'America/Los_Angeles' });

app.listen(PORT, () => {
  console.log(`[server] Sharks Highlights API running on port ${PORT}`);
});
