import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Player } from '../../types/gameTypes';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { calculateCurrentAbility } from '../../utils/formatters';
import { ActionTypes } from '../../types/actionTypes'; // Import ActionTypes

// Example training focuses
const trainingFocusOptions = [
  { value: 'overall', label: 'Overall Development' },
  { value: 'attacking', label: 'Attacking Movement' },
  { value: 'defending', label: 'Defensive Positioning' },
  { value: 'physical', label: 'Physical Conditioning' },
  { value: 'technical', label: 'Technical Skills (Passing/Dribbling)' },
  { value: 'shooting', label: 'Shooting Practice' },
  { value: 'goalkeeping', label: 'Goalkeeping' },
];

export const TrainingScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const { players, playerTeamId, teams } = state;

  const playerTeam = useMemo(() => teams.find(t => t.id === playerTeamId), [teams, playerTeamId]);

  // Memoize player map for performance
  const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);

  // Get player objects for the current team
  const squadPlayers = useMemo(() => {
    if (!playerTeam) return [];
    const playerIds = playerTeam.playerIds || [];
    return playerIds
      .map(id => playerMap.get(id))
      .filter(p => p !== undefined) as Player[];
  }, [playerTeam, playerMap]);

  // Handle individual player focus change
  const handleFocusChange = (playerId: string, focus: string) => {
    const player = playerMap.get(playerId);
    if (player) {
      // Ensure trainingFocus is part of the Player type before updating
      const updatedPlayer = { ...player, trainingFocus: focus }; 
      dispatch({ type: ActionTypes.UPDATE_PLAYER, payload: { player: updatedPlayer } });
    }
  };

  // TODO: Add team training schedule settings

  if (!state.gameLoaded || !playerTeam) {
    return <div className="p-4 text-center">Loading training data...</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{playerTeam.name} - Training</h1>

      {/* Team Training Section (Placeholder) */}
      <Card title="Team Training Schedule">
        <p className="text-gray-600 dark:text-gray-400">Team training schedule setup coming soon.</p>
        {/* Add options for weekly schedule, intensity, focus areas */}
      </Card>

      {/* Individual Player Focus Section */}
      <Card title="Individual Player Focus">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-750">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Player</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Focus</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Set Focus</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {squadPlayers.map(player => (
                <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{player.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{player.position}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-semibold">
                    {calculateCurrentAbility(player.stats, player.generalPosition)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">
                    {/* Ensure player.trainingFocus exists before accessing */}
                    {player.trainingFocus || 'Overall'} 
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <select
                      value={player.trainingFocus || 'overall'}
                      onChange={(e) => handleFocusChange(player.id, e.target.value)}
                      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm p-1 text-xs focus:ring-blue-500 focus:border-blue-500"
                    >
                      {trainingFocusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Youth Development Section (Placeholder) */}
      <Card title="Youth Development">
         <p className="text-gray-600 dark:text-gray-400">Youth intake and development details coming soon.</p>
         {/* Display youth candidates, potential, progress */}
      </Card>
    </div>
  );
};
