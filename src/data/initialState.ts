import { GameState } from '../types/gameTypes';

export const initialGameState: GameState = {
  currentDate: '',
  playerTeamId: null,
  teams: [],
  players: [],
  leagues: [],
  news: [],
  gameSettings: {
    autosaveInterval: 7
  },
  transferOfferQueue: [],
  jobOffers: [],
  seasonYear: new Date().getFullYear(),
  processedEndOfSeason: false,
  autosaveCounter: 0,
  gameLoaded: false
};