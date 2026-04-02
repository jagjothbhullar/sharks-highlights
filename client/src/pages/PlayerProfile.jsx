import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlayer } from '../api';
import GoalCard from '../components/GoalCard';

export default function PlayerProfile() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    getPlayer(id).then(data => {
      setPlayer(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="loading">Loading player...</div>;
  if (!player) return <div className="loading">Player not found</div>;

  const stats = player.seasonStats;
  const goals = player.goals || [];

  const filteredGoals = goals.filter(g => {
    if (filter === 'all') return true;
    if (filter === 'pp') return g.goalType === 'PP';
    if (filter === 'gwg') return g.isGameWinning;
    if (filter === 'ot') return g.isOvertimeGoal;
    return true;
  });

  return (
    <div className="page">
      <Link to="/" className="back-link">&larr; Back to Yearbook</Link>

      <div className="player-header">
        <img
          src={player.headshotUrl || `https://ui-avatars.com/api/?name=${player.firstName}+${player.lastName}&background=006d75&color=fff&size=160`}
          alt={`${player.firstName} ${player.lastName}`}
        />
        <div className="info">
          <h1>#{player.sweaterNumber} {player.firstName} {player.lastName}</h1>
          <div className="meta">
            {player.positionCode}
            {player.birthCity && ` \u2022 ${player.birthCity}, ${player.birthCountry}`}
            {player.heightInches && ` \u2022 ${Math.floor(player.heightInches / 12)}'${player.heightInches % 12}"`}
            {player.weightPounds && ` ${player.weightPounds} lbs`}
          </div>
          {stats && (
            <div className="stats-row">
              <div className="stat-box"><div className="value">{stats.gamesPlayed}</div><div className="label">GP</div></div>
              <div className="stat-box"><div className="value">{stats.goals}</div><div className="label">Goals</div></div>
              <div className="stat-box"><div className="value">{stats.assists}</div><div className="label">Assists</div></div>
              <div className="stat-box"><div className="value">{stats.points}</div><div className="label">Points</div></div>
              <div className="stat-box"><div className="value">{stats.plusMinus > 0 ? '+' : ''}{stats.plusMinus}</div><div className="label">+/-</div></div>
              <div className="stat-box"><div className="value">{stats.ppGoals}</div><div className="label">PPG</div></div>
              {stats.shootingPct > 0 && <div className="stat-box"><div className="value">{(stats.shootingPct * 100).toFixed(1)}%</div><div className="label">SH%</div></div>}
            </div>
          )}
        </div>
      </div>

      <h2 style={{ marginBottom: 16 }}>
        Highlights ({filteredGoals.length})
      </h2>

      <div className="filter-bar">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Goals</option>
          <option value="pp">Power Play</option>
          <option value="gwg">Game Winners</option>
          <option value="ot">Overtime</option>
        </select>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="loading">No goals match this filter</div>
      ) : (
        <div className="goals-grid">
          {filteredGoals.map(g => (
            <GoalCard key={g.id} goal={g} showOpponent={true} />
          ))}
        </div>
      )}
    </div>
  );
}
