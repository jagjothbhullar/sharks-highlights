import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/goals — filterable, paginated goal archive
router.get('/', async (req, res) => {
  try {
    const {
      scorer, opponent, goalType, period, from, to,
      gwg, sharksOnly = 'true', search, sort = 'date',
      page = '1', limit = '20',
    } = req.query;

    const where = {};

    if (sharksOnly === 'true') where.isSharksGoal = true;
    if (scorer) where.scorerId = scorer;
    if (goalType) where.goalType = goalType.toUpperCase();
    if (period) where.period = parseInt(period);
    if (gwg === 'true') where.isGameWinning = true;

    if (opponent) {
      where.game = { opponentAbbrev: opponent.toUpperCase() };
    }

    if (from || to) {
      where.game = where.game || {};
      where.game.gameDate = {};
      if (from) where.game.gameDate.gte = new Date(from);
      if (to) where.game.gameDate.lte = new Date(to);
    }

    if (search) {
      where.OR = [
        { scorerName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { assist1Name: { contains: search, mode: 'insensitive' } },
        { assist2Name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const take = Math.min(parseInt(limit), 100);
    const skip = (parseInt(page) - 1) * take;

    const orderBy = sort === 'period'
      ? [{ period: 'asc' }, { periodTime: 'asc' }]
      : [{ game: { gameDate: 'desc' } }, { period: 'asc' }, { periodTime: 'asc' }];

    const [goals, total] = await Promise.all([
      prisma.goal.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          scorer: true,
          game: { select: { gameDate: true, opponentAbbrev: true, isHome: true, homeScore: true, awayScore: true, nhlGameId: true } },
        },
      }),
      prisma.goal.count({ where }),
    ]);

    res.json({
      goals,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / take),
    });
  } catch (err) {
    console.error('[goals] Error:', err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// GET /api/goals/random — random Sharks goal with a clip
router.get('/random', async (req, res) => {
  try {
    const count = await prisma.goal.count({
      where: { isSharksGoal: true, brightcoveId: { not: null } },
    });
    const skip = Math.floor(Math.random() * count);
    const [goal] = await prisma.goal.findMany({
      where: { isSharksGoal: true, brightcoveId: { not: null } },
      skip,
      take: 1,
      include: {
        scorer: true,
        game: { select: { gameDate: true, opponentAbbrev: true, isHome: true, homeScore: true, awayScore: true } },
      },
    });
    if (!goal) return res.status(404).json({ error: 'No goals found' });
    res.json(goal);
  } catch (err) {
    console.error('[goals] Error:', err);
    res.status(500).json({ error: 'Failed to fetch random goal' });
  }
});

// GET /api/goals/:id — single goal detail
router.get('/:id', async (req, res) => {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: req.params.id },
      include: { scorer: true, game: true },
    });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    console.error('[goals] Error:', err);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

export default router;
