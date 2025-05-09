import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { NewGameModal } from '../modals/NewGameModal';
import { LoadGameModal } from '../modals/LoadGameModal';
import { loadSavedGamesList } from '../../utils/storage';
import { toast } from 'react-toastify';
// ActionTypes and initialGameState might not be strictly needed here anymore
// if all game state setup is handled within modals and reducer.
// import { ActionTypes } from '../../types/actionTypes'; 
// import { initialGameState } from '../../data/initialState';

// LinkedIn Icon SVG
const LinkedInIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="text-gray-400 hover:text-blue-400 dark:text-gray-500 dark:hover:text-blue-500 transition-colors duration-150"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);


interface TitleScreenProps {
  setIsLoaded: (loaded: boolean) => void; // This prop is from App.tsx for its local loading state
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ setIsLoaded }) => {
  // Removed dispatch and related imports if TitleScreen itself doesn't reset game state directly
  // const { state: gameState, dispatch } = useGame(); 
  const { state: gameState } = useGame(); // Only need state if checking gameLoaded for some reason
  const navigate = useNavigate();
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showLoadGameModal, setShowLoadGameModal] = useState(false);
  const [savedGames, setSavedGames] = useState<Array<{name: string, timestamp: string}>>([]);
  const [gameLoadProcessInitiated, setGameLoadProcessInitiated] = useState(false);

  useEffect(() => {
    // Load saved games list when the component mounts
    setSavedGames(loadSavedGamesList());
    // The responsibility of resetting gameLoaded to false when on TitleScreen
    // should ideally be handled by a route change listener in App.tsx or GameContext,
    // or by ensuring modals/navigation always set gameLoaded appropriately.
    // For now, assuming modals handle setting gameLoaded to true upon success.
    // And App.tsx might handle setting it to false if navigating TO "/"
    setIsLoaded(false); // Indicate App.tsx that title screen is active (for its local loading state)
  }, [setIsLoaded]);

  // Effect to handle navigation after game state is confirmed loaded from context
  useEffect(() => {
    if (gameState.gameLoaded && gameLoadProcessInitiated) {
      setIsLoaded(true); // Signal App.tsx that game data is ready
      navigate('/game/dashboard');
      setGameLoadProcessInitiated(false); // Reset flag
    }
  }, [gameState.gameLoaded, gameLoadProcessInitiated, navigate, setIsLoaded]);

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

  // These are called by the modals AFTER the modals have dispatched actions
  // to update the GameContext (which should set gameLoaded = true)
  const handleNewGameCreated = () => {
    setShowNewGameModal(false); 
    setGameLoadProcessInitiated(true); // Trigger useEffect to check gameLoaded and navigate
  };

  const handleGameLoaded = () => {
    setShowLoadGameModal(false); 
    setGameLoadProcessInitiated(true); // Trigger useEffect to check gameLoaded and navigate
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 dark:bg-gray-950 text-gray-200 p-4 relative">
      <div className="w-full max-w-lg flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-10 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 text-transparent bg-clip-text animate-pulse">
          FootballJourney
        </h1>
        
        <div className="space-y-5 w-full max-w-xs">
          <Button 
            onClick={handleStartNewGame}
            variant="primary"
            size="lg"
            className="w-full transition-transform transform hover:scale-105"
          >
            New Game
          </Button>
          <Button 
            onClick={handleLoadGame}
            variant="secondary"
            size="lg"
            className="w-full transition-transform transform hover:scale-105"
            disabled={savedGames.length === 0}
          >
            Load Game
          </Button>
        </div>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500 dark:text-gray-600 space-y-1">
         <p>Version 1.0.0</p>
         <p>Created by Muhammad Fahad Nauman</p>
         <a 
           href="https://www.linkedin.com/in/muhammad-fahad-nauman-6229442a9/" 
           target="_blank" 
           rel="noopener noreferrer"
           aria-label="Muhammad Fahad Nauman LinkedIn Profile"
           className="inline-block mt-1"
         >
           <LinkedInIcon /> {/* Use the actual SVG component */}
         </a>
      </footer>

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
