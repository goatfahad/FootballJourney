// Game Engine - This is the core of the game logic

import { GameState, Player, Team, Match, League } from '../types/gameTypes';
import { generateId } from '../utils/idGenerator';
import * as GameInitializer from './gameInitializer';
import * as MatchEngine from './matchEngine';
import * as PlayerDevelopment from './playerDevelopment';
import * as FinanceManager from './financeManager';
import * as TransferMarket from './transferMarket';

// Re-export specific modules for easier import
export { GameInitializer, MatchEngine, PlayerDevelopment, FinanceManager, TransferMarket };

/**
 * Process daily events - called when time advances
 */
export const processDailyEvents = (state: GameState): GameState => {
  // This would contain the logic for processing daily events
  // For now, we'll return the state unchanged
  return state;
};

/**
 * Gets a player by ID
 */
export const getPlayerById = (state: GameState, id: string): Player | undefined => {
  return state.players.find(p => p.id === id);
};

/**
 * Gets a team by ID
 */
export const getTeamById = (state: GameState, id: string): Team | undefined => {
  return state.teams.find(t => t.id === id);
};

/**
 * Gets a league by ID
 */
export const getLeagueById = (state: GameState, id: string): League | undefined => {
  return state.leagues.find(l => l.id === id);
};

/**
 * Calculate a player's overall rating
 */
export const calculatePlayerOverall = (player: Player): number => {
  // This would contain the logic for calculating a player's overall rating
  // based on their stats and position
  const s = player.stats;
  let relevantStats = [];
  let weights = [];

  // More sophisticated weighting
  const allRounderStats = [s.workRate, s.stamina, s.composure, s.consistency/2]; // Consistency 1-20, so /2

  switch (player.generalPosition) {
    case 'GK': 
      relevantStats = [s.handling, s.reflexes, s.positioning, s.strength, s.pace/2]; // Pace less important for GK
      weights = [3, 3, 2, 1, 0.5];
      break;
    case 'DF': 
      relevantStats = [s.tackling, s.heading, s.positioning, s.strength, s.pace, s.aggression];
      weights = [3, 2, 2, 1.5, 1, 1];
      if (player.position.includes('R') || player.position.includes('L')) { // Wingbacks/Fullbacks
          relevantStats.push(s.dribbling, s.passing); weights.push(0.5, 0.5);
      }
      break;
    case 'MF': 
      relevantStats = [s.passing, s.vision, s.technique, s.dribbling, s.positioning, s.tackling/2]; // Tackling half weight for general MF
      weights = [2.5, 2, 2, 1.5, 1.5, 1];
      if (player.position.startsWith('DM')) { // Defensive Mid
          relevantStats.push(s.tackling, s.strength); weights.push(1.5, 1); // Add more weight to tackling
      } else if (player.position.startsWith('AM')) { // Attacking Mid
          relevantStats.push(s.shooting, s.pace); weights.push(1, 1);
      }
      break;
    case 'FW': 
      relevantStats = [s.shooting, s.heading, s.dribbling, s.pace, s.technique, s.strength/2, s.positioning]; // Strength half weight
      weights = [3, 1.5, 1.5, 1.5, 1.5, 0.5, 1];
      break;
    default: 
      Object.values(s).forEach(val => { 
        if (
          typeof val === 'number' && 
          !['potential', 'consistency', 'injuryProneness'].includes(
            Object.keys(s).find(k => s[k as keyof typeof s] === val) || ''
          )
        ) { 
          relevantStats.push(val); weights.push(1); 
        } 
      });
  }
  
  relevantStats.push(...allRounderStats);
  weights.push(...allRounderStats.map(()=>1)); // Weight of 1 for all-rounder stats

  let weightedSum = 0;
  let totalWeight = 0;
  for(let i=0; i<relevantStats.length; i++) {
    weightedSum += (relevantStats[i] || 0) * (weights[i] || 1);
    totalWeight += (weights[i] || 1);
  }

  const avg = totalWeight > 0 ? weightedSum / totalWeight : 30;
  return Math.min(99, Math.max(30, Math.round(avg)));
};