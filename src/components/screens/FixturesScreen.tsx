import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Match } from '../../types/gameTypes';
import { ActionTypes } from '../../types/actionTypes'; // Correct import
import dayjs from 'dayjs';
import { Button } from '../ui/Button';
import { findNextMatch } from '../../utils/matchUtils';
import { toast } from 'react-toastify'; // Correct import

export const FixturesScreen: React.FC = () => {
  const { state, dispatch } = useGame(); // Destructure dispatch here
  const { teams, leagues, playerTeamId, currentDate } = state;

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

  const sortedFixtures = useMemo(() => {
    if (!playerLeague || !playerTeamId || !playerLeague.fixtures) return []; // Added check for fixtures array

    // Filter fixtures for the player's team
    const teamFixtures = playerLeague.fixtures.filter(
      match => match && (match.homeTeamId === playerTeamId || match.awayTeamId === playerTeamId) // Added check for match object
    );

     // Sort by date
     return teamFixtures.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
   }, [playerLeague, playerTeamId]); // Removed playerLeague.fixtures dependency as playerLeague change covers it

   const nextMatch = useMemo(() => findNextMatch(state), [state]);

   // Function to dispatch time advance (similar to Sidebar)
   const advanceTime = (days: number) => {
     if (days < 0) return;
     // TODO: Add startLoading/stopLoading if desired
     console.log(`FixturesScreen: Advancing time by ${days} day(s)...`);
     dispatch({
         type: ActionTypes.ADVANCE_TIME,
         payload: { days }
     });
   };

   // Handler for the button on this screen
   const handleSimulateNext = () => {
     if (nextMatch) {
       const currentDate = dayjs(state.currentDate);
       const matchDate = dayjs(nextMatch.date);
       const daysToAdvance = Math.max(0, matchDate.diff(currentDate, 'day'));

       if (daysToAdvance >= 0) {
         advanceTime(daysToAdvance);
       } else {
          console.log("Next match date is in the past?");
       }
     } else {
       console.log("No upcoming matches found to simulate to.");
       toast.info("No upcoming matches found.");
     }
   };

    if (!state.gameLoaded || !playerTeam || !playerLeague) {
      return <div className="p-4 text-center">Loading fixtures data...</div>;
   }

  return (
    // Added dark mode classes
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{playerTeam?.name} - Fixtures & Results</h1>

      <div className="mb-6 flex justify-end">
        <Button onClick={handleSimulateNext} variant="primary" disabled={!nextMatch}>
          {nextMatch ? `Simulate Next Match (${dayjs(nextMatch.date).format('DD MMM')})` : 'No Upcoming Matches'}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Home</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Result</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Away</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedFixtures.map(match => {
              const isNextMatch = nextMatch?.id === match.id;
              const rowClass = isNextMatch ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'; // Adjusted dark active row

              return (
                <tr key={match.id} className={`${rowClass} transition-colors duration-150`}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {dayjs(match.date).format('ddd, DD MMM YYYY')}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm ${match.homeTeamId === playerTeamId ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-300'}`}>
                    {getTeamName(match.homeTeamId)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-mono text-gray-700 dark:text-gray-300">
                    {match.status === 'played' ? (
                      <span className={`font-semibold ${
                        (match.result.homeScore > match.result.awayScore && match.homeTeamId === playerTeamId) ||
                        (match.result.awayScore > match.result.homeScore && match.awayTeamId === playerTeamId)
                          ? 'text-green-600 dark:text-green-400' // Win
                          : match.result.homeScore === match.result.awayScore
                          ? 'text-yellow-600 dark:text-yellow-400' // Draw
                          : 'text-red-600 dark:text-red-400' // Loss
                      }`}>
                        {match.result.homeScore} - {match.result.awayScore}
                      </span>
                    ) : match.status === 'in_progress' ? (
                      <span className="text-blue-600 dark:text-blue-400">In Progress</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">vs</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${match.awayTeamId === playerTeamId ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-300'}`}>
                    {getTeamName(match.awayTeamId)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize hidden sm:table-cell">
                     {match.status.replace('_', ' ')}
                     {isNextMatch && <span className="ml-2 text-blue-600 dark:text-blue-400 font-semibold">(Next)</span>}
                  </td>
                </tr>
              );
            })}
            {sortedFixtures.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">No fixtures found for your team in this league.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
