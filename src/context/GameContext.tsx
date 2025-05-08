import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { gameReducer } from '../reducers/gameReducer';
import { initialGameState } from '../data/initialState';
import { Player, Team, League, GameState } from '../types/gameTypes';
import { GameActions, ActionTypes } from '../types/actionTypes';
import { loadGame, saveGame } from '../utils/storage';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameActions>;
  isLoading: boolean;
  loadingMessage: string;
  startLoading: (message: string) => void;
  stopLoading: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface LoadingState {
  isLoading: boolean;
  message: string;
}

export const GameProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [loading, setLoading] = useReducer(
    (state: LoadingState, action: Partial<LoadingState> | null) => {
      if (action === null) return { isLoading: false, message: '' };
      return { ...state, ...action };
    },
    { isLoading: false, message: '' }
  );

  const startLoading = (message: string) => {
    setLoading({ isLoading: true, message });
  };

  const stopLoading = () => {
    setLoading(null);
  };

  // Auto-saving functionality
  useEffect(() => {
    if (state.gameLoaded && state.gameSettings.autosaveInterval > 0 && state.autosaveCounter >= state.gameSettings.autosaveInterval) {
      saveGame('Autosave', state);
      dispatch({ type: ActionTypes.RESET_AUTOSAVE_COUNTER });
      // Could add a notification here
    }
  }, [state.autosaveCounter, state.gameLoaded, state.gameSettings.autosaveInterval]);

  const value = {
    state,
    dispatch,
    isLoading: loading.isLoading,
    loadingMessage: loading.message,
    startLoading,
    stopLoading
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};