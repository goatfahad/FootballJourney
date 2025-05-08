import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Match } from '../../types/gameTypes';
import { useGame } from '../../context/GameContext';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

interface NextMatchProps {
  match: Match | null;
}

export const NextMatch: React.FC<NextMatchProps> = ({ match }) => {
  const { state } = useGame();
  
  const getTeamName = (teamId: string) => {
    const team = state.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };
  
  const getLeagueName = (leagueId: string) => {
    const league = state.leagues.find(l => l.id === leagueId);
    return league ? league.name : 'N/A';
  };
  
  return (
    <Card title="Next Match">
      {match ? (
        <div>
          <p className="text-gray-300">
            <span>{getTeamName(match.homeTeamId)}</span> vs <span>{getTeamName(match.awayTeamId)}</span>
          </p>
          <p className="text-sm text-gray-400">{dayjs(match.date).format('ddd, D MMM YYYY')}</p>
          <p className="text-sm text-gray-400">League: {getLeagueName(match.leagueId)}</p>
          <Link to="/game/match-preview" state={{ match }}>
            <Button variant="primary" size="sm" className="mt-2">Match Preview</Button>
          </Link>
        </div>
      ) : (
        <p className="text-gray-400">No upcoming matches scheduled or end of season.</p>
      )}
    </Card>
  );
};