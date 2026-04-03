import { useState } from 'react';
import { signYearbook } from '../api';

function formatGoalLabel(goal) {
  const date = new Date(goal.game?.gameDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const type = goal.goalType === 'PP' ? ' (PPG)' : goal.goalType === 'SH' ? ' (SHG)' : '';
  return `${date} vs ${goal.game?.opponentAbbrev} — P${goal.period} ${goal.periodTime}${type}`;
}

export default function SignYearbook({ playerId, playerName, goals, onSigned }) {
  const [open, setOpen] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [note, setNote] = useState('');
  const [favoriteGoalId, setFavoriteGoalId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!signerName.trim() || !note.trim()) return;
    setSubmitting(true);
    try {
      await signYearbook({
        playerId,
        favoriteGoalId: favoriteGoalId || null,
        note: note.trim(),
        signerName: signerName.trim(),
      });
      setSuccess(true);
      setSignerName('');
      setNote('');
      setFavoriteGoalId('');
      onSigned?.();
      setTimeout(() => { setSuccess(false); setOpen(false); }, 2000);
    } catch {
      alert('Failed to sign yearbook. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button className="sign-yearbook-btn" onClick={() => setOpen(true)}>
        Sign {playerName.split(' ')[0]}'s Yearbook
      </button>
    );
  }

  return (
    <div className="sign-yearbook-form">
      <h3>Sign {playerName}'s Yearbook</h3>
      {success ? (
        <div className="sign-success">Signed! Your entry has been added.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Your Name</label>
            <input
              value={signerName}
              onChange={e => setSignerName(e.target.value)}
              placeholder="Your name or nickname"
              maxLength={50}
              required
            />
          </div>
          <div className="form-row">
            <label>Pick Your Favorite Highlight</label>
            <select value={favoriteGoalId} onChange={e => setFavoriteGoalId(e.target.value)}>
              <option value="">No specific highlight</option>
              {goals.filter(g => g.brightcoveId).map(g => (
                <option key={g.id} value={g.id}>{formatGoalLabel(g)}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Your Note</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={`Write something to ${playerName.split(' ')[0]}...`}
              maxLength={500}
              rows={3}
              required
            />
            <span className="char-count">{note.length}/500</span>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Signing...' : 'Sign Yearbook'}
            </button>
            <button type="button" className="cancel-btn" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
