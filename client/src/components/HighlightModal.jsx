import VideoPlayer from './VideoPlayer';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HighlightModal({ goal, onClose }) {
  if (!goal) return null;

  const game = goal.game;
  const badges = [];
  if (goal.goalType === 'PP') badges.push('PPG');
  if (goal.goalType === 'SH') badges.push('SHG');
  if (goal.isEmptyNet) badges.push('EN');
  if (goal.isGameWinning) badges.push('GWG');
  if (goal.isOvertimeGoal) badges.push('OT');
  const assists = [goal.assist1Name, goal.assist2Name].filter(Boolean);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <VideoPlayer brightcoveId={goal.brightcoveId} />
        <div className="modal-info">
          <div className="modal-scorer">
            {goal.scorer?.headshotUrl && (
              <img src={goal.scorer.headshotUrl} alt="" className="modal-headshot" />
            )}
            <div>
              <div className="modal-name">{goal.scorerName}</div>
              <div className="modal-meta">
                P{goal.period} {goal.periodTime}
                {goal.shotType && ` \u2022 ${goal.shotType}`}
                {assists.length > 0 && ` \u2022 from ${assists.join(', ')}`}
              </div>
            </div>
          </div>
          {game && (
            <div className="modal-game">
              {formatDate(game.gameDate)} {game.isHome ? 'vs' : '@'} {game.opponentAbbrev}
            </div>
          )}
          {badges.length > 0 && (
            <div className="goal-badges" style={{ marginTop: 8 }}>
              {badges.map(b => (
                <span key={b} className={`badge badge-${b.toLowerCase()}`}>{b}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
