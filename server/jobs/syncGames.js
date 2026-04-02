import { PrismaClient } from '@prisma/client';
import { getScoreboard, getPlayByPlay, getLanding } from '../services/nhlApi.js';
import { parseGoals } from '../services/goalParser.js';

const prisma = new PrismaClient();

/**
 * Nightly sync: check yesterday's scoreboard for Sharks games,
 * fetch play-by-play, and insert new goals.
 */
export async function syncGames() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  console.log(`[sync] Checking for Sharks games on ${dateStr}...`);

  try {
    const scoreboard = await getScoreboard(dateStr);
    const games = scoreboard.games || [];

    const sharksGames = games.filter(g =>
      g.homeTeam?.abbrev === 'SJS' || g.awayTeam?.abbrev === 'SJS'
    );

    if (sharksGames.length === 0) {
      console.log('[sync] No Sharks game yesterday');
      return;
    }

    for (const g of sharksGames) {
      const nhlGameId = g.id;

      // Skip if already in DB
      const existing = await prisma.game.findUnique({ where: { nhlGameId } });
      if (existing) {
        console.log(`[sync] Game ${nhlGameId} already exists, skipping`);
        continue;
      }

      const homeAbbrev = g.homeTeam?.abbrev || '';
      const awayAbbrev = g.awayTeam?.abbrev || '';
      const isHome = homeAbbrev === 'SJS';
      const opponentAbbrev = isHome ? awayAbbrev : homeAbbrev;

      const game = await prisma.game.create({
        data: {
          nhlGameId,
          gameDate: new Date(dateStr),
          season: '20252026',
          gameType: String(g.gameType || 2),
          homeTeamAbbrev: homeAbbrev,
          awayTeamAbbrev: awayAbbrev,
          homeScore: g.homeTeam?.score ?? null,
          awayScore: g.awayTeam?.score ?? null,
          isHome,
          opponentAbbrev,
        },
      });

      // Fetch detailed data
      const [playByPlay, landing] = await Promise.all([
        getPlayByPlay(nhlGameId),
        getLanding(nhlGameId),
      ]);

      // Extract goal clips from landing
      const goalClips = [];
      if (landing?.summary?.scoring) {
        for (const period of landing.summary.scoring) {
          for (const goal of (period.goals || [])) {
            const clip = goal.highlightClip;
            let brightcoveId = null;
            if (clip) {
              brightcoveId = typeof clip === 'number' ? String(clip) :
                typeof clip === 'string' ? (clip.match(/(\d{10,})/)?.[1] || null) : null;
            }
            goalClips.push({
              playerId: goal.playerId,
              lastName: goal.lastName?.default || '',
              period: period.periodDescriptor?.number,
              timeInPeriod: goal.timeInPeriod,
              brightcoveId,
            });
          }
        }
      }

      const parsedGoals = parseGoals(playByPlay, landing);
      let newGoals = 0;

      for (const goal of parsedGoals) {
        let scorerId = null;
        if (goal.scorerNhlId) {
          const player = await prisma.player.findUnique({ where: { nhlId: goal.scorerNhlId } });
          if (player) scorerId = player.id;
        }

        let brightcoveId = goal.brightcoveId;
        if (!brightcoveId) {
          const clip = goalClips.find(c =>
            c.period === goal.period && c.timeInPeriod === goal.periodTime
          ) || goalClips.find(c =>
            c.period === goal.period && goal.scorerName.includes(c.lastName)
          );
          if (clip?.brightcoveId) brightcoveId = clip.brightcoveId;
        }

        await prisma.goal.create({
          data: {
            nhlEventId: goal.nhlEventId,
            gameId: game.id,
            scorerId,
            scorerName: goal.scorerName,
            assist1Name: goal.assist1Name,
            assist2Name: goal.assist2Name,
            period: goal.period,
            periodTime: goal.periodTime,
            periodType: goal.periodType,
            shotType: goal.shotType,
            goalType: goal.goalType,
            isEmptyNet: goal.isEmptyNet,
            isGameWinning: goal.isGameWinning,
            isOvertimeGoal: goal.isOvertimeGoal,
            scoringTeam: goal.scoringTeam,
            isSharksGoal: goal.isSharksGoal,
            homeScore: goal.homeScore,
            awayScore: goal.awayScore,
            brightcoveId,
            description: goal.description,
          },
        });
        newGoals++;
      }

      console.log(`[sync] Added game ${nhlGameId} (${opponentAbbrev}) with ${newGoals} goals`);
    }
  } catch (err) {
    console.error('[sync] Error:', err);
  }
}
