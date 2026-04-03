import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { makeVerticalClip, generateCaption } from '../services/clipMaker.js';
import { readFileSync, unlinkSync } from 'fs';

const router = Router();
const prisma = new PrismaClient();

// POST /api/clip-maker/preview — generate a vertical clip and return it
router.post('/preview', async (req, res) => {
  const { goalId } = req.body;
  if (!goalId) return res.status(400).json({ error: 'goalId required' });

  try {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { scorer: true, game: true },
    });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    console.log(`[clip-maker] Generating vertical clip for ${goal.scorerName}...`);
    const outputPath = await makeVerticalClip(goal);
    const caption = await generateCaption(goal);

    // Stream the file back
    const videoBuffer = readFileSync(outputPath);
    try { unlinkSync(outputPath); } catch {}

    res.json({
      caption,
      videoBase64: videoBuffer.toString('base64'),
      videoSize: videoBuffer.length,
      goal: {
        scorer: goal.scorerName,
        opponent: goal.game?.opponentAbbrev,
        period: goal.period,
        time: goal.periodTime,
        type: goal.goalType,
      },
    });
  } catch (err) {
    console.error('[clip-maker] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clip-maker/generate — generate clip and return download URL
router.post('/generate', async (req, res) => {
  const { goalId } = req.body;
  if (!goalId) return res.status(400).json({ error: 'goalId required' });

  try {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { scorer: true, game: true },
    });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    console.log(`[clip-maker] Generating vertical clip for ${goal.scorerName}...`);
    const outputPath = await makeVerticalClip(goal);
    const caption = await generateCaption(goal);

    // Serve the file temporarily
    const filename = `sharks-${goal.scorerName.replace(/\s/g, '-').toLowerCase()}-${goal.id.slice(0, 8)}.mp4`;

    res.json({
      caption,
      downloadUrl: `/api/clip-maker/download/${goal.id}`,
      filename,
    });
  } catch (err) {
    console.error('[clip-maker] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clip-maker/download/:goalId — serve a generated clip
router.get('/download/:goalId', async (req, res) => {
  const { goalId } = req.params;
  const path = `${process.cwd()}/tmp/tiktok-${goalId}.mp4`;

  try {
    const buffer = readFileSync(path);
    res.set('Content-Type', 'video/mp4');
    res.set('Content-Disposition', `attachment; filename="sharks-clip-${goalId.slice(0, 8)}.mp4"`);
    res.send(buffer);
  } catch {
    res.status(404).json({ error: 'Clip not found — generate it first' });
  }
});

export default router;
