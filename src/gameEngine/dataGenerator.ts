import { Player, Team, League, YouthCandidate, PlayerMorale, PlayerStatus, SquadRole, StadiumFacilities, MatchdayIncome, TrainingFacilities, YouthAcademy, DataAnalysisFacilities, MedicalCenter, Infrastructure, PlayerPersonality, PlayerHiddenAttributes, PlayerRelationships } from '../types/gameTypes';
import { generateId } from '../utils/idGenerator';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs'; // Ensure dayjs is imported

const MIN_AGE = 16;
const MAX_AGE = 38;
const BASE_PLAYER_VALUE = 50000;

const getRandomStat = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

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

  const defaultPersonality: PlayerPersonality = {
    ambition: getRandomStat(1, 20),
    professionalism: getRandomStat(1, 20),
    loyalty: getRandomStat(1, 20),
    leadership: getRandomStat(1, 20),
    temperament: getRandomStat(1, 20),
  };

  const defaultHiddenAttributes: PlayerHiddenAttributes = {
    naturalFitness: getRandomStat(1, 20),
    adaptability: getRandomStat(1, 20),
    versatility: getRandomStat(1, 20),
    bigGameFlair: getRandomStat(1, 20),
  };

  const defaultRelationships: PlayerRelationships = {
    fellowPlayers: new Map(),
    manager: getRandomStat(0, 100),
  };

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
    personality: defaultPersonality,
    hiddenAttributes: defaultHiddenAttributes,
    value: 0, // Will be calculated
    morale: PlayerMorale.Content,
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
    status: PlayerStatus.Active,
    squadRole: SquadRole.BackupPlayer, // Changed from 'Reserve'
    relationships: defaultRelationships,
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

  const defaultStadiumFacilities: StadiumFacilities = {
    seatingQuality: getRandomStat(50, 90),
    hospitality: getRandomStat(40, 80),
    parking: getRandomStat(30, 70),
    foodAndBeverage: getRandomStat(40, 80),
    accessibility: getRandomStat(50, 90),
  };

  const defaultMatchdayIncome: MatchdayIncome = {
    ticketRevenue: 0,
    hospitalityRevenue: 0,
    foodAndBeverageRevenue: 0,
    merchandiseRevenue: 0,
  };

  const defaultTrainingFacilities: TrainingFacilities = {
    id: generateId('tf_'),
    level: getRandomStat(1, 5),
    condition: getRandomStat(60, 100),
    specializations: [],
    maintenanceCost: getRandomStat(5000, 20000),
  };

  const defaultYouthAcademy: YouthAcademy = {
    id: generateId('ya_'),
    level: getRandomStat(1, 5),
    reputation: getRandomStat(20, 80),
    facilities: getRandomStat(30, 90),
    coaching: getRandomStat(30, 90),
    recruitment: getRandomStat(30, 90),
    maintenanceCost: getRandomStat(5000, 20000),
  };

  const defaultDataAnalysisFacilities: DataAnalysisFacilities = {
    id: generateId('daf_'),
    level: getRandomStat(1, 5),
    equipment: getRandomStat(30, 90),
    staff: getRandomStat(1, 5),
    maintenanceCost: getRandomStat(2000, 10000),
  };

  const defaultMedicalCenter: MedicalCenter = {
    id: generateId('mc_'),
    level: getRandomStat(1, 5),
    equipment: getRandomStat(40, 95),
    staff: getRandomStat(1, 5),
    rehabilitationQuality: getRandomStat(40, 95),
    maintenanceCost: getRandomStat(3000, 15000),
  };

  const teamInfrastructure: Infrastructure = {
    stadium: {
      id: generateId('std_'),
      name: `${teamName} Stadium`,
      capacity: Math.floor(Math.random() * 50000) + 10000,
      facilities: defaultStadiumFacilities,
      condition: getRandomStat(70, 100),
      expansionPossible: Math.random() > 0.5,
      matchdayIncome: defaultMatchdayIncome,
    },
    trainingFacilities: defaultTrainingFacilities,
    youthAcademy: defaultYouthAcademy,
    dataAnalysisFacilities: defaultDataAnalysisFacilities,
    medicalCenter: defaultMedicalCenter,
  };

  const team: Team = {
    id: generateId('team_'),
    name: teamName,
    shortName: teamName.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase() || 'TMN',
    country,
    leagueId,
    leagueName,
    logo: '',
    playerIds: [],
    staffIds: [], // Added missing staffIds
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
      expensesLastMonth: 0,
      infrastructureMaintenance: getRandomStat(10000, 50000),
      debtPayments: 0,
      merchandiseIncome: 0,
      tvRights: getRandomStat(1000000, 10000000),
      prizeMoney: 0,
    },
    infrastructure: teamInfrastructure,
    boardExpectations: {
      leaguePosition: Math.floor(Math.random() * 10) + 1,
      cupPerformance: 'Quarter Finals',
      financialStability: 'Maintain positive balance',
      youthDevelopment: 'Develop young players for the first team',
      playingStyle: 'Play attacking football',
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
  // Create a base young player. ClubId is null as they are not signed to any club yet.
  // Age range for youth candidates is typically 15-17.
  const basePlayer = createPlayer(null, [15, 17], true);

  // Adjust potential based on youth facility level more directly if needed,
  // or rely on createPlayer's isYouth flag which already influences potential.
  // For simplicity, we'll use the potential generated by createPlayer.
  const potential = basePlayer.stats.potential;

  // Determine potentialRating (stars) based on the player's generated potential
  // Example: 81-100 -> 5 stars, 66-80 -> 4 stars, 51-65 -> 3 stars, 36-50 -> 2 stars, <=35 -> 1 star
  let potentialRating = 1;
  if (potential > 80) potentialRating = 5;
  else if (potential > 65) potentialRating = 4;
  else if (potential > 50) potentialRating = 3;
  else if (potential > 35) potentialRating = 2;

  const youthCandidate: YouthCandidate = {
    ...basePlayer,
    id: generateId('yc_'), // Override ID with youth candidate prefix
    nationality: Math.random() < 0.7 ? teamCountry : basePlayer.nationality, // Higher chance of team's nationality
    potentialRating,
    scoutNotes: `A promising young talent from ${basePlayer.nationality}. Shows potential to be a future ${basePlayer.squadRole}.`,
    // Ensure className is 'Player' as YouthCandidate extends Player.
    // createPlayer already sets this, so it's inherited.
  };

  return youthCandidate;
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
