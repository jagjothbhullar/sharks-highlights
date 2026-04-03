import { useState, useEffect } from 'react';
import { getYearbookEntries } from '../api';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatGoalRef(goal) {
  if (!goal) return null;
  const date = formatDate(goal.game?.gameDate);
  const type = goal.goalType === 'PP' ? 'PPG' : goal.goalType === 'SH' ? 'SHG' : '';
  return `${date} vs ${goal.game?.opponentAbbrev} P${goal.period} ${goal.periodTime}${type ? ` (${type})` : ''}`;
}

export default function YearbookWall({ playerId, refreshKey }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getYearbookEntries(playerId).then(data => {
      setEntries(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [playerId, refreshKey]);

  if (loading) return null;
  if (entries.length === 0) return null;

  return (
    <div className="yearbook-wall">
      <h2 className="wall-title">Yearbook Signatures ({entries.length})</h2>
      <div className="signatures-grid">
        {entries.map(entry => (
          <div key={entry.id} className="signature-card">
            <div className="signature-header">
              <span className="signer-name">{entry.signerName}</span>
              <span className="sign-date">{formatDate(entry.createdAt)}</span>
            </div>
            <p className="signature-note">{entry.note}</p>
            {entry.favoriteGoal && (
              <div className="fav-highlight">
                <span className="fav-label">Fav highlight:</span> {formatGoalRef(entry.favoriteGoal)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
