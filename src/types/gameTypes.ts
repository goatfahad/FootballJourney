import dayjs from 'dayjs';

export interface Player {
  id: string;
  name: string;
  age: number;
  dob: string;
  nationality: string;
  position: string;
  generalPosition: string;
  stats: PlayerStats;
  personality: PlayerPersonality;
  hiddenAttributes: PlayerHiddenAttributes;
  contract: PlayerContract;
  value: number;
  morale: PlayerMorale;
  form: number;
  injury: PlayerInjury | null;
  suspension: PlayerSuspension | null;
  seasonalStats: PlayerSeasonalStats;
  historicalStats: PlayerSeasonalStats[];
  isRegen: boolean;
  willRetire: boolean;
  status: PlayerStatus;
  squadRole: SquadRole;
  trainingFocus?: string;
  relationships: PlayerRelationships;
  className: string;
}

export interface PlayerPersonality {
  ambition: number;
  professionalism: number;
  loyalty: number;
  leadership: number;
  temperament: number;
}

export interface PlayerHiddenAttributes {
  naturalFitness: number;
  adaptability: number;
  versatility: number;
  bigGameFlair: number;
}

export interface PlayerStats {
  passing: number;
  shooting: number;
  tackling: number;
  dribbling: number;
  heading: number;
  technique: number;
  handling: number;
  reflexes: number;
  aggression: number;
  positioning: number;
  vision: number;
  composure: number;
  workRate: number;
  pace: number;
  stamina: number;
  strength: number;
  potential: number;
  consistency: number;
  injuryProneness: number;
}

export interface PlayerContract {
  clubId: string | null;
  wage: number;
  expiryDate: string | null;
  signingBonus: number;
  releaseClause: number;
}

export interface PlayerInjury {
  type: string;
  duration: number;
  returnDate: string;
}

export interface PlayerSuspension {
  type: string;
  duration: number;
}

export interface PlayerSeasonalStats {
  appearances: number;
  goals: number;
  assists: number;
  avgRating: number;
  season?: string;
  clubId?: string | null;
}

export enum PlayerMorale {
  Ecstatic = "Ecstatic",
  Happy = "Happy",
  Content = "Content",
  Unsettled = "Unsettled",
  Unhappy = "Unhappy",
  VeryUnhappy = "Very Unhappy"
}

export enum PlayerStatus {
  Active = "Active",
  Injured = "Injured",
  Suspended = "Suspended",
  Listed = "Listed",
  AwayOnLoan = "Away on Loan"
}

export enum SquadRole {
  KeyPlayer = "Key Player",
  FirstTeam = "First Team",
  RotationOption = "Rotation Option",
  BackupPlayer = "Backup Player",
  NotNeeded = "Not Needed",
  HotProspect = "Hot Prospect",
  YouthPlayer = "Youth Player"
}

export interface PlayerRelationships {
  fellowPlayers: Map<string, number>;
  manager: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  country: string;
  leagueId: string | null;
  leagueName?: string;
  logo: string;
  playerIds: string[];
  squad: TeamSquad;
  formation: string;
  tactics: TeamTactics;
  finances: TeamFinances;
  stadium: TeamStadium;
  trainingFacilitiesLevel: number;
  youthFacilitiesLevel: number;
  boardExpectations: BoardExpectations;
  manager: TeamManager;
  history: any[];
  youthCandidates: YouthCandidate[];
  className: string;
}

export interface TeamSquad {
  startingXI: string[];
  subs: string[];
  reserves: string[];
}

export interface TeamTactics {
  mentality: string;
  passingStyle: string;
  pressingIntensity: string;
}

export interface TeamFinances {
  balance: number;
  wageBudget: number;
  transferBudget: number;
  sponsorships: Sponsorship[];
  incomeLastMonth: number;
  expensesLastMonth: number;
}

export interface Sponsorship {
  name: string;
  amountPerSeason: number;
  durationYears: number;
  startDate: string;
  endDate: string;
}

export interface TeamStadium {
  name: string;
  capacity: number;
}

export interface BoardExpectations {
  leaguePosition: number;
  cupPerformance: string;
  financialStability: string;
}

export interface TeamManager {
  name: string;
  isHuman: boolean;
  reputation?: number;
}

export interface YouthCandidate {
  id: string;
  age: number;
  position: string;
  potentialStars: number;
  potentialActual: number;
  nationality: string;
  nameStub: string;
}

export interface League {
  id: string;
  name: string;
  country: string;
  level: number;
  teamIds: string[];
  fixtures: Match[];
  table: LeagueTableEntry[];
  promotionSpots: number;
  relegationSpots: number;
  currentMatchday: number;
  isFinished: boolean;
  className: string;
}

export interface LeagueTableEntry {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position?: number;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  leagueId: string;
  status: 'scheduled' | 'in_progress' | 'played';
  result: MatchResult;
  events: MatchEvent[];
  stats: MatchStats;
  commentaryLog: MatchCommentary[];
  className: string;
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
}

export interface MatchEvent {
  minute: number;
  type: string;
  playerId?: string;
  teamId?: string;
  details?: string;
  assistedBy?: string;
}

export interface MatchStats {
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homePossession: number;
  awayPossession: number;
}

export interface MatchCommentary {
  id?: string;
  minute: number;
  text: string;
  type?: string;
}

export interface NewsItem {
  id: string;
  date: string;
  type: string;
  subject: string;
  message: string;
  isRead: boolean;
  data?: any;
  teamId?: string | null;
}

export interface GameSettings {
  autosaveInterval: number;
  theme?: 'light' | 'dark';
}

export interface LiveMatchState {
  matchId: string;
  minute: number;
  homeScore: number;
  awayScore: number;
  status: 'playing' | 'paused' | 'half-time' | 'full-time';
  ballPosition: { x: number; y: number };
  commentary: MatchCommentary[];
  liveHomeTactics?: Partial<TeamTactics>;
  liveAwayTactics?: Partial<TeamTactics>;
}

export interface GameState {
  currentDate: string;
  playerTeamId: string | null;
  teams: Team[];
  players: Player[];
  leagues: League[];
  news: NewsItem[];
  gameSettings: GameSettings;
  transferOfferQueue: any[];
  jobOffers: any[];
  seasonYear: number;
  processedEndOfSeason: boolean;
  autosaveCounter: number;
  gameLoaded: boolean;
  liveMatch: LiveMatchState | null;
}

export interface NewGameSettings {
  managerName: string;
  selectedClubId: string;
  playersPerTeam: number;
}

export interface TransferOffer {
  player: Player | null;
  fee: number;
}

export interface ContractOffer {
  player: Player | null;
  wage: number;
  years: number;
  signingBonus: number;
}