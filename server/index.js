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

// TikTok domain verification
app.get('/tiktoky7OoyzBX3geLE1pNSCohE0rv6hpgOvpV.txt', (req, res) => {
  res.type('text/plain').send('tiktok-developers-site-verification=y7OoyzBX3geLE1pNSCohE0rv6hpgOvpV');
});

// Static legal pages (for TikTok URL validation)
const legalHtml = (title, content) => `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} - Sharks Yearbook</title></head><body style="font-family:sans-serif;max-width:600px;margin:40px auto;padding:0 20px"><h1>${title}</h1><p>Last updated: April 3, 2026</p>${content}</body></html>`;

app.get('/terms', (req, res) => {
  res.send(legalHtml('Terms of Service',
    '<p>Sharks Yearbook is an unofficial fan project for browsing San Jose Sharks highlights from the 2025-26 NHL season.</p>' +
    '<ul><li>Not affiliated with the NHL or San Jose Sharks.</li><li>Video content sourced from publicly available NHL highlights.</li>' +
    '<li>Yearbook signatures are public and visible to all visitors.</li><li>We reserve the right to remove offensive content.</li>' +
    '<li>Provided as-is with no warranties.</li></ul>'
  ));
});

app.get('/privacy', (req, res) => {
  res.send(legalHtml('Privacy Policy',
    '<p>Sharks Yearbook collects minimal data:</p>' +
    '<ul><li>Yearbook signatures (name, note, selected highlight) are stored in our database and publicly visible.</li>' +
    '<li>We do not collect emails, passwords, or personal information.</li>' +
    '<li>We do not use cookies for tracking or advertising.</li>' +
    '<li>We do not sell or share data with third parties.</li></ul>'
  ));
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
