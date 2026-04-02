import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/games — list all games, newest first
router.get('/', async (req, res) => {
  try {
    const { month, opponent } = req.query;
    const where = {};

    if (opponent) where.opponentAbbrev = opponent.toUpperCase();
    if (month) {
      const [year, m] = month.split('-');
      const start = new Date(`${year}-${m}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      where.gameDate = { gte: start, lt: end };
    }

    const games = await prisma.game.findMany({
      where,
      orderBy: { gameDate: 'desc' },
      include: {
        _count: { select: { goals: true } },
      },
    });

    res.json(games);
  } catch (err) {
    console.error('[games] Error:', err);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// GET /api/games/:id — single game with all goals
router.get('/:id', async (req, res) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id },
      include: {
        goals: {
          orderBy: [{ period: 'asc' }, { periodTime: 'asc' }],
          include: { scorer: true },
        },
      },
    });

    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(game);
  } catch (err) {
    console.error('[games] Error:', err);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

export default router;
