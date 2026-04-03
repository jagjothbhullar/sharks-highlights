import { useState, useEffect } from 'react';
import { getYearbookEntries } from '../api';
import VideoPlayer from './VideoPlayer';

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
  const [expandedClip, setExpandedClip] = useState(null);

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
              <>
                <div
                  className="fav-highlight fav-highlight-link"
                  onClick={() => setExpandedClip(expandedClip === entry.id ? null : entry.id)}
                >
                  <span className="fav-label">Fav highlight:</span> {formatGoalRef(entry.favoriteGoal)}
                  <span className="fav-expand">{expandedClip === entry.id ? '\u25B2' : '\u25B6'}</span>
                </div>
                {expandedClip === entry.id && entry.favoriteGoal.brightcoveId && (
                  <div className="fav-video">
                    <VideoPlayer brightcoveId={entry.favoriteGoal.brightcoveId} />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
