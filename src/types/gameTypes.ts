import dayjs from 'dayjs';

export type PlayerDuty = 'Defend' | 'Support' | 'Attack';

export type PlayerRole =
  | 'Goalkeeper'
  | 'CentreBack'
  | 'FullBack'
  | 'InvertedWingBack'
  | 'DefensiveMidfielder'
  | 'Anchor'
  | 'BallWinningMidfielder'
  | 'CentralMidfielder'
  | 'BoxToBoxMidfielder'
  | 'Playmaker' // Can be used for Deep-Lying Playmaker or Central Playmaker
  | 'AttackingMidfielder' // General Attacking Midfielder
  | 'AdvancedPlaymaker'
  | 'ShadowStriker'
  | 'Winger'
  | 'InsideForward'
  | 'TargetMan'
  | 'Poacher'
  | 'DeepLyingForward'
  | 'FalseNine';

export interface Player {
  id: string;
  name: string;
  age: number;
  dob: string;
  nationality: string;
  position: string; // General position like Defender, Midfielder
  generalPosition: string; // More specific like DC, ST - useful for formation slots
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
  assignedRole?: PlayerRole; // Tactical role assigned for the current match/setup
  assignedDuty?: PlayerDuty; // Tactical duty assigned for the current match/setup
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

// Staff Management Types
export interface Staff {
  id: string;
  name: string;
  age: number;
  nationality: string;
  role: StaffRole;
  attributes: StaffAttributes;
  contract: StaffContract;
  reputation: number;
  personality: StaffPersonality;
  specialization?: string[];
  relationships: StaffRelationships;
  className: string;
}

export enum StaffRole {
  Manager = "Manager",
  AssistantManager = "Assistant Manager",
  Coach = "Coach",
  Scout = "Scout",
  PhysioTherapist = "Physiotherapist",
  DataAnalyst = "Data Analyst",
  YouthCoach = "Youth Coach"
}

export interface StaffAttributes {
  coaching: number;
  tacticalKnowledge: number;
  manManagement: number;
  discipline: number;
  motivation: number;
  fitness: number;
  medical: number;
  scouting: number;
  youthDevelopment: number;
  dataAnalysis: number;
}

export interface StaffContract {
  clubId: string | null;
  wage: number;
  expiryDate: string;
}

export interface StaffPersonality {
  ambition: number;
  professionalism: number;
  loyalty: number;
  determination: number;
}

export interface StaffRelationships {
  players: Map<string, number>;
  fellowStaff: Map<string, number>;
}

// Infrastructure Types
export interface Infrastructure {
  stadium: Stadium;
  trainingFacilities: TrainingFacilities;
  youthAcademy: YouthAcademy;
  dataAnalysisFacilities: DataAnalysisFacilities;
  medicalCenter: MedicalCenter;
}

export interface Stadium {
  id: string;
  name: string;
  capacity: number;
  facilities: StadiumFacilities;
  condition: number;
  expansionPossible: boolean;
  matchdayIncome: MatchdayIncome;
}

export interface StadiumFacilities {
  seatingQuality: number;
  hospitality: number;
  parking: number;
  foodAndBeverage: number;
  accessibility: number;
}

export interface MatchdayIncome {
  ticketRevenue: number;
  hospitalityRevenue: number;
  foodAndBeverageRevenue: number;
  merchandiseRevenue: number;
}

export interface TrainingFacilities {
  id: string;
  level: number;
  condition: number;
  specializations: TrainingSpecialization[];
  maintenanceCost: number;
}

export interface TrainingSpecialization {
  type: string;
  level: number;
  effect: number;
}

export interface YouthAcademy {
  id: string;
  level: number;
  reputation: number;
  facilities: number;
  coaching: number;
  recruitment: number;
  maintenanceCost: number;
}

export interface DataAnalysisFacilities {
  id: string;
  level: number;
  equipment: number;
  staff: number;
  maintenanceCost: number;
}

export interface MedicalCenter {
  id: string;
  level: number;
  equipment: number;
  staff: number;
  rehabilitationQuality: number;
  maintenanceCost: number;
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
  staffIds: string[];
  squad: TeamSquad;
  formation: string; // This likely stores the formation key e.g. "4-4-2"
  tactics: TeamTactics; // General team tactics
  finances: TeamFinances;
  infrastructure: Infrastructure;
  boardExpectations: BoardExpectations;
  manager: TeamManager;
  history: any[];
  youthCandidates: YouthCandidate[];
  className: string;
}

// It might be beneficial to have a more structured type for tactical setup
// For example, representing each slot in a formation with player, role, and duty.
// For now, role/duty are on Player, representing their current assignment.
export interface TacticalSlot {
  positionKey: string; // e.g., 'DC_left', 'ST_right' - unique identifier for the slot
  playerId: string | null;
  role?: PlayerRole;
  duty?: PlayerDuty;
}

export interface TeamFormation {
  name: string; // e.g., "4-4-2 Diamond"
  slots: TacticalSlot[];
}


export interface TeamSquad {
  startingXI: string[]; // Array of Player IDs
  subs: string[]; // Array of Player IDs
  reserves: string[]; // Array of Player IDs
}

export interface TeamTactics { // These are general team instructions
  mentality: string;
  passingStyle: string;
  pressingIntensity: string;
  // We might add more here later, like defensive line, width, tempo etc.
  // Player-specific instructions will be driven by their role/duty for now.
}

export interface TeamFinances {
  balance: number;
  wageBudget: number;
  transferBudget: number;
  sponsorships: Sponsorship[];
  incomeLastMonth: number;
  expensesLastMonth: number;
  infrastructureMaintenance: number;
  debtPayments: number;
  merchandiseIncome: number;
  tvRights: number;
  prizeMoney: number;
}

export interface Sponsorship {
  name: string;
  amountPerSeason: number;
  durationYears: number;
  startDate: string;
  endDate: string;
}

export interface BoardExpectations {
  leaguePosition: number;
  cupPerformance: string;
  financialStability: string;
  youthDevelopment: string;
  playingStyle: string;
}

export interface TeamManager {
  name: string;
  isHuman: boolean;
  reputation?: number;
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
  // We'll need to store the tactical setup for each team for the match
  // including player roles and duties, perhaps as snapshots.
  homeTeamTacticalSetup?: TacticalSlot[]; // Snapshot of roles/duties for home team
  awayTeamTacticalSetup?: TacticalSlot[]; // Snapshot of roles/duties for away team
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
  liveHomeTactics?: Partial<TeamTactics>; // General team tactics
  liveAwayTactics?: Partial<TeamTactics>; // General team tactics
  // For live match, we'd also need the specific player roles/duties
  liveHomePlayerAssignments?: TacticalSlot[];
  liveAwayPlayerAssignments?: TacticalSlot[];
}

export interface GameState {
  currentDate: string;
  playerTeamId: string | null;
  teams: Team[];
  players: Player[];
  staff: Staff[];
  leagues: League[];
  news: NewsItem[];
  gameSettings: GameSettings;
  transferOfferQueue: TransferOffer[];
  jobOffers: any[];
  seasonYear: number;
  processedEndOfSeason: boolean;
  autosaveCounter: number;
  gameLoaded: boolean;
  liveMatch: LiveMatchState | null;
  // It might be good to store the current team's detailed tactical setup here
  // if it's not directly on the Team object or if multiple setups are possible.
  // For now, player.assignedRole/Duty will hold the current active assignment.
}

export interface NewGameSettings {
  managerName: string;
  selectedClubId: string;
  playersPerTeam: number;
}

export interface TransferOffer {
  player: Player | null; // Should ideally be Player ID and then resolved
  fee: number;
  // Add more details: offeringClubId, targetClubId, clauses, etc.
}

export interface ContractOffer {
  player: Player | null; // Should ideally be Player ID
  wage: number;
  years: number;
  signingBonus: number;
  // Add more details: clubId offering, etc.
}

// Added for clarity, though not directly part of this step's core changes
// This represents a player who is part of a youth intake.
export interface YouthCandidate extends Player {
  potentialRating: number; // e.g. A, B, C or 1-5 stars
  scoutNotes: string;
}
