import { GameState, Match } from '../types/gameTypes';
import dayjs from 'dayjs';

/**
 * Finds the next scheduled match for the player's team
 */
export const findNextMatch = (state: GameState): Match | null => {
  if (!state.playerTeamId) return null;
  
  const currentDate = dayjs(state.currentDate);
  
  // Get all matches for the player's team that are scheduled and not in the past
  const upcomingMatches = state.leagues
    .flatMap(l => l.fixtures)
    .filter(m => 
      (m.homeTeamId === state.playerTeamId || m.awayTeamId === state.playerTeamId) && 
      m.status === 'scheduled' && 
      dayjs(m.date).isSameOrAfter(currentDate, 'day')
    )
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  
  // Return the closest match if any
  return upcomingMatches.length > 0 ? upcomingMatches[0] : null;
};

/**
 * Checks if a match is for the player's team
 */
export const isPlayerTeamMatch = (match: Match, playerTeamId: string | null): boolean => {
  if (!playerTeamId) return false;
  return match.homeTeamId === playerTeamId || match.awayTeamId === playerTeamId;
};

/**
 * Checks if a player match is a win for the player
 */
export const isPlayerWin = (match: Match, playerTeamId: string | null): boolean => {
  if (!playerTeamId || match.status !== 'played') return false;
  
  if (match.homeTeamId === playerTeamId) {
    return match.result.homeScore > match.result.awayScore;
  }
  
  if (match.awayTeamId === playerTeamId) {
    return match.result.awayScore > match.result.homeScore;
  }
  
  return false;
};

/**
 * Checks if a player match is a draw
 */
export const isPlayerDraw = (match: Match): boolean => {
  return match.status === 'played' && match.result.homeScore === match.result.awayScore;
};

/**
 * Checks if a player match is a loss for the player
 */
export const isPlayerLoss = (match: Match, playerTeamId: string | null): boolean => {
  return match.status === 'played' && 
         !isPlayerWin(match, playerTeamId) && 
         !isPlayerDraw(match);
};