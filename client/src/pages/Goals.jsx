import { useState, useEffect } from 'react';
import { getGoals, getPlayers } from '../api';
import GoalCard from '../components/GoalCard';

const OPPONENTS = [
  'ANA','ARI','BOS','BUF','CAR','CBJ','CGY','CHI','COL','DAL',
  'DET','EDM','FLA','LAK','MIN','MTL','NJD','NSH','NYI','NYR',
  'OTT','PHI','PIT','SEA','STL','TBL','TOR','UTA','VAN','VGK','WPG','WSH',
];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [players, setPlayers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    scorer: '', opponent: '', goalType: '', period: '', search: '',
  });

  useEffect(() => {
    getPlayers().then(setPlayers);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12, sharksOnly: 'true' };
    if (filters.scorer) params.scorer = filters.scorer;
    if (filters.opponent) params.opponent = filters.opponent;
    if (filters.goalType) params.goalType = filters.goalType;
    if (filters.period) params.period = filters.period;
    if (filters.search) params.search = filters.search;

    getGoals(params).then(data => {
      setGoals(data.goals);
      setTotal(data.total);
      setPages(data.pages);
      setLoading(false);
    });
  }, [page, filters]);

  function updateFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }

  const scorers = players
    .filter(p => p._count?.goals > 0)
    .sort((a, b) => (b._count?.goals || 0) - (a._count?.goals || 0));

  return (
    <div className="page">
      <h1 className="page-title">All Sharks Goals</h1>
      <p className="page-subtitle">2025-26 Season &middot; {total} goals</p>

      <div className="filter-bar">
        <input
          placeholder="Search..."
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
        />
        <select value={filters.scorer} onChange={e => updateFilter('scorer', e.target.value)}>
          <option value="">All Players</option>
          {scorers.map(p => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName} ({p._count?.goals})
            </option>
          ))}
        </select>
        <select value={filters.opponent} onChange={e => updateFilter('opponent', e.target.value)}>
          <option value="">All Opponents</option>
          {OPPONENTS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.goalType} onChange={e => updateFilter('goalType', e.target.value)}>
          <option value="">All Types</option>
          <option value="PP">Power Play</option>
          <option value="SH">Shorthanded</option>
          <option value="EV">Even Strength</option>
        </select>
        <select value={filters.period} onChange={e => updateFilter('period', e.target.value)}>
          <option value="">All Periods</option>
          <option value="1">1st Period</option>
          <option value="2">2nd Period</option>
          <option value="3">3rd Period</option>
          <option value="4">Overtime</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="loading">No goals found</div>
      ) : (
        <>
          <div className="goals-grid">
            {goals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #2d2d4a', background: '#232340', color: '#fff', cursor: 'pointer' }}
              >
                Prev
              </button>
              <span style={{ padding: '8px 0', color: '#8b8ba3' }}>
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #2d2d4a', background: '#232340', color: '#fff', cursor: 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
