import { PrismaClient } from '@prisma/client';
import { getRoster, getClubStats } from '../services/nhlApi.js';

const prisma = new PrismaClient();
const SEASON = '20252026';

/**
 * Weekly sync: refresh roster and season stats.
 */
export async function syncRoster() {
  console.log('[roster-sync] Refreshing roster and stats...');

  try {
    const roster = await getRoster(SEASON);
    const allPlayers = [
      ...(roster.forwards || []),
      ...(roster.defensemen || []),
      ...(roster.goalies || []),
    ];

    for (const p of allPlayers) {
      await prisma.player.upsert({
        where: { nhlId: p.id },
        update: {
          firstName: p.firstName?.default || '',
          lastName: p.lastName?.default || '',
          positionCode: p.positionCode || '',
          sweaterNumber: p.sweaterNumber ?? null,
          headshotUrl: p.headshot || null,
        },
        create: {
          nhlId: p.id,
          firstName: p.firstName?.default || '',
          lastName: p.lastName?.default || '',
          positionCode: p.positionCode || '',
          sweaterNumber: p.sweaterNumber ?? null,
          headshotUrl: p.headshot || null,
          birthDate: p.birthDate || null,
          birthCity: p.birthCity?.default || null,
          birthCountry: p.birthCountry || null,
          heightInches: p.heightInInches ?? null,
          weightPounds: p.weightInPounds ?? null,
          shootsCatches: p.shootsCatches || null,
        },
      });
    }

    // Refresh season stats
    const stats = await getClubStats(SEASON);
    for (const s of (stats.skaters || [])) {
      const player = await prisma.player.findUnique({ where: { nhlId: s.playerId } });
      if (!player) continue;

      await prisma.seasonStats.upsert({
        where: { playerId: player.id },
        update: {
          gamesPlayed: s.gamesPlayed ?? 0,
          goals: s.goals ?? 0,
          assists: s.assists ?? 0,
          points: s.points ?? 0,
          plusMinus: s.plusMinus ?? 0,
          pim: s.penaltyMinutes ?? 0,
          ppGoals: s.powerPlayGoals ?? 0,
          shGoals: s.shorthandedGoals ?? 0,
          gwGoals: s.gameWinningGoals ?? 0,
          shots: s.shots ?? 0,
          shootingPct: s.shootingPctg ?? 0,
          avgToi: s.avgTimeOnIce ? String(s.avgTimeOnIce) : null,
          faceoffPct: s.faceoffWinPctg ?? null,
        },
        create: {
          playerId: player.id,
          season: SEASON,
          gamesPlayed: s.gamesPlayed ?? 0,
          goals: s.goals ?? 0,
          assists: s.assists ?? 0,
          points: s.points ?? 0,
          plusMinus: s.plusMinus ?? 0,
          pim: s.penaltyMinutes ?? 0,
          ppGoals: s.powerPlayGoals ?? 0,
          shGoals: s.shorthandedGoals ?? 0,
          gwGoals: s.gameWinningGoals ?? 0,
          shots: s.shots ?? 0,
          shootingPct: s.shootingPctg ?? 0,
          avgToi: s.avgTimeOnIce ? String(s.avgTimeOnIce) : null,
          faceoffPct: s.faceoffWinPctg ?? null,
        },
      });
    }

    console.log(`[roster-sync] Done — ${allPlayers.length} players, ${(stats.skaters || []).length} stat lines`);
  } catch (err) {
    console.error('[roster-sync] Error:', err);
  }
}
