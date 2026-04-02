import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/players — full roster with goal counts
router.get('/', async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      orderBy: { lastName: 'asc' },
      include: {
        seasonStats: true,
        _count: { select: { goals: true } },
      },
    });
    res.json(players);
  } catch (err) {
    console.error('[players] Error:', err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// GET /api/players/:id — player profile with stats and all goals
router.get('/:id', async (req, res) => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: req.params.id },
      include: {
        seasonStats: true,
        goals: {
          orderBy: { game: { gameDate: 'desc' } },
          include: {
            game: { select: { gameDate: true, opponentAbbrev: true, isHome: true, homeScore: true, awayScore: true } },
          },
        },
      },
    });
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (err) {
    console.error('[players] Error:', err);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

export default router;
