import { useState } from 'react';
import { Link } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import Reactions from './Reactions';

function getBadges(goal) {
  const badges = [];
  if (goal.goalType === 'PP') badges.push({ label: 'PPG', cls: 'badge-pp' });
  else if (goal.goalType === 'SH') badges.push({ label: 'SHG', cls: 'badge-sh' });
  if (goal.isEmptyNet) badges.push({ label: 'EN', cls: 'badge-en' });
  if (goal.isGameWinning) badges.push({ label: 'GWG', cls: 'badge-gwg' });
  if (goal.isOvertimeGoal) badges.push({ label: 'OT', cls: 'badge-ot' });
  return badges;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function GoalCard({ goal, showOpponent = true }) {
  const badges = getBadges(goal);
  const assists = [goal.assist1Name, goal.assist2Name].filter(Boolean);
  const game = goal.game;

  return (
    <div className="goal-card">
      <VideoPlayer brightcoveId={goal.brightcoveId} />
      <div className="goal-info">
        <div className="goal-header">
          {goal.scorer?.headshotUrl && (
            <img className="scorer-img" src={goal.scorer.headshotUrl} alt="" />
          )}
          <div>
            <div className="scorer-name">
              {goal.scorer ? (
                <Link to={`/players/${goal.scorer.id}`}>{goal.scorerName}</Link>
              ) : goal.scorerName}
            </div>
            <div className="goal-meta">
              P{goal.period} {goal.periodTime}
              {goal.shotType && ` \u2022 ${goal.shotType}`}
              {assists.length > 0 && ` \u2022 from ${assists.join(', ')}`}
            </div>
          </div>
        </div>
        {showOpponent && game && (
          <div className="goal-meta" style={{ marginBottom: 4 }}>
            {formatDate(game.gameDate)} {game.isHome ? 'vs' : '@'} {game.opponentAbbrev}
            {game.homeScore != null && ` \u2022 ${game.isHome ? 'SJS' : game.opponentAbbrev} ${game.homeScore}-${game.awayScore} ${game.isHome ? game.opponentAbbrev : 'SJS'}`}
          </div>
        )}
        {badges.length > 0 && (
          <div className="goal-badges">
            {badges.map(b => <span key={b.label} className={`badge ${b.cls}`}>{b.label}</span>)}
          </div>
        )}
      </div>
      <Reactions goalId={goal.id} />
    </div>
  );
}
