import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/yearbook?playerId=X — signatures for a player
router.get('/', async (req, res) => {
  try {
    const { playerId } = req.query;
    const where = playerId ? { playerId } : {};

    const entries = await prisma.yearbookEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        player: { select: { firstName: true, lastName: true, headshotUrl: true } },
        favoriteGoal: {
          select: {
            id: true, scorerName: true, period: true, periodTime: true,
            goalType: true, brightcoveId: true, description: true,
            game: { select: { gameDate: true, opponentAbbrev: true } },
          },
        },
      },
    });

    res.json(entries);
  } catch (err) {
    console.error('[yearbook] Error:', err);
    res.status(500).json({ error: 'Failed to fetch yearbook entries' });
  }
});

// GET /api/yearbook/popular — most picked highlights
router.get('/popular', async (req, res) => {
  try {
    const popular = await prisma.yearbookEntry.groupBy({
      by: ['favoriteGoalId'],
      where: { favoriteGoalId: { not: null } },
      _count: true,
      orderBy: { _count: { favoriteGoalId: 'desc' } },
      take: 10,
    });

    const goalIds = popular.map(p => p.favoriteGoalId).filter(Boolean);
    const goals = await prisma.goal.findMany({
      where: { id: { in: goalIds } },
      include: {
        scorer: { select: { id: true, firstName: true, lastName: true, headshotUrl: true } },
        game: { select: { gameDate: true, opponentAbbrev: true, isHome: true } },
      },
    });

    const goalMap = Object.fromEntries(goals.map(g => [g.id, g]));
    const result = popular.map(p => ({
      goal: goalMap[p.favoriteGoalId],
      picks: p._count,
    })).filter(r => r.goal);

    res.json(result);
  } catch (err) {
    console.error('[yearbook] Error:', err);
    res.status(500).json({ error: 'Failed to fetch popular highlights' });
  }
});

// POST /api/yearbook — sign the yearbook
router.post('/', async (req, res) => {
  try {
    const { playerId, favoriteGoalId, note, signerName } = req.body;

    if (!playerId || !note?.trim() || !signerName?.trim()) {
      return res.status(400).json({ error: 'playerId, note, and signerName are required' });
    }

    if (note.length > 500) {
      return res.status(400).json({ error: 'Note must be 500 characters or less' });
    }

    if (signerName.length > 50) {
      return res.status(400).json({ error: 'Name must be 50 characters or less' });
    }

    const entry = await prisma.yearbookEntry.create({
      data: {
        playerId,
        favoriteGoalId: favoriteGoalId || null,
        note: note.trim(),
        signerName: signerName.trim(),
      },
      include: {
        player: { select: { firstName: true, lastName: true } },
        favoriteGoal: {
          select: {
            scorerName: true, period: true, periodTime: true,
            goalType: true, brightcoveId: true, description: true,
            game: { select: { gameDate: true, opponentAbbrev: true } },
          },
        },
      },
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error('[yearbook] Error:', err);
    res.status(500).json({ error: 'Failed to sign yearbook' });
  }
});

export default router;
