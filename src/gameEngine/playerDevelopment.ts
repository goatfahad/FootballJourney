import { GameState, Player, PlayerStats, PlayerPersonality, PlayerMorale } from '../types/gameTypes';
import dayjs from 'dayjs';

interface DevelopmentFactors {
  trainingFacilityBonus: number;
  moraleFactor: number;
  personalityFactor: number;
  ageFactor: number;
  playtimeFactor: number;
}

interface TrainingResult {
  updatedPlayers: Player[];
  developmentEvents: DevelopmentEvent[];
}

interface DevelopmentEvent {
  playerId: string;
  type: 'improvement' | 'decline' | 'breakthrough' | 'setback';
  attribute: string;
  change: number;
  reason: string;
}

export const processWeeklyTraining = (gameState: GameState): TrainingResult => {
  const developmentEvents: DevelopmentEvent[] = [];
  
  const updatedPlayers = gameState.players.map(player => {
    if (!player) return player;

    const factors = calculateDevelopmentFactors(player, gameState);
    const updatedStats = processPlayerDevelopment(player, factors);
    const events = generateDevelopmentEvents(player, updatedStats);
    
    developmentEvents.push(...events);

    return {
      ...player,
      stats: updatedStats
    };
  });

  return {
    updatedPlayers,
    developmentEvents
  };
};

const calculateDevelopmentFactors = (player: Player, gameState: GameState): DevelopmentFactors => {
  const team = gameState.teams.find(t => t.id === player.contract.clubId);
  
  // Calculate training facility bonus (0-0.3)
  const facilityBonus = team ? (team.trainingFacilitiesLevel * 0.1) : 0;
  
  // Calculate morale factor (0.7-1.3)
  const moraleFactor = calculateMoraleFactor(player.morale);
  
  // Calculate personality impact (0.8-1.2)
  const personalityFactor = calculatePersonalityFactor(player.personality);
  
  // Age factor peaks at 23-24, declines after 30
  const ageFactor = calculateAgeFactor(player.age);
  
  // Playtime factor based on recent matches (0.8-1.2)
  const playtimeFactor = calculatePlaytimeFactor(player.seasonalStats.appearances);
  
  return {
    trainingFacilityBonus: facilityBonus,
    moraleFactor,
    personalityFactor,
    ageFactor,
    playtimeFactor
  };
};

const processPlayerDevelopment = (player: Player, factors: DevelopmentFactors): PlayerStats => {
  const newStats = { ...player.stats };
  const developmentChance = calculateOverallDevelopmentChance(factors);
  
  // Process each stat
  Object.keys(newStats).forEach(key => {
    if (key === 'potential' || key === 'consistency' || key === 'injuryProneness') return;
    
    const statKey = key as keyof PlayerStats;
    if (typeof newStats[statKey] === 'number') {
      const change = calculateStatChange(
        newStats[statKey] as number,
        developmentChance,
        factors,
        player.stats.potential
      );
      
      (newStats[statKey] as number) = Math.max(1, Math.min(99, (newStats[statKey] as number) + change));
    }
  });
  
  return newStats;
};

const calculateStatChange = (
  currentValue: number,
  developmentChance: number,
  factors: DevelopmentFactors,
  potential: number
): number => {
  if (Math.random() > developmentChance) return 0;
  
  const headroom = potential - currentValue;
  if (headroom <= 0) return -0.1; // Slight decline if at or above potential
  
  const baseChange = (Math.random() * 0.3) * (headroom / 20);
  const totalFactor = factors.trainingFacilityBonus + 
                     factors.moraleFactor * 
                     factors.personalityFactor * 
                     factors.ageFactor * 
                     factors.playtimeFactor;
                     
  return baseChange * totalFactor;
};

const calculateOverallDevelopmentChance = (factors: DevelopmentFactors): number => {
  const baseProbability = 0.3; // 30% base chance of development per stat
  return Math.min(0.8, baseProbability * (
    1 + factors.trainingFacilityBonus +
    (factors.moraleFactor - 1) +
    (factors.personalityFactor - 1) +
    (factors.playtimeFactor - 1)
  ));
};

const calculateMoraleFactor = (morale: PlayerMorale): number => {
  const moraleFactors = {
    [PlayerMorale.Ecstatic]: 1.3,
    [PlayerMorale.Happy]: 1.2,
    [PlayerMorale.Content]: 1.0,
    [PlayerMorale.Unsettled]: 0.9,
    [PlayerMorale.Unhappy]: 0.8,
    [PlayerMorale.VeryUnhappy]: 0.7
  };
  return moraleFactors[morale];
};

const calculatePersonalityFactor = (personality: PlayerPersonality): number => {
  const ambitionFactor = personality.ambition / 100 * 0.3;
  const professionalismFactor = personality.professionalism / 100 * 0.7;
  return 0.8 + ambitionFactor + professionalismFactor;
};

const calculateAgeFactor = (age: number): number => {
  if (age < 18) return 1.2;
  if (age < 24) return 1.1;
  if (age < 28) return 1.0;
  if (age < 32) return 0.9;
  return 0.7;
};

const calculatePlaytimeFactor = (appearances: number): number => {
  if (appearances >= 20) return 1.2;
  if (appearances >= 10) return 1.1;
  if (appearances >= 5) return 1.0;
  return 0.8;
};

const generateDevelopmentEvents = (
  player: Player,
  newStats: PlayerStats
): DevelopmentEvent[] => {
  const events: DevelopmentEvent[] = [];
  
  Object.keys(newStats).forEach(key => {
    if (key === 'potential' || key === 'consistency' || key === 'injuryProneness') return;
    
    const statKey = key as keyof PlayerStats;
    const oldValue = player.stats[statKey];
    const newValue = newStats[statKey];
    
    if (typeof oldValue === 'number' && typeof newValue === 'number') {
      const change = newValue - oldValue;
      
      if (Math.abs(change) >= 2) {
        events.push({
          playerId: player.id,
          type: change > 0 ? 'breakthrough' : 'setback',
          attribute: statKey,
          change,
          reason: generateDevelopmentReason(statKey, change, player)
        });
      } else if (Math.abs(change) >= 0.5) {
        events.push({
          playerId: player.id,
          type: change > 0 ? 'improvement' : 'decline',
          attribute: statKey,
          change,
          reason: generateDevelopmentReason(statKey, change, player)
        });
      }
    }
  });
  
  return events;
};

const generateDevelopmentReason = (
  attribute: string,
  change: number,
  player: Player
): string => {
  if (change > 0) {
    return `${player.name}'s ${attribute} has improved through dedicated training.`;
  } else {
    return `${player.name}'s ${attribute} has declined due to lack of match practice.`;
  }
};