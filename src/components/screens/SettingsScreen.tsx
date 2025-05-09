import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { saveGame, loadGame, loadSavedGamesList, deleteSaveGame } from '../../utils/storage'; // Assuming these exist
import { ActionTypes } from '../../types/actionTypes';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { initialGameState } from '../../data/initialState'; // For reset

export const SettingsScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [saveName, setSaveName] = useState('MySave'); // Default save name
  const [savedGames, setSavedGames] = useState<Array<{name: string, timestamp: string}>>([]);
  const [selectedLoadSlot, setSelectedLoadSlot] = useState<string>('');

  // Load saved games list on mount
  useEffect(() => {
    setSavedGames(loadSavedGamesList());
  }, []);

  const handleSaveGame = () => {
    if (!saveName.trim()) {
      toast.error("Please enter a name for your save game.");
      return;
    }
    try {
      saveGame(saveName.trim(), state);
      toast.success(`Game saved as "${saveName.trim()}"`);
      setSavedGames(loadSavedGamesList()); // Refresh list
    } catch (error) {
      console.error("Error saving game:", error);
      toast.error("Failed to save game. Check console for details.");
    }
  };

  const handleLoadGame = () => {
    if (!selectedLoadSlot) {
       toast.error("Please select a game to load.");
       return;
    }
    try {
      const loadedState = loadGame(selectedLoadSlot);
      if (loadedState) {
        // Ensure gameLoaded is true when dispatching LOAD_GAME
        dispatch({ type: ActionTypes.LOAD_GAME, payload: { ...loadedState, gameLoaded: true } });
        toast.success(`Game "${selectedLoadSlot}" loaded successfully.`);
        // Optionally navigate to dashboard or stay here
        // navigate('/game/dashboard'); 
      } else {
         toast.error(`Could not load save game "${selectedLoadSlot}".`);
      }
    } catch (error) {
       console.error("Error loading game:", error);
       toast.error("Failed to load game. Check console for details.");
    }
  };
  
  const handleDeleteSave = (slotName: string) => {
     if (window.confirm(`Are you sure you want to delete the save game "${slotName}"? This cannot be undone.`)) {
        try {
           deleteSaveGame(slotName);
           toast.info(`Save game "${slotName}" deleted.`);
           setSavedGames(loadSavedGamesList()); // Refresh list
           if (selectedLoadSlot === slotName) {
              setSelectedLoadSlot(''); // Clear selection if deleted slot was selected
           }
        } catch (error) {
           console.error("Error deleting save game:", error);
           toast.error("Failed to delete save game.");
        }
     }
  };

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset the game? All progress will be lost and you will return to the title screen.')) {
      // Reset state using initial state (or a specific reset action if available)
      dispatch({ 
        type: ActionTypes.LOAD_GAME, // Using LOAD_GAME to replace state entirely
        payload: { ...initialGameState, gameLoaded: false } 
      });
      navigate('/'); // Navigate back to title screen
    }
  };
  
  const handleAutosaveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     const interval = parseInt(e.target.value, 10);
     // Ensure gameSettings exists before dispatching update
     const currentSettings = state.gameSettings || { autosaveInterval: 7, theme: 'dark' }; // Provide default if null
     dispatch({
        type: ActionTypes.UPDATE_GAME_SETTINGS,
        payload: { settings: { ...currentSettings, autosaveInterval: interval } }
     });
  };

  // Ensure gameSettings exists before accessing its properties
  const currentAutosaveInterval = state.gameSettings?.autosaveInterval ?? 7; // Default to 7 if undefined
  const currentTheme = state.gameSettings?.theme ?? 'dark'; // Default to dark if undefined

  if (!state.gameLoaded) {
    // Allow access even if game not fully loaded, but check state availability
     return <div className="p-4 text-center">Loading settings... (Game not fully loaded)</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings & Save/Load</h1>

      {/* Save Game Section */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Save Game</h2>
        <div className="flex items-center space-x-3">
          <input 
            type="text" 
            value={saveName} 
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Save Name"
            className="flex-grow bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm p-2 text-sm" 
          />
          <Button onClick={handleSaveGame} variant="success">Save</Button>
        </div>
      </section>

      {/* Load Game Section */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
         <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Load Game</h2>
         {savedGames.length > 0 ? (
            <ul className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2 mb-3">
               {savedGames.map(save => (
                  <li key={save.name} 
                      className={`flex justify-between items-center p-2 rounded cursor-pointer ${selectedLoadSlot === save.name ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      onClick={() => setSelectedLoadSlot(save.name)}
                  >
                     <div>
                        <span className="font-medium">{save.name}</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">{save.timestamp}</span>
                     </div>
                     <Button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteSave(save.name); }} 
                        variant="danger" 
                        size="sm"
                     >
                        Delete
                     </Button>
                  </li>
               ))}
            </ul>
         ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-3">No saved games found.</p>
         )}
         <Button onClick={handleLoadGame} variant="primary" disabled={!selectedLoadSlot || savedGames.length === 0}>
            Load Selected Game
         </Button>
      </section>
      
      {/* Game Settings Section */}
       <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
         <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Game Settings</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label htmlFor="autosaveInterval" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Autosave Interval (Days)</label>
               <select 
                  id="autosaveInterval" 
                  value={currentAutosaveInterval} 
                  onChange={handleAutosaveChange}
                  className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm p-2 text-sm"
               >
                  <option value={0}>Disabled</option>
                  <option value={7}>Weekly (7 days)</option>
                  <option value={14}>Bi-Weekly (14 days)</option>
                   <option value={30}>Monthly (30 days)</option>
                </select>
             </div>
             {/* Theme Toggle */}
             <div>
                <label htmlFor="themeToggle" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Theme
                </label>
                <Button 
                  id="themeToggle"
                  onClick={() => {
                     // Ensure gameSettings exists before dispatching update
                     const currentSettings = state.gameSettings || { autosaveInterval: 7, theme: 'dark' };
                     dispatch({ 
                       type: ActionTypes.UPDATE_GAME_SETTINGS, 
                       payload: { settings: { ...currentSettings, theme: currentTheme === 'dark' ? 'light' : 'dark' } } 
                     });
                  }}
                  variant="secondary"
                  className="w-full capitalize"
                >
                  Switch to {currentTheme === 'dark' ? 'Light' : 'Dark'} Mode
                </Button>
             </div>
          </div>
       </section>
 
      {/* Reset Game Section */}
      <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Reset Game</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Warning: This will delete all current progress and return you to the title screen.</p>
        <Button onClick={handleResetGame} variant="danger">Reset Game</Button>
      </section>

    </div>
  );
};
