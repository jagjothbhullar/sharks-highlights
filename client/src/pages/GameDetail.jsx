import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGame } from '../api';
import GoalCard from '../components/GoalCard';

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGame(id).then(data => {
      setGame(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="loading">Loading game...</div>;
  if (!game) return <div className="loading">Game not found</div>;

  const dateStr = new Date(game.gameDate).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const sharksScore = game.isHome ? game.homeScore : game.awayScore;
  const oppScore = game.isHome ? game.awayScore : game.homeScore;
  const result = sharksScore > oppScore ? 'W' : sharksScore < oppScore ? 'L' : 'T';

  return (
    <div className="page">
      <Link to="/goals" className="back-link">&larr; Back to Goals</Link>

      <h1 className="page-title">
        SJS {sharksScore} - {oppScore} {game.opponentAbbrev}
        <span style={{ fontSize: 20, marginLeft: 12, color: result === 'W' ? '#22c55e' : '#dc2626' }}>
          {result}
        </span>
      </h1>
      <p className="page-subtitle">{dateStr} &middot; {game.isHome ? 'Home' : 'Away'}</p>

      <h2 style={{ marginBottom: 16 }}>Goals ({game.goals?.length || 0})</h2>
      <div className="goals-grid">
        {(game.goals || []).map(g => (
          <GoalCard key={g.id} goal={{ ...g, game }} showOpponent={false} />
        ))}
      </div>
    </div>
  );
}
