/**
 * Parse play-by-play data and landing data to extract all goals with video clip IDs.
 */

export function parseGoals(playByPlay, landing) {
  const plays = playByPlay.plays || [];
  const goalPlays = plays.filter(p => p.typeDescKey === 'goal');

  // Build a map of highlight clips from landing data
  const clipMap = buildClipMap(landing);

  return goalPlays.map(play => {
    const details = play.details || {};
    const scoringTeam = details.eventOwnerTeamId;
    const homeTeamId = playByPlay.homeTeam?.id;
    const awayTeamId = playByPlay.awayTeam?.id;
    const homeAbbrev = playByPlay.homeTeam?.abbrev;
    const awayAbbrev = playByPlay.awayTeam?.abbrev;

    const isSharksGoal = (scoringTeam === homeTeamId && homeAbbrev === 'SJS') ||
                         (scoringTeam === awayTeamId && awayAbbrev === 'SJS');

    const scorerName = buildPlayerName(details.scoringPlayerId, playByPlay);
    const assist1Name = details.assist1PlayerId
      ? buildPlayerName(details.assist1PlayerId, playByPlay)
      : null;
    const assist2Name = details.assist2PlayerId
      ? buildPlayerName(details.assist2PlayerId, playByPlay)
      : null;

    // Try to find a matching highlight clip
    const brightcoveId = findClipForGoal(play, clipMap, isSharksGoal);

    return {
      nhlEventId: play.eventId,
      scorerNhlId: details.scoringPlayerId,
      scorerName,
      assist1Name,
      assist2Name,
      period: play.periodDescriptor?.number || play.period,
      periodTime: play.timeInPeriod || '',
      periodType: play.periodDescriptor?.periodType || 'REG',
      shotType: details.shotType || null,
      goalType: details.goalType || play.typeDescKey === 'goal' ? mapStrength(details) : null,
      isEmptyNet: details.emptyNet || false,
      isGameWinning: details.gameWinningGoal || false,
      isOvertimeGoal: (play.periodDescriptor?.number || 0) > 3,
      scoringTeam: scoringTeam === homeTeamId ? homeAbbrev : awayAbbrev,
      isSharksGoal,
      homeScore: details.homeScore ?? play.homeScore ?? 0,
      awayScore: details.awayScore ?? play.awayScore ?? 0,
      brightcoveId,
      description: play.description || details.descKey || null,
    };
  });
}

function buildPlayerName(playerId, playByPlay) {
  const roster = [
    ...(playByPlay.rosterSpots || []),
  ];
  const player = roster.find(p => p.playerId === playerId);
  if (player) {
    return `${player.firstName?.default || ''} ${player.lastName?.default || ''}`.trim();
  }
  return `Player #${playerId}`;
}

function mapStrength(details) {
  if (details.strength === 'pp' || details.strength === 'PPG') return 'PP';
  if (details.strength === 'sh' || details.strength === 'SHG') return 'SH';
  return 'EV';
}

function buildClipMap(landing) {
  const clips = {};
  if (!landing) return clips;

  // Landing data has highlight sections with video clips
  const highlights = landing.summary?.scoring || [];
  for (const period of highlights) {
    for (const goal of (period.goals || [])) {
      // The highlightClip field contains the brightcove video ID in the URL
      const clip = goal.highlightClip;
      if (clip) {
        const bcId = typeof clip === 'number' ? String(clip) :
          typeof clip === 'string' ? (clip.match(/(\d{10,})/)?.[1] || null) : null;
        if (bcId) {
          const key = `${goal.firstName?.default || ''}-${goal.period}-${goal.timeInPeriod}`;
          clips[key] = bcId;
          if (goal.playerId) {
            clips[`pid-${goal.playerId}-${goal.period}-${goal.timeInPeriod}`] = bcId;
          }
        }
      }
    }
  }
  return clips;
}

function findClipForGoal(play, clipMap, isSharksGoal) {
  const details = play.details || {};
  const period = play.periodDescriptor?.number || play.period;
  const time = play.timeInPeriod || '';

  // Try by player ID
  if (details.scoringPlayerId) {
    const key = `pid-${details.scoringPlayerId}-${period}-${time}`;
    if (clipMap[key]) return clipMap[key];
  }

  // Try by highlight clip URL directly from landing
  // Fall through to null if no match
  return null;
}
