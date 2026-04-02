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
import { syncGames } from './jobs/syncGames.js';
import { syncRoster } from './jobs/syncRoster.js';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/games', gamesRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/clips', clipsRoutes);
app.use('/api/stats', statsRoutes);

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
