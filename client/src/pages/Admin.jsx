import { useState, useEffect } from 'react';
import { getGoals, getPlayers } from '../api';
import HighlightModal from '../components/HighlightModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function Admin() {
  const [tiktokStatus, setTiktokStatus] = useState(null);
  const [players, setPlayers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [previewGoal, setPreviewGoal] = useState(null);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch(`${API}/api/tiktok/status`).then(r => r.json()).then(setTiktokStatus);
    getPlayers().then(setPlayers);
    getGoals({ limit: 50, sharksOnly: 'true' }).then(d => setGoals(d.goals));
  }, []);

  async function handlePost() {
    if (!selectedGoal) return;
    setPosting(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/tiktok/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId: selectedGoal.id, caption }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setPosting(false);
    }
  }

  function generateCaption(goal) {
    if (!goal) return '';
    const date = new Date(goal.game?.gameDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const type = goal.goalType === 'PP' ? 'PPG ' : goal.isGameWinning ? 'GWG ' : '';
    return `${goal.scorerName} ${type}vs ${goal.game?.opponentAbbrev} (${date}) #SanJoseSharks #NHL #Hockey #SJSharks #Sharks`;
  }

  const filteredGoals = filter
    ? goals.filter(g => g.scorerId === filter)
    : goals;

  const scorers = players
    .filter(p => p._count?.goals > 0)
    .sort((a, b) => (b._count?.goals || 0) - (a._count?.goals || 0));

  return (
    <div className="page">
      <h1 className="page-title">TikTok Auto-Post</h1>
      <p className="page-subtitle">Post Sharks highlights to TikTok</p>

      {/* Connection Status */}
      <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>TikTok Connection</h3>
        {tiktokStatus?.connected ? (
          <div style={{ color: '#22c55e', fontWeight: 600 }}>
            Connected (ID: {tiktokStatus.openId})
            <span style={{ color: 'var(--gray)', fontWeight: 400, marginLeft: 12 }}>
              Expires: {tiktokStatus.expiresAt}
            </span>
          </div>
        ) : (
          <div>
            <span style={{ color: '#dc2626', fontWeight: 600, marginRight: 16 }}>Not connected</span>
            <a
              href={`${API}/auth/tiktok/auth`}
              style={{
                background: 'var(--teal)', color: 'white', padding: '8px 20px',
                borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}
            >
              Connect TikTok Account
            </a>
          </div>
        )}
      </div>

      {/* Goal Selector */}
      <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Select Highlight to Post</h3>

        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Players</option>
            {scorers.map(p => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p._count?.goals})</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 8 }}>
          {filteredGoals.map(g => (
            <div
              key={g.id}
              onClick={() => {
                setSelectedGoal(g);
                setCaption(generateCaption(g));
              }}
              style={{
                padding: 12,
                borderRadius: 8,
                cursor: 'pointer',
                border: selectedGoal?.id === g.id ? '2px solid var(--teal)' : '1px solid var(--dark-border)',
                background: selectedGoal?.id === g.id ? 'rgba(0,109,117,0.15)' : 'var(--dark)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontWeight: 700 }}>{g.scorerName}</span>
                <span style={{ color: 'var(--gray)', fontSize: 13, marginLeft: 8 }}>
                  {g.goalType === 'PP' && '(PPG) '}
                  {g.isGameWinning && '(GWG) '}
                  vs {g.game?.opponentAbbrev} P{g.period} {g.periodTime}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setPreviewGoal(g); }}
                style={{ background: 'none', border: '1px solid var(--dark-border)', borderRadius: 6, color: 'var(--gray)', padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}
              >
                Preview
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Caption & Post */}
      {selectedGoal && (
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--teal)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12 }}>Post to TikTok</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--gray)', marginBottom: 4, fontWeight: 600 }}>Caption</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={3}
              maxLength={2200}
              style={{
                width: '100%', background: 'var(--dark)', border: '1px solid var(--dark-border)',
                borderRadius: 8, padding: 10, color: 'var(--white)', fontSize: 14,
                fontFamily: 'var(--sans)', resize: 'vertical',
              }}
            />
            <span style={{ fontSize: 11, color: 'var(--gray)', float: 'right' }}>{caption.length}/2200</span>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={handlePost}
              disabled={posting || !tiktokStatus?.connected}
              style={{
                background: posting ? 'var(--gray)' : '#fe2c55',
                color: 'white', border: 'none', borderRadius: 8,
                padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {posting ? 'Posting...' : 'Post to TikTok'}
            </button>
            {!tiktokStatus?.connected && (
              <span style={{ color: '#dc2626', fontSize: 13 }}>Connect TikTok first</span>
            )}
          </div>

          {result && (
            <div style={{
              marginTop: 16, padding: 12, borderRadius: 8,
              background: result.success ? 'rgba(34,197,94,0.15)' : 'rgba(220,38,38,0.15)',
              border: `1px solid ${result.success ? '#22c55e' : '#dc2626'}`,
            }}>
              {result.success ? (
                <div>
                  <div style={{ color: '#22c55e', fontWeight: 700 }}>Posted to TikTok!</div>
                  <div style={{ color: 'var(--gray)', fontSize: 13, marginTop: 4 }}>
                    Publish ID: {result.publishId}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#dc2626' }}>
                  Error: {result.error || JSON.stringify(result.detail)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {previewGoal && (
        <HighlightModal goal={previewGoal} onClose={() => setPreviewGoal(null)} />
      )}
    </div>
  );
}
