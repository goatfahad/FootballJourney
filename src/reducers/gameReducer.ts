import { GameState } from '../types/gameTypes';
import { GameActions, ActionTypes } from '../types/actionTypes';
import * as GameEngine from '../gameEngine';
import dayjs from 'dayjs';

export const gameReducer = (state: GameState, action: GameActions): GameState => {
  switch (action.type) {
    case ActionTypes.INITIALIZE_NEW_GAME:
      return {
        ...action.payload,
        gameLoaded: true
      };
      
    case ActionTypes.LOAD_GAME:
      return {
        ...action.payload,
        gameLoaded: true
      };
      
    case ActionTypes.ADVANCE_TIME:
      const newDate = dayjs(state.currentDate).add(action.payload.days, 'day');
      return {
        ...state,
        currentDate: newDate.toISOString(),
        autosaveCounter: state.autosaveCounter + action.payload.days
      };
      
    case ActionTypes.UPDATE_TEAM:
      return {
        ...state,
        teams: state.teams.map(team => 
          team.id === action.payload.team.id ? action.payload.team : team
        )
      };
      
    case ActionTypes.UPDATE_PLAYER:
      return {
        ...state,
        players: state.players.map(player => 
          player.id === action.payload.player.id ? action.payload.player : player
        )
      };
      
    case ActionTypes.ADD_NEWS:
      return {
        ...state,
        news: [action.payload.newsItem, ...state.news]
      };
      
    case ActionTypes.MARK_NEWS_READ:
      return {
        ...state,
        news: state.news.map(item => 
          item.id === action.payload.id ? { ...item, isRead: true } : item
        )
      };
      
    case ActionTypes.UPDATE_GAME_SETTINGS:
      return {
        ...state,
        gameSettings: {
          ...state.gameSettings,
          ...action.payload.settings
        }
      };
      
    case ActionTypes.RESET_AUTOSAVE_COUNTER:
      return {
        ...state,
        autosaveCounter: 0
      };
      
    case ActionTypes.UPDATE_MATCH:
      return {
        ...state,
        leagues: state.leagues.map(league => ({
          ...league,
          fixtures: league.fixtures.map(match => 
            match.id === action.payload.match.id ? action.payload.match : match
          )
        }))
      };
      
    default:
      return state;
  }
};