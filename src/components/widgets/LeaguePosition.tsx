import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { useGame } from '../../context/GameContext';

interface LeaguePositionProps {
  teamId: string;
  leagueId: string | null;
}

export const LeaguePosition: React.FC<LeaguePositionProps> = ({ teamId, leagueId }) => {
  const { state } = useGame();
  
  const getLeague = () => {
    if (!leagueId) return null;
    return state.leagues.find(l => l.id === leagueId);
  };
  
  const getTeamStanding = () => {
    const league = getLeague();
    if (!league) return null;
    
    const standing = league.table.find(s => s.teamId === teamId);
    if (!standing) return null;
    
    return {
      ...standing,
      position: league.table.indexOf(standing) + 1
    };
  };
  
  const league = getLeague();
  const standing = getTeamStanding();
  
  return (
    <Card title="League Position">
      {league && standing ? (
        <div>
          <p className="text-gray-300">{league.name}</p>
          <p className="text-gray-300">Position: <span>{standing.position}</span></p>
          <p className="text-sm text-gray-400">Points: <span>{standing.points}</span></p>
          <Link to="/game/league-table">
            <Button variant="primary" size="sm" className="mt-2">View Full Table</Button>
          </Link>
        </div>
      ) : (
        <p className="text-gray-400">Not currently in a league.</p>
      )}
    </Card>
  );
};