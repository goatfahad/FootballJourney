import { GameState, GameSettings, Player, Team, Match, NewsItem, LiveMatchState } from './gameTypes'; // Added LiveMatchState

export enum ActionTypes {
  INITIALIZE_NEW_GAME = 'INITIALIZE_NEW_GAME',
  LOAD_GAME = 'LOAD_GAME',
  ADVANCE_TIME = 'ADVANCE_TIME',
  UPDATE_TEAM = 'UPDATE_TEAM',
  UPDATE_PLAYER = 'UPDATE_PLAYER',
  ADD_NEWS = 'ADD_NEWS',
  MARK_NEWS_READ = 'MARK_NEWS_READ',
  UPDATE_GAME_SETTINGS = 'UPDATE_GAME_SETTINGS',
  RESET_AUTOSAVE_COUNTER = 'RESET_AUTOSAVE_COUNTER',
  UPDATE_MATCH = 'UPDATE_MATCH',
  // Live Match Actions
  START_LIVE_MATCH = 'START_LIVE_MATCH',
  UPDATE_LIVE_MATCH = 'UPDATE_LIVE_MATCH', // For minute-by-minute updates
  END_LIVE_MATCH = 'END_LIVE_MATCH',
  // PAUSE_LIVE_MATCH = 'PAUSE_LIVE_MATCH', // Could add later
  // RESUME_LIVE_MATCH = 'RESUME_LIVE_MATCH', // Could add later
}

// Define action interfaces
interface InitializeNewGameAction {
  type: ActionTypes.INITIALIZE_NEW_GAME;
  payload: GameState;
}

interface LoadGameAction {
  type: ActionTypes.LOAD_GAME;
  payload: GameState;
}

interface AdvanceTimeAction {
  type: ActionTypes.ADVANCE_TIME;
  payload: {
    days: number;
  };
}

interface UpdateTeamAction {
  type: ActionTypes.UPDATE_TEAM;
  payload: {
    team: Team;
  };
}

interface UpdatePlayerAction {
  type: ActionTypes.UPDATE_PLAYER;
  payload: {
    player: Player;
  };
}

interface AddNewsAction {
  type: ActionTypes.ADD_NEWS;
  payload: {
    newsItem: NewsItem;
  };
}

interface MarkNewsReadAction {
  type: ActionTypes.MARK_NEWS_READ;
  payload: {
    id: string;
  };
}

interface UpdateGameSettingsAction {
  type: ActionTypes.UPDATE_GAME_SETTINGS;
  payload: {
    settings: Partial<GameSettings>;
  };
}

interface ResetAutosaveCounterAction {
  type: ActionTypes.RESET_AUTOSAVE_COUNTER;
}

interface UpdateMatchAction {
  type: ActionTypes.UPDATE_MATCH;
  payload: {
    match: Match;
  };
}

// Live Match Action Interfaces
interface StartLiveMatchAction {
  type: ActionTypes.START_LIVE_MATCH;
  payload: { matchId: string };
}

interface UpdateLiveMatchAction {
   type: ActionTypes.UPDATE_LIVE_MATCH;
   payload: { liveMatchState: Partial<LiveMatchState> }; // Send partial updates
}

interface EndLiveMatchAction {
   type: ActionTypes.END_LIVE_MATCH;
   // No payload needed, just clears the liveMatch state
}


export type GameActions =
  | InitializeNewGameAction
  | LoadGameAction
  | AdvanceTimeAction
  | UpdateTeamAction
  | UpdatePlayerAction
  | AddNewsAction
  | MarkNewsReadAction
  | UpdateGameSettingsAction
  | ResetAutosaveCounterAction
  | UpdateMatchAction
  | StartLiveMatchAction
  | UpdateLiveMatchAction
  | EndLiveMatchAction;
