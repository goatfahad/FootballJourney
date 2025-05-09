import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency } from '../../utils/formatters';
import { Card } from '../ui/Card';
// Import a charting library if needed later, e.g., Chart.js or Recharts

export const FinancesScreen: React.FC = () => {
  const { state } = useGame();
  const { teams, players, playerTeamId } = state; // Added players

  const playerTeam = useMemo(() => {
    if (!playerTeamId) return null;
    return teams.find(t => t.id === playerTeamId);
  }, [playerTeamId, teams]);

  // Memoize player map for performance
  const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);

  const currentTotalWage = useMemo(() => {
    if (!playerTeam) return 0;
    // Calculate current total wage bill based on actual players
    const playerIds = playerTeam.playerIds || [];
    return playerIds.reduce((total, playerId) => {
      const player = playerMap.get(playerId);
      // Ensure player and contract exist, and wage is a number
      const wage = (player && player.contract && typeof player.contract.wage === 'number') ? player.contract.wage : 0;
      return total + wage;
    }, 0);
  }, [playerTeam, playerMap]);

  if (!state.gameLoaded || !playerTeam) {
    return <div className="p-4 text-center">Loading financial data...</div>;
  }

  // Ensure finances object exists
  const finances = playerTeam.finances || { balance: 0, wageBudget: 0, transferBudget: 0, incomeLastMonth: 0, expensesLastMonth: 0 };
  const { balance, wageBudget, transferBudget, incomeLastMonth, expensesLastMonth } = finances;

  const profitLastMonth = incomeLastMonth - expensesLastMonth;

  return (
    // Added dark mode classes
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{playerTeam.name} - Finances</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Overall Balance">
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(balance)}
          </p>
        </Card>
        <Card title="Transfer Budget">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(transferBudget)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Remaining</p>
        </Card>
        <Card title="Wage Budget">
          <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            {formatCurrency(wageBudget)} / week
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Current Wage: {formatCurrency(currentTotalWage)} / week
          </p>
          <p className={`text-sm font-semibold ${wageBudget >= currentTotalWage ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            Remaining: {formatCurrency(wageBudget - currentTotalWage)} / week
          </p>
        </Card>
      </div>

      <Card title="Monthly Summary">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Income Last Month:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(incomeLastMonth)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Expenses Last Month:</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(expensesLastMonth)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            <span className="font-bold text-gray-700 dark:text-gray-300">Profit/Loss Last Month:</span>
            <span className={`font-bold ${profitLastMonth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(profitLastMonth)}
            </span>
          </div>
        </div>
        {/* Add chart placeholder */}
        <div className="mt-4 h-40 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 dark:text-gray-500">
          Chart Placeholder
        </div>
      </Card>

      {/* Add Sponsorships section later */}
      {/* Add Income/Expense breakdown later */}

    </div>
  );
};
