import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/stats/leaders — top scorers, most PPG, most GWG
router.get('/leaders', async (req, res) => {
  try {
    const [topScorers, topPoints, topPPG, topGWG] = await Promise.all([
      prisma.seasonStats.findMany({
        where: { goals: { gt: 0 } },
        orderBy: { goals: 'desc' },
        take: 10,
        include: { player: true },
      }),
      prisma.seasonStats.findMany({
        where: { points: { gt: 0 } },
        orderBy: { points: 'desc' },
        take: 10,
        include: { player: true },
      }),
      prisma.seasonStats.findMany({
        where: { ppGoals: { gt: 0 } },
        orderBy: { ppGoals: 'desc' },
        take: 5,
        include: { player: true },
      }),
      prisma.seasonStats.findMany({
        where: { gwGoals: { gt: 0 } },
        orderBy: { gwGoals: 'desc' },
        take: 5,
        include: { player: true },
      }),
    ]);

    res.json({ topScorers, topPoints, topPPG, topGWG });
  } catch (err) {
    console.error('[stats] Error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/stats/summary — season aggregate stats
router.get('/summary', async (req, res) => {
  try {
    const [totalGoals, goalsByType, goalsByPeriod, totalGames] = await Promise.all([
      prisma.goal.count({ where: { isSharksGoal: true } }),
      prisma.goal.groupBy({
        by: ['goalType'],
        where: { isSharksGoal: true },
        _count: true,
      }),
      prisma.goal.groupBy({
        by: ['period'],
        where: { isSharksGoal: true },
        _count: true,
        orderBy: { period: 'asc' },
      }),
      prisma.game.count(),
    ]);

    res.json({
      totalGoals,
      totalGames,
      goalsPerGame: totalGames > 0 ? (totalGoals / totalGames).toFixed(2) : 0,
      goalsByType: goalsByType.map(g => ({ type: g.goalType, count: g._count })),
      goalsByPeriod: goalsByPeriod.map(g => ({ period: g.period, count: g._count })),
    });
  } catch (err) {
    console.error('[stats] Error:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
