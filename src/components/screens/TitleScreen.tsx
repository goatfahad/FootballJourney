import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { NewGameModal } from '../modals/NewGameModal';
import { LoadGameModal } from '../modals/LoadGameModal';
import { loadSavedGamesList } from '../../utils/storage';
import { toast } from 'react-toastify';
import { ActionTypes } from '../../types/actionTypes';
import { initialGameState } from '../../data/initialState';

interface TitleScreenProps {
  setIsLoaded: (loaded: boolean) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ setIsLoaded }) => {
  const { dispatch } = useGame();
  const navigate = useNavigate();
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showLoadGameModal, setShowLoadGameModal] = useState(false);
  const [savedGames, setSavedGames] = useState<Array<{name: string, timestamp: string}>>([]);

  useEffect(() => {
    // Reset game state when returning to title screen
    dispatch({ 
      type: ActionTypes.LOAD_GAME, 
      payload: {
        ...initialGameState,
        gameLoaded: false
      } 
    });
    
    // Load saved games list
    setSavedGames(loadSavedGamesList());
  }, [dispatch]);

  const handleStartNewGame = () => {
    setShowNewGameModal(true);
  };

  const handleLoadGame = () => {
    if (savedGames.length === 0) {
      toast.info("No saved games available.");
      return;
    }
    setShowLoadGameModal(true);
  };

  const handleNewGameCreated = () => {
    setIsLoaded(true);
    navigate('/game/dashboard');
  };

  const handleGameLoaded = () => {
    setIsLoaded(true);
    navigate('/game/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="min-h-[80vh] w-full max-w-4xl flex flex-col items-center justify-center bg-gray-800 p-8 rounded-lg shadow-xl">
        <h1 className="text-5xl font-bold text-white mb-12">FootballJourney</h1>
        <div className="space-y-6">
          <Button 
            onClick={handleStartNewGame}
            variant="primary"
            size="lg"
            className="w-64"
          >
            New Game
          </Button>
          <Button 
            onClick={handleLoadGame}
            variant="secondary"
            size="lg"
            className="w-64"
            disabled={savedGames.length === 0}
          >
            Load Game
          </Button>
        </div>
        <p className="text-gray-400 mt-12 text-sm">Version 1.0.0</p>
      </div>

      {showNewGameModal && (
        <NewGameModal 
          onClose={() => setShowNewGameModal(false)} 
          onGameCreated={handleNewGameCreated}
        />
      )}

      {showLoadGameModal && (
        <LoadGameModal 
          onClose={() => setShowLoadGameModal(false)} 
          onGameLoaded={handleGameLoaded}
          savedGames={savedGames}
        />
      )}
    </div>
  );
};