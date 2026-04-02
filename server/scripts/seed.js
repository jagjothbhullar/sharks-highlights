import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { getSchedule, getPlayByPlay, getLanding, getRoster, getClubStats } from '../services/nhlApi.js';
import { parseGoals } from '../services/goalParser.js';

const prisma = new PrismaClient();
const SEASON = '20252026';
const DELAY_MS = 300; // be polite to NHL API

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function seedRoster() {
  console.log('[seed] Fetching Sharks roster...');
  const roster = await getRoster(SEASON);

  const allPlayers = [
    ...(roster.forwards || []),
    ...(roster.defensemen || []),
    ...(roster.goalies || []),
  ];

  console.log(`[seed] Found ${allPlayers.length} players on roster`);

  for (const p of allPlayers) {
    await prisma.player.upsert({
      where: { nhlId: p.id },
      update: {
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

  console.log(`[seed] Upserted ${allPlayers.length} players`);
  return allPlayers;
}

async function seedSeasonStats() {
  console.log('[seed] Fetching season stats...');
  const stats = await getClubStats(SEASON);

  const skaters = stats.skaters || [];
  const goalies = stats.goalies || [];

  for (const s of skaters) {
    const player = await prisma.player.findUnique({ where: { nhlId: s.playerId } });
    if (!player) continue;

    await prisma.seasonStats.upsert({
      where: { playerId: player.id },
      update: {
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

  console.log(`[seed] Upserted stats for ${skaters.length} skaters`);
}

async function seedGamesAndGoals() {
  console.log('[seed] Fetching Sharks schedule...');
  const schedule = await getSchedule(SEASON);
  const games = schedule.games || [];

  // Filter to completed regular season & playoff games
  const completedGames = games.filter(g =>
    g.gameState === 'OFF' || g.gameState === 'FINAL'
  );

  console.log(`[seed] Found ${completedGames.length} completed games to process`);

  let totalGoals = 0;
  let gamesProcessed = 0;

  for (const g of completedGames) {
    const nhlGameId = g.id;

    // Skip if already seeded
    const existing = await prisma.game.findUnique({ where: { nhlGameId } });
    if (existing) {
      gamesProcessed++;
      continue;
    }

    const homeAbbrev = g.homeTeam?.abbrev || '';
    const awayAbbrev = g.awayTeam?.abbrev || '';
    const isHome = homeAbbrev === 'SJS';
    const opponentAbbrev = isHome ? awayAbbrev : homeAbbrev;

    // Extract recap/condensed video IDs from schedule data
    let recapVideoId = null;
    let condensedVideoId = null;
    if (g.threeMinRecap) {
      const match = g.threeMinRecap.match(/(\d{10,})/);
      if (match) recapVideoId = match[1];
    }
    if (g.condensedGame) {
      const match = g.condensedGame.match(/(\d{10,})/);
      if (match) condensedVideoId = match[1];
    }

    const game = await prisma.game.create({
      data: {
        nhlGameId,
        gameDate: new Date(g.gameDate),
        season: SEASON,
        gameType: String(g.gameType),
        homeTeamAbbrev: homeAbbrev,
        awayTeamAbbrev: awayAbbrev,
        homeScore: g.homeTeam?.score ?? null,
        awayScore: g.awayTeam?.score ?? null,
        isHome,
        opponentAbbrev,
        recapVideoId,
        condensedVideoId,
      },
    });

    // Fetch play-by-play and landing for goal clips
    let playByPlay, landing;
    try {
      [playByPlay, landing] = await Promise.all([
        getPlayByPlay(nhlGameId),
        getLanding(nhlGameId),
      ]);
    } catch (err) {
      console.warn(`[seed] Failed to fetch game data for ${nhlGameId}: ${err.message}`);
      gamesProcessed++;
      await sleep(DELAY_MS);
      continue;
    }

    // Parse goal clips from landing highlights
    const goalClips = extractGoalClips(landing);

    const parsedGoals = parseGoals(playByPlay, landing);

    for (const goal of parsedGoals) {
      // Try to find the Sharks player in our DB
      let scorerId = null;
      if (goal.scorerNhlId) {
        const player = await prisma.player.findUnique({ where: { nhlId: goal.scorerNhlId } });
        if (player) scorerId = player.id;
      }

      // Match brightcove clip - try parsed clip first, then landing clips
      let brightcoveId = goal.brightcoveId;
      if (!brightcoveId) {
        brightcoveId = matchClipToGoal(goal, goalClips);
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
      totalGoals++;
    }

    gamesProcessed++;
    if (gamesProcessed % 10 === 0) {
      console.log(`[seed] Processed ${gamesProcessed}/${completedGames.length} games (${totalGoals} goals so far)`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`[seed] Done! ${gamesProcessed} games, ${totalGoals} new goals inserted`);
}

/**
 * Extract goal highlight clips from the landing endpoint.
 * Landing data has scoring summary with highlight clip URLs.
 */
function extractGoalClips(landing) {
  const clips = [];
  if (!landing?.summary?.scoring) return clips;

  for (const period of landing.summary.scoring) {
    for (const goal of (period.goals || [])) {
      let brightcoveId = null;
      const clip = goal.highlightClip;
      if (clip) {
        // Can be a number (Brightcove ID directly) or a string URL
        brightcoveId = typeof clip === 'number' ? String(clip) :
          typeof clip === 'string' ? (clip.match(/(\d{10,})/)?.[1] || null) : null;
      }

      clips.push({
        playerId: goal.playerId,
        firstName: goal.firstName?.default || '',
        lastName: goal.lastName?.default || '',
        period: period.periodDescriptor?.number,
        timeInPeriod: goal.timeInPeriod,
        brightcoveId,
        teamAbbrev: goal.teamAbbrev?.default || goal.teamAbbrev || '',
      });
    }
  }
  return clips;
}

/**
 * Match a parsed goal event to a landing highlight clip
 */
function matchClipToGoal(goal, clips) {
  // Match by period + time
  const match = clips.find(c =>
    c.period === goal.period && c.timeInPeriod === goal.periodTime
  );
  if (match?.brightcoveId) return match.brightcoveId;

  // Match by scorer name + period
  const nameMatch = clips.find(c =>
    c.period === goal.period &&
    goal.scorerName.includes(c.lastName)
  );
  if (nameMatch?.brightcoveId) return nameMatch.brightcoveId;

  return null;
}

async function main() {
  console.log('[seed] Starting Sharks Highlights seed for season', SEASON);
  console.log('='.repeat(60));

  try {
    await seedRoster();
    console.log('');
    await seedSeasonStats();
    console.log('');
    await seedGamesAndGoals();
    console.log('');
    console.log('='.repeat(60));

    // Print summary
    const playerCount = await prisma.player.count();
    const gameCount = await prisma.game.count();
    const goalCount = await prisma.goal.count();
    const sharksGoalCount = await prisma.goal.count({ where: { isSharksGoal: true } });
    const clippedGoalCount = await prisma.goal.count({ where: { brightcoveId: { not: null } } });

    console.log('[seed] Summary:');
    console.log(`  Players: ${playerCount}`);
    console.log(`  Games:   ${gameCount}`);
    console.log(`  Goals:   ${goalCount} total (${sharksGoalCount} by Sharks)`);
    console.log(`  Clips:   ${clippedGoalCount} goals have video highlights`);
  } catch (err) {
    console.error('[seed] Fatal error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
