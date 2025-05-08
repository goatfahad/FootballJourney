import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { Team } from '../../types/gameTypes';
import { useGame } from '../../context/GameContext';
import { formatCurrency } from '../../utils/formatters';

interface FinanceOverviewProps {
  team: Team;
}

export const FinanceOverview: React.FC<FinanceOverviewProps> = ({ team }) => {
  const { state } = useGame();
  
  const getCurrentWageBill = () => {
    return team.playerIds.reduce((sum, playerId) => {
      const player = state.players.find(p => p.id === playerId);
      return sum + (player ? player.contract.wage : 0);
    }, 0);
  };
  
  return (
    <Card title="Finances">
      <p className="text-gray-300">Balance: <span>{formatCurrency(team.finances.balance)}</span></p>
      <p className="text-sm text-gray-400">Transfer Budget: <span>{formatCurrency(team.finances.transferBudget)}</span></p>
      <p className="text-sm text-gray-400">
        Wage Budget: {formatCurrency(team.finances.wageBudget)} / {formatCurrency(getCurrentWageBill())} (used)
      </p>
      <Link to="/game/finances">
        <Button variant="primary" size="sm" className="mt-2">View Finances</Button>
      </Link>
    </Card>
  );
};