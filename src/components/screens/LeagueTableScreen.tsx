import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { LeagueTableEntry } from '../../types/gameTypes';

export const LeagueTableScreen: React.FC = () => {
  const { state } = useGame();
  const { teams, leagues, playerTeamId } = state;

  const playerTeam = useMemo(() => {
    if (!playerTeamId) return null;
    return teams.find(t => t.id === playerTeamId);
  }, [playerTeamId, teams]);

  const playerLeague = useMemo(() => {
    if (!playerTeam || !playerTeam.leagueId) return null;
    return leagues.find(l => l.id === playerTeam.leagueId);
  }, [playerTeam, leagues]);

  const teamMap = useMemo(() => new Map(teams.map(t => [t.id, t.name])), [teams]);

  const getTeamName = (teamId: string): string => {
    return teamMap.get(teamId) || 'Unknown Team';
  };

  // Sort the league table
  const sortedTable = useMemo(() => {
    // Ensure playerLeague and playerLeague.table exist and are arrays
    if (!playerLeague || !Array.isArray(playerLeague.table)) return []; 
    
    // Sort primarily by points, then goal difference, then goals for
    return [...playerLeague.table].sort((a, b) => {
      if (!a || !b) return 0; // Add null check for entries
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return getTeamName(a.teamId).localeCompare(getTeamName(b.teamId)); // Alphabetical tiebreaker
    });
  }, [playerLeague]); // Removed teamMap/getTeamName dependency as teamMap only depends on teams

  if (!state.gameLoaded || !playerLeague) {
    return <div className="p-4 text-center">Loading league table data...</div>;
  }

  return (
    // Added dark mode classes
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{playerLeague.name} - League Table</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">Pos</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Team</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">P</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">W</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">D</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">L</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">GF</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">GA</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">GD</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pts</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTable.map((entry, index) => {
              if (!entry) return null; // Skip rendering if entry is null/undefined
              const isPlayerTeam = entry.teamId === playerTeamId;
              const position = index + 1;
              // Basic row styling - could add promotion/relegation zone colors
              const rowClass = isPlayerTeam ? 'bg-blue-100 dark:bg-blue-900/50 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700';
              
              return (
                <tr key={entry.teamId} className={`${rowClass}`}>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{position}</td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm ${isPlayerTeam ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {getTeamName(entry.teamId)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{entry.played}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{entry.won}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{entry.drawn}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{entry.lost}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300 hidden sm:table-cell">{entry.goalsFor}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300 hidden sm:table-cell">{entry.goalsAgainst}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{entry.goalDifference}</td>
                  <td className={`px-3 py-3 whitespace-nowrap text-sm text-center font-bold ${isPlayerTeam ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {entry.points}
                  </td>
                </tr>
              );
            })}
            {sortedTable.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-4 text-gray-500 dark:text-gray-400">League table is empty.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
