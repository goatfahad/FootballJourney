import { Player, Team, League, YouthCandidate } from '../types/gameTypes';
import { generateId } from '../utils/idGenerator';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs'; // Ensure dayjs is imported

const MIN_AGE = 16;
const MAX_AGE = 38;
const BASE_PLAYER_VALUE = 50000;

/**
 * Create a new player
 */
export const createPlayer = (
  clubId: string | null,
  ageRange: [number, number] = [MIN_AGE, MAX_AGE - 5],
  isYouth: boolean = false
): Player => {
  const age = Math.floor(Math.random() * (ageRange[1] - ageRange[0] + 1)) + ageRange[0];
  const potentialMin = isYouth ? 60 : 45;
  const potentialMax = isYouth ? 95 : 88;
  const potential = Math.floor(Math.random() * (potentialMax - potentialMin + 1)) + potentialMin;

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const positions = ['GK', 'DR', 'DC', 'DL', 'DMC', 'MC', 'AMC', 'ST'];
  const position = positions[Math.floor(Math.random() * positions.length)];

  const generalPosition = mapToGeneralPosition(position);

  const getRandomStat = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const player: Player = {
    id: generateId('player_'),
    name: `${firstName} ${lastName}`,
    age,
    dob: dayjs().subtract(age, 'year').add(Math.floor(Math.random() * 365), 'day').toISOString(),
    nationality: ['English', 'Spanish', 'German', 'Italian', 'French'][Math.floor(Math.random() * 5)],
    position,
    generalPosition,
    stats: {
      passing: getRandomStat(20, Math.min(70, potential - 15)),
      shooting: getRandomStat(20, Math.min(70, potential - 15)),
      tackling: getRandomStat(20, Math.min(70, potential - 15)),
      dribbling: getRandomStat(20, Math.min(70, potential - 15)),
      heading: getRandomStat(20, Math.min(70, potential - 15)),
      technique: getRandomStat(20, Math.min(70, potential - 15)),
      handling: position === 'GK' ? getRandomStat(30, Math.min(75, potential - 10)) : getRandomStat(5, 20),
      reflexes: position === 'GK' ? getRandomStat(30, Math.min(75, potential - 10)) : getRandomStat(5, 20),
      aggression: getRandomStat(20, Math.min(70, potential - 5)),
      positioning: getRandomStat(20, Math.min(60, potential - 10)),
      vision: getRandomStat(20, Math.min(60, potential - 10)),
      composure: getRandomStat(20, Math.min(60, potential - 10)),
      workRate: getRandomStat(30, Math.min(75, potential - 5)),
      pace: getRandomStat(30, Math.min(75, potential - 5)),
      stamina: getRandomStat(30, Math.min(75, potential - 5)),
      strength: getRandomStat(30, Math.min(75, potential - 5)),
      potential,
      consistency: getRandomStat(5, 15),
      injuryProneness: getRandomStat(1, 10)
    },
    contract: {
      clubId,
      wage: getRandomStat(isYouth ? 100 : 500, isYouth ? 1000 : 15000),
      expiryDate: dayjs().add(getRandomStat(1, 4), 'year').toISOString(),
      signingBonus: 0,
      releaseClause: 0
    },
    value: 0, // Will be calculated
    morale: 'Content',
    form: 0,
    injury: null,
    suspension: null,
    seasonalStats: {
      appearances: 0,
      goals: 0,
      assists: 0,
      avgRating: 0
    },
    historicalStats: [],
    isRegen: isYouth,
    willRetire: false,
    status: 'Active',
    squadRole: 'Reserve',
    className: 'Player'
  };

  player.value = calculatePlayerValue(player);

  return player;
};

export const createTeam = (leagueId: string, country: string, leagueName: string): Team => {
  const city = faker.location.city();
  const suffixes = [
    'United', 'City', 'FC', 'Rovers', 'Wanderers', 'Athletic', 'Town',
    'Albion', 'Victoria', 'Strikers', 'Flyers', 'Giants', 'Rangers',
    'Orient', 'Thistle', 'Harriers', 'County', 'Borough', 'Olympic'
  ];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const teamName = `${city} ${suffix}`;

  const team: Team = {
    id: generateId('team_'),
    name: teamName,
    shortName: teamName.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase() || 'TMN',
    country,
    leagueId,
    leagueName,
    logo: '',
    playerIds: [],
    squad: {
      startingXI: [],
      subs: [],
      reserves: []
    },
    formation: '4-4-2',
    tactics: {
      mentality: 'balanced',
      passingStyle: 'mixed',
      pressingIntensity: 'medium'
    },
    finances: {
      balance: Math.floor(Math.random() * 20000000) + 1000000,
      wageBudget: Math.floor(Math.random() * 500000) + 50000,
      transferBudget: Math.floor(Math.random() * 10000000) + 1000000,
      sponsorships: [],
      incomeLastMonth: 0,
      expensesLastMonth: 0
    },
    stadium: {
      name: `${teamName} Stadium`,
      capacity: Math.floor(Math.random() * 50000) + 10000
    },
    trainingFacilitiesLevel: Math.floor(Math.random() * 3) + 1,
    youthFacilitiesLevel: Math.floor(Math.random() * 3) + 1,
    boardExpectations: {
      leaguePosition: Math.floor(Math.random() * 10) + 1,
      cupPerformance: 'Quarter Finals',
      financialStability: 'Maintain positive balance'
    },
    manager: {
      name: faker.person.fullName(),
      isHuman: false
    },
    history: [],
    youthCandidates: [],
    className: 'Team'
  };

  return team;
};

export const createYouthCandidate = (teamYouthFacilityLevel: number, teamCountry: string): YouthCandidate => {
  const age = Math.floor(Math.random() * 3) + 15; // 15-17
  const positions = ['GK', 'DR', 'DC', 'DL', 'DMC', 'MC', 'AMC', 'ST'];
  const position = positions[Math.floor(Math.random() * positions.length)];

  const potentialBase = 50 + (teamYouthFacilityLevel * 6);
  const potential = Math.floor(Math.random() * Math.min(95, potentialBase + 25)) + potentialBase;

  return {
    id: generateId('yc_'),
    age,
    position,
    potentialStars: Math.max(1, Math.ceil(potential / 19)),
    potentialActual: potential,
    nationality: Math.random() < 0.7 ? teamCountry : ['English', 'Spanish', 'German', 'Italian', 'French'][Math.floor(Math.random() * 5)],
    nameStub: `${faker.person.firstName()} ${faker.person.lastName()}`
  };
};

function mapToGeneralPosition(specificPosition: string): string {
  if (!specificPosition) return 'Unknown';
  if (specificPosition === 'GK') return 'GK';
  if (['DR', 'DL', 'DC', 'SW', 'DMR', 'DML', 'DMC'].includes(specificPosition)) return 'DF';
  if (['MR', 'ML', 'MC', 'AMR', 'AML', 'AMC'].includes(specificPosition)) return 'MF';
  if (['ST', 'FWR', 'FWL', 'FC'].includes(specificPosition)) return 'FW';

  if (specificPosition.startsWith('D')) return 'DF';
  if (specificPosition.startsWith('M') || specificPosition.startsWith('AM')) return 'MF';
  if (specificPosition.startsWith('ST') || specificPosition.startsWith('F')) return 'FW';

  return 'MF'; // Default
}

function calculatePlayerValue(player: Player): number {
  let baseValue = BASE_PLAYER_VALUE + (player.stats.potential * player.stats.potential * 50);

  if (player.age < 21) baseValue *= 1.5;
  else if (player.age < 25) baseValue *= 1.2;
  else if (player.age > 30) baseValue *= 0.7;
  else if (player.age > 33) baseValue *= 0.4;

  if (player.contract && player.contract.expiryDate) {
    const yearsLeft = dayjs(player.contract.expiryDate).diff(dayjs(), 'year', true);
    if (yearsLeft < 1) baseValue *= 0.6;
    else if (yearsLeft < 2) baseValue *= 0.8;
  } else {
    baseValue *= 0.5;
  }

  return Math.max(5000, Math.floor(baseValue / 1000) * 1000);
}
