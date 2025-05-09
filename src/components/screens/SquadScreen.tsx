import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Player } from '../../types/gameTypes';
import { calculateCurrentAbility, formatCurrency } from '../../utils/formatters'; // Assuming these exist

export const SquadScreen: React.FC = () => {
  const { state } = useGame();
  const { players, playerTeamId, teams } = state;

  const playerTeam = useMemo(() => {
    if (!playerTeamId) return null;
    return teams.find(t => t.id === playerTeamId);
  }, [playerTeamId, teams]);

  // Memoize player map for performance
  const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);

  // Get player objects for the current team
  const squadPlayers = useMemo(() => {
    if (!playerTeam) return [];
    // Ensure playerIds exists and is an array before mapping
    const playerIds = playerTeam.playerIds || []; 
    return playerIds
      .map(id => playerMap.get(id))
      .filter(p => p !== undefined) as Player[];
  }, [playerTeam, playerMap]);

  // Sort players (e.g., by position then name)
  const sortedSquad = useMemo(() => {
    const positionOrder = ['GK', 'DF', 'MF', 'FW']; // General position order
    return [...squadPlayers].sort((a, b) => {
      const posA = positionOrder.indexOf(a.generalPosition);
      const posB = positionOrder.indexOf(b.generalPosition);
      if (posA !== posB) return posA - posB;
      return a.name.localeCompare(b.name);
    });
  }, [squadPlayers]);

  if (!state.gameLoaded || !playerTeam) {
    return <div className="p-4 text-center">Loading squad data...</div>;
  }

  return (
    // Added dark mode classes
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{playerTeam.name} - Squad</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pos</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Age</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Nat</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Morale</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Value</th>
              {/* Add more columns as needed: Contract, Stats, etc. */}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedSquad.map(player => (
              <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{player.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.position}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.age}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">{player.nationality.substring(0,3).toUpperCase()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.morale}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-semibold">
                  {calculateCurrentAbility(player.stats, player.position)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(player.value)}</td>
              </tr>
            ))}
            {sortedSquad.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500 dark:text-gray-400">Squad is empty.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
