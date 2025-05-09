import { GameState, Match, Team, Player, LeagueTableEntry, MatchEvent, LiveMatchState, MatchCommentary } from '../types/gameTypes';
import { calculateCurrentAbility } from '../utils/formatters'; // Assuming this exists and is relevant
import { generateId } from '../utils/idGenerator';
import dayjs from 'dayjs';

// --- Existing simulateMatch (for AI vs AI or quick sim) ---
// Define simple weights or factors (can be expanded significantly)
const HOME_ADVANTAGE = 0.1; // Slight boost for home team
const TACTICS_MULTIPLIER = { // Example multipliers based on mentality vs mentality
  'attacking_vs_defensive': 1.2,
  'defensive_vs_attacking': 0.8,
  'balanced_vs_balanced': 1.0,
  // Add more combinations
};

// Simplified simulation result structure for instant sim
interface InstantSimulationResult {
  updatedMatch: Match;
  updatedPlayers: Player[]; // Players with updated stamina, form, etc.
  updatedTableEntries: LeagueTableEntry[]; // Updated table entries for both teams
  matchEvents: MatchEvent[]; // Goals, cards, etc.
}

/**
 * Calculates a team's overall rating for the match based on starters, tactics, morale etc.
 * Very simplified for now. Used for instant sim.
 */
const calculateTeamMatchRating = (team: Team, players: Player[], isHome: boolean): number => {
  let totalRating = 0;
  // Ensure squad and startingXI exist before slicing
  const starters = team.squad?.startingXI?.slice(0, 11) || []; 

  if (starters.length === 0) return 30; // Low rating if no starters

  starters.forEach(playerId => {
    const player = players.find(p => p.id === playerId);
    if (player && player.stats) { // Ensure player and stats exist
      // Consider current ability, form, morale, fitness (stamina)
      const ability = calculateCurrentAbility(player.stats, player.generalPosition);
      const moraleBoost = player.morale === 'Happy' ? 1.05 : player.morale === 'Unhappy' ? 0.95 : 1.0;
      const fitnessFactor = (typeof player.stats.stamina === 'number' ? player.stats.stamina : 50) / 100; // Default stamina if missing
      totalRating += ability * moraleBoost * fitnessFactor;
    }
  });

  const averageRating = totalRating / starters.length;
  const homeBoost = isHome ? 1 + HOME_ADVANTAGE : 1;

  // Basic tactic factor (placeholder) - ensure tactics exist
  const tacticFactor = team.tactics?.mentality === 'attacking' ? 1.1 : team.tactics?.mentality === 'defensive' ? 0.9 : 1.0;

  return averageRating * homeBoost * tacticFactor;
};

/**
 * Simulates a single football match instantly (AI vs AI).
 * This is a very basic placeholder implementation.
 */
export const simulateMatch = (matchInput: Match, gameState: GameState): InstantSimulationResult => {
  const { teams, players, leagues } = gameState;

  const homeTeam = teams.find(t => t.id === matchInput.homeTeamId);
  const awayTeam = teams.find(t => t.id === matchInput.awayTeamId);
  const league = leagues.find(l => l.id === matchInput.leagueId);

  if (!homeTeam || !awayTeam || !league || !Array.isArray(league.table)) { // Added check for league.table
    console.error(`Could not find teams, league, or league table for match ${matchInput.id}`);
    return {
      updatedMatch: { ...matchInput, status: 'played' },
      updatedPlayers: [],
      updatedTableEntries: [],
      matchEvents: []
    };
  }

  const homeRating = calculateTeamMatchRating(homeTeam, players, true);
  const awayRating = calculateTeamMatchRating(awayTeam, players, false);
  const ratingDifference = homeRating - awayRating;
  const randomFactor = (Math.random() - 0.5) * 20;

  let homeScore = 0;
  let awayScore = 0;
  const matchEvents: MatchEvent[] = [];
  const goalProbabilityFactor = Math.abs(ratingDifference + randomFactor) / 50;
  const numberOfGoals = Math.floor(Math.random() * (3 + goalProbabilityFactor * 3));

  for (let i = 0; i < numberOfGoals; i++) {
    const minute = Math.floor(Math.random() * 90) + 1;
    if ((ratingDifference + randomFactor > 0 && Math.random() < 0.6) || (ratingDifference + randomFactor <= 0 && Math.random() < 0.4)) {
       homeScore++;
       matchEvents.push({ minute, type: 'Goal', teamId: homeTeam.id, details: 'Goal scored' });
    } else {
       awayScore++;
       matchEvents.push({ minute, type: 'Goal', teamId: awayTeam.id, details: 'Goal scored' });
    }
  }
  matchEvents.sort((a, b) => a.minute - b.minute);

  const updatedMatch: Match = {
    ...matchInput,
    status: 'played',
    result: { homeScore, awayScore },
    events: matchEvents,
    // Ensure stats object exists
    stats: { 
      ...(matchInput.stats || {}), // Use existing stats or empty object
      homeShots: homeScore + Math.floor(Math.random() * 5),
      awayShots: awayScore + Math.floor(Math.random() * 5),
      homeShotsOnTarget: Math.max(0, homeScore + Math.floor(Math.random() * 3) -1), // Ensure non-negative
      awayShotsOnTarget: Math.max(0, awayScore + Math.floor(Math.random() * 3) -1), // Ensure non-negative
      homePossession: Math.max(30, Math.min(70, 50 + Math.round(ratingDifference / 2))),
      awayPossession: Math.max(30, Math.min(70, 50 - Math.round(ratingDifference / 2))),
    },
    commentaryLog: matchEvents.map(e => ({ minute: e.minute, text: `${e.type} by ${e.teamId === homeTeam.id ? homeTeam.name : awayTeam.name}` })) // Basic commentary log
  };

  const updatedPlayers: Player[] = []; // Placeholder for player stat updates (stamina, form)
  const updatedTableEntries: LeagueTableEntry[] = [];
  const homeEntry = league.table.find(e => e && e.teamId === homeTeam.id); // Check entry exists
  const awayEntry = league.table.find(e => e && e.teamId === awayTeam.id); // Check entry exists

  if (homeEntry && awayEntry) {
    const newHomeEntry = { ...homeEntry, played: homeEntry.played + 1, goalsFor: homeEntry.goalsFor + homeScore, goalsAgainst: homeEntry.goalsAgainst + awayScore, goalDifference: homeEntry.goalDifference + (homeScore - awayScore) };
    const newAwayEntry = { ...awayEntry, played: awayEntry.played + 1, goalsFor: awayEntry.goalsFor + awayScore, goalsAgainst: awayEntry.goalsAgainst + homeScore, goalDifference: awayEntry.goalDifference + (awayScore - homeScore) };

    if (homeScore > awayScore) {
      newHomeEntry.won = homeEntry.won + 1; newHomeEntry.points = homeEntry.points + 3;
      newAwayEntry.lost = awayEntry.lost + 1;
    } else if (awayScore > homeScore) {
      newAwayEntry.won = awayEntry.won + 1; newAwayEntry.points = awayEntry.points + 3;
      newHomeEntry.lost = homeEntry.lost + 1;
    } else {
      newHomeEntry.drawn = homeEntry.drawn + 1; newHomeEntry.points = homeEntry.points + 1;
      newAwayEntry.drawn = awayEntry.drawn + 1; newAwayEntry.points = awayEntry.points + 1;
    }
    updatedTableEntries.push(newHomeEntry, newAwayEntry);
  }

  return { updatedMatch, updatedPlayers, updatedTableEntries, matchEvents };
};


// --- New Live Match Simulation Logic ---

interface MinuteSimulationResult {
  newEvents: MatchCommentary[]; // Commentary for this minute
  newHomeScore: number;
  newAwayScore: number;
  newBallPosition: { x: number; y: number };
  // Add player stat changes (stamina etc.) if needed per minute
}

/**
 * Simulates a single minute of a live match.
 * Needs significant implementation.
 */
export const simulateMinute = (liveMatchState: LiveMatchState, gameState: GameState): MinuteSimulationResult => {
  const { minute, homeScore, awayScore, ballPosition, liveHomeTactics, liveAwayTactics, matchId } = liveMatchState;
  const { teams, players, leagues } = gameState; // Added leagues

  const match = leagues.flatMap(l => l.fixtures || []).find(m => m && m.id === matchId); // Check fixtures array and match object
  if (!match) return { newEvents: [], newHomeScore: homeScore, newAwayScore: awayScore, newBallPosition: ballPosition };

  const homeTeam = teams.find(t => t && t.id === match.homeTeamId); // Check team object
  const awayTeam = teams.find(t => t && t.id === match.awayTeamId); // Check team object
  if (!homeTeam || !awayTeam) return { newEvents: [], newHomeScore: homeScore, newAwayScore: awayScore, newBallPosition: ballPosition };

  const newEvents: MatchCommentary[] = [];
  let currentHomeScore = homeScore;
  let currentAwayScore = awayScore;
  let currentBallPosition = { ...ballPosition };

  // --- Core Minute Simulation ---
  // Placeholder logic remains, needs proper implementation
  newEvents.push({ minute: minute + 1, text: `Minute ${minute + 1}: The ball is moved around midfield.` });
  currentBallPosition.x += (Math.random() - 0.5) * 10;
  currentBallPosition.y += (Math.random() - 0.5) * 10;
  currentBallPosition.x = Math.max(0, Math.min(100, currentBallPosition.x));
  currentBallPosition.y = Math.max(0, Math.min(100, currentBallPosition.y));

  if (Math.random() < 0.015) {
     if (Math.random() < 0.5) {
        currentHomeScore++;
        newEvents.push({ minute: minute + 1, text: `GOAL! ${homeTeam.name} score! (${currentHomeScore}-${currentAwayScore})`, type: 'Goal' });
     } else {
        currentAwayScore++;
        newEvents.push({ minute: minute + 1, text: `GOAL! ${awayTeam.name} score! (${currentHomeScore}-${currentAwayScore})`, type: 'Goal' });
     }
  }
  // --- End Placeholder Logic ---


  return {
    newEvents,
    newHomeScore: currentHomeScore,
    newAwayScore: currentAwayScore,
    newBallPosition: currentBallPosition,
  };
};
