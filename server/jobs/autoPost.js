import { PrismaClient } from '@prisma/client';
import { makeVerticalClip, generateCaption } from '../services/clipMaker.js';
import { readFileSync, unlinkSync } from 'fs';

const prisma = new PrismaClient();

/**
 * Auto-post the best highlight from yesterday's Sharks game to TikTok.
 * Picks the "best" goal by priority: GWG > OT > PPG > latest goal
 */
export async function autoPostHighlight(tiktokTokens) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfDay = new Date(yesterday.toISOString().split('T')[0]);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // Find yesterday's Sharks game
  const game = await prisma.game.findFirst({
    where: {
      gameDate: { gte: startOfDay, lt: endOfDay },
    },
    include: {
      goals: {
        where: { isSharksGoal: true, brightcoveId: { not: null } },
        include: { scorer: true },
        orderBy: { periodTime: 'desc' },
      },
    },
  });

  if (!game || game.goals.length === 0) {
    console.log('[auto-post] No Sharks game or no goals yesterday');
    return null;
  }

  // Pick the best goal
  const bestGoal = pickBestGoal(game.goals);
  bestGoal.game = game;

  console.log(`[auto-post] Selected: ${bestGoal.scorerName} (${bestGoal.goalType || 'EV'}) vs ${game.opponentAbbrev}`);

  // Generate vertical clip
  const clipPath = await makeVerticalClip(bestGoal);
  const caption = await generateCaption(bestGoal);

  console.log(`[auto-post] Clip generated: ${clipPath}`);
  console.log(`[auto-post] Caption: ${caption}`);

  // Post to TikTok if connected
  if (tiktokTokens?.accessToken) {
    try {
      const videoBuffer = readFileSync(clipPath);

      // Init TikTok upload
      const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tiktokTokens.accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          post_info: {
            title: caption.substring(0, 2200),
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_stitch: false,
            disable_comment: false,
            video_cover_timestamp_ms: 3000,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: videoBuffer.length,
            chunk_size: videoBuffer.length,
            total_chunk_count: 1,
          },
        }),
      });

      const initData = await initRes.json();

      if (initData.error?.code !== 'ok') {
        console.error('[auto-post] TikTok init failed:', initData);
        return { error: 'TikTok init failed', detail: initData };
      }

      const { publish_id, upload_url } = initData.data;

      // Upload
      await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': String(videoBuffer.length),
          'Content-Range': `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
        },
        body: videoBuffer,
      });

      console.log(`[auto-post] Posted to TikTok! Publish ID: ${publish_id}`);

      // Cleanup
      try { unlinkSync(clipPath); } catch {}

      return {
        success: true,
        publishId: publish_id,
        goal: bestGoal.scorerName,
        caption,
      };
    } catch (err) {
      console.error('[auto-post] TikTok post error:', err);
      return { error: err.message };
    }
  } else {
    console.log('[auto-post] TikTok not connected — clip saved but not posted');
    return {
      clipPath,
      caption,
      goal: bestGoal.scorerName,
      message: 'TikTok not connected. Clip generated but not posted.',
    };
  }
}

/**
 * Pick the "best" goal from a game for TikTok.
 * Priority: GWG > OT > PPG > last Sharks goal of the game
 */
function pickBestGoal(goals) {
  const gwg = goals.find(g => g.isGameWinning);
  if (gwg) return gwg;

  const ot = goals.find(g => g.isOvertimeGoal);
  if (ot) return ot;

  const ppg = goals.find(g => g.goalType === 'PP');
  if (ppg) return ppg;

  // Return the last goal scored (most dramatic moment usually)
  return goals[0];
}
