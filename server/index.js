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
import { syncGames } from './jobs/syncGames.js';
import { syncRoster } from './jobs/syncRoster.js';

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
  if (count > 0) return res.json({ message: 'Already seeded', entries: count });
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
cron.schedule('0 8 * * *', () => {
  console.log('[cron] Running nightly game sync...');
  syncGames();
}, { timezone: 'America/Los_Angeles' });

// Weekly roster/stats refresh — Monday 6 AM Pacific
cron.schedule('0 6 * * 1', () => {
  console.log('[cron] Running weekly roster sync...');
  syncRoster();
}, { timezone: 'America/Los_Angeles' });

app.listen(PORT, () => {
  console.log(`[server] Sharks Highlights API running on port ${PORT}`);
});
