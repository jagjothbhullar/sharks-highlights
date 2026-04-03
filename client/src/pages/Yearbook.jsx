import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlayers, getRandomGoal } from '../api';
import HighlightModal from '../components/HighlightModal';

const POSITION_ORDER = { F: 0, D: 1, G: 2 };
const POSITION_LABELS = { F: 'Forwards', D: 'Defensemen', G: 'Goalies' };

function positionGroup(code) {
  if (['C', 'L', 'R', 'LW', 'RW'].includes(code)) return 'F';
  if (code === 'D') return 'D';
  return 'G';
}

export default function Yearbook() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [randomGoal, setRandomGoal] = useState(null);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getPlayers().then(data => {
      setPlayers(data);
      setLoading(false);
    });
  }, []);

  async function handleRandom() {
    setLoadingRandom(true);
    try {
      const goal = await getRandomGoal();
      setRandomGoal(goal);
    } catch {
      // ignore
    } finally {
      setLoadingRandom(false);
    }
  }

  const filtered = useMemo(() => {
    if (!search) return players;
    const q = search.toLowerCase();
    return players.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      String(p.sweaterNumber).includes(q)
    );
  }, [players, search]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const p of filtered) {
      const g = positionGroup(p.positionCode);
      if (!groups[g]) groups[g] = [];
      groups[g].push(p);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => POSITION_ORDER[a] - POSITION_ORDER[b]);
  }, [filtered]);

  if (loading) return <div className="loading">Loading roster...</div>;

  return (
    <div className="page">
      <h1 className="page-title">Sharks Yearbook</h1>
      <p className="page-subtitle">2025-26 Season  &middot; Click a player to see all their highlights</p>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="random-btn" onClick={handleRandom} disabled={loadingRandom}>
          <span className="dice">&#127922;</span>
          {loadingRandom ? 'Loading...' : 'Random Highlight'}
        </button>
      </div>

      {randomGoal && (
        <HighlightModal goal={randomGoal} onClose={() => setRandomGoal(null)} />
      )}

      {grouped.map(([group, groupPlayers]) => (
        <div key={group} className="position-group">
          <h3>{POSITION_LABELS[group]}</h3>
          <div className="yearbook-grid">
            {groupPlayers.map(p => (
              <div
                key={p.id}
                className="player-tile"
                onClick={() => navigate(`/players/${p.id}`)}
              >
                {p._count?.goals > 0 && (
                  <div className="goal-count">{p._count.goals} goals</div>
                )}
                <img
                  src={p.headshotUrl || `https://ui-avatars.com/api/?name=${p.firstName}+${p.lastName}&background=232340&color=fff&size=100`}
                  alt={`${p.firstName} ${p.lastName}`}
                />
                <div className="name">{p.firstName} {p.lastName}</div>
                <div className="number">#{p.sweaterNumber} &middot; {p.positionCode}</div>
                {p.seasonStats && (
                  <div className="stats">
                    {p.seasonStats.goals}G {p.seasonStats.assists}A {p.seasonStats.points}P
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
