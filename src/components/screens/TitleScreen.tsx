import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { NewGameModal } from '../modals/NewGameModal';
import { LoadGameModal } from '../modals/LoadGameModal';
import { loadSavedGamesList } from '../../utils/storage';
import { toast } from 'react-toastify';

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
  setIsLoaded: (loaded: boolean) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ setIsLoaded }) => {
  const { state: gameState } = useGame();
  const navigate = useNavigate();
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showLoadGameModal, setShowLoadGameModal] = useState(false);
  const [savedGames, setSavedGames] = useState<Array<{name: string, timestamp: string}>>([]);
  const [gameLoadProcessInitiated, setGameLoadProcessInitiated] = useState(false);

  const quotes = useMemo(() => [
    { text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing or learning to do.", author: "Pelé" },
    { text: "I learned all about life with a ball at my feet.", author: "Ronaldinho" },
    { text: "You have to fight to reach your dream. You have to sacrifice and work hard for it.", author: "Lionel Messi" },
    { text: "I fear no one, but respect everyone.", author: "Zlatan Ibrahimović" },
    { text: "Some people think football is a matter of life and death. I don't like that attitude. I can assure them it is much more serious than that.", author: "Bill Shankly" }
  ], []);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 7000); // Change quote every 7 seconds

    return () => clearInterval(quoteInterval);
  }, [quotes.length]);

  useEffect(() => {
    setSavedGames(loadSavedGamesList());
    setIsLoaded(false); 
  }, [setIsLoaded]);

  useEffect(() => {
    if (gameState.gameLoaded && gameLoadProcessInitiated) {
      setIsLoaded(true); 
      navigate('/game/dashboard');
      setGameLoadProcessInitiated(false); 
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

  const handleNewGameCreated = () => {
    setShowNewGameModal(false); 
    setGameLoadProcessInitiated(true); 
  };

  const handleGameLoaded = () => {
    setShowLoadGameModal(false); 
    setGameLoadProcessInitiated(true); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 dark:bg-gray-950 text-gray-200 p-4 relative overflow-hidden"> {/* Added overflow-hidden for panning */}
      <div className="w-full max-w-lg flex flex-col items-center justify-center text-center z-10"> {/* Ensure content is above quotes if they overlap */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 text-transparent bg-clip-text animate-pulse">
          FootballJourney
        </h1>

        {/* Panning Quotes Area */}
        <div className="h-16 mb-8 w-full max-w-md relative"> {/* Increased height, relative for absolute positioning of quote text */}
          <div 
            key={currentQuoteIndex} // Change key to re-trigger animation
            className="absolute inset-0 flex flex-col items-center justify-center animate-panQuoteLR" // Apply panning animation (to be defined in CSS)
          >
            <p className="text-md italic text-gray-300 dark:text-gray-400 text-center">"{quotes[currentQuoteIndex].text}"</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">- {quotes[currentQuoteIndex].author}</p>
          </div>
        </div>
        
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

      <footer className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500 dark:text-gray-600 space-y-1 z-10">
         <p>Version 1.0.0</p>
         <p>Created by Muhammad Fahad Nauman</p>
         <a 
           href="https://www.linkedin.com/in/muhammad-fahad-nauman-6229442a9/" 
           target="_blank" 
           rel="noopener noreferrer"
           aria-label="Muhammad Fahad Nauman LinkedIn Profile"
           className="inline-block mt-1"
         >
           <LinkedInIcon />
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
