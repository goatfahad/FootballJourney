import dayjs from 'dayjs';
import { Player, PlayerStats } from '../types/gameTypes'; // Import Player types

export const formatCurrency = (amount: number): string => {
  // Basic currency formatting (e.g., USD)
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return dayjs(dateString).format('DD MMM YYYY');
};

// Weights for different stat categories based on position
// These are examples and can be heavily tuned
const gkWeights: Partial<Record<keyof PlayerStats, number>> = { handling: 3, reflexes: 3, positioning: 1, strength: 1, pace: 0.5, composure: 1 };
const dfWeights: Partial<Record<keyof PlayerStats, number>> = { tackling: 3, heading: 2, positioning: 2, strength: 1.5, pace: 1, aggression: 1, composure: 0.5, workRate: 1 };
const mfWeights: Partial<Record<keyof PlayerStats, number>> = { passing: 2.5, vision: 2, technique: 2, dribbling: 1.5, workRate: 1.5, stamina: 1.5, positioning: 1, tackling: 0.5, composure: 1 };
const fwWeights: Partial<Record<keyof PlayerStats, number>> = { shooting: 3, pace: 2, dribbling: 1.5, technique: 1.5, composure: 1.5, strength: 0.5, heading: 1, positioning: 1 }; 

// Helper function to get weights based on general position
const getWeights = (generalPosition: string): Partial<Record<keyof PlayerStats, number>> => {
  switch (generalPosition) {
    case 'GK': return gkWeights;
    case 'DF': return dfWeights;
    case 'MF': return mfWeights;
    case 'FW': return fwWeights;
    default: // Use average weights if position is unknown or other
      return { 
        passing: 1, shooting: 1, tackling: 1, dribbling: 1, heading: 1, technique: 1, 
        handling: 1, reflexes: 1, aggression: 1, positioning: 1, vision: 1, 
        composure: 1, workRate: 1, pace: 1, stamina: 1, strength: 1 
      };
  }
};

/**
 * Calculates a player's current ability based on weighted stats for their position.
 * Returns a value roughly between 0-100.
 */
export const calculateCurrentAbility = (stats: PlayerStats, generalPosition: string): number => {
  const weights = getWeights(generalPosition);
  let weightedSum = 0;
  let totalWeight = 0;

  // Iterate over the weights defined for the position
  for (const key in weights) {
    // Ensure the key is a valid stat property
    if (Object.prototype.hasOwnProperty.call(stats, key)) {
      const statKey = key as keyof PlayerStats; 
      const weight = weights[statKey];
      
      if (weight !== undefined) {
        // Ensure the stat value is a number before using it
        const statValue = typeof stats[statKey] === 'number' ? stats[statKey] as number : 0; 
        
        weightedSum += statValue * weight;
        totalWeight += weight;
      }
    }
  }

  if (totalWeight === 0) return 20; // Avoid division by zero, return a low base value

  // Normalize to a 0-100 scale (assuming max stat is 100)
  const averageAbility = (weightedSum / totalWeight);
  // Clamp the result between 0 and 100 (or 99 if that's the max display)
  return Math.max(0, Math.min(100, Math.round(averageAbility))); 
};
