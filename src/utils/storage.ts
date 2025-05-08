import { GameState } from '../types/gameTypes';

/**
 * Loads a saved game from localStorage
 */
export const loadGame = (slotName: string): GameState | null => {
  try {
    const savedDataString = localStorage.getItem(`fm_save_${slotName}`);
    if (!savedDataString) return null;
    
    const fullSaveObject = JSON.parse(savedDataString);
    // Check if it's old format or new format with metadata
    const parsedData = fullSaveObject.gameStateFull ? fullSaveObject.gameStateFull : fullSaveObject;
    
    return parsedData;
  } catch (error) {
    console.error('Error loading game:', error);
    throw error;
  }
};

/**
 * Saves a game to localStorage
 */
export const saveGame = (slotName: string, gameState: GameState): void => {
  try {
    // Add timestamp and other metadata
    const saveData = {
      metadata: { 
        savedAt: new Date().toISOString(), 
        managerName: gameState.teams.find(t => t.id === gameState.playerTeamId)?.manager.name,
        teamName: gameState.teams.find(t => t.id === gameState.playerTeamId)?.name,
        currentDate: gameState.currentDate 
      },
      gameStateFull: JSON.parse(JSON.stringify(gameState)) // Deep copy
    };
    
    localStorage.setItem(`fm_save_${slotName}`, JSON.stringify(saveData));
  } catch (error) {
    console.error('Error saving game:', error);
    throw error;
  }
};

/**
 * Loads list of saved games
 */
export const loadSavedGamesList = (): Array<{name: string, timestamp: string}> => {
  const saves: Array<{name: string, timestamp: string}> = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('fm_save_')) {
      const name = key.replace('fm_save_', '');
      let saveTimestamp = 'N/A';
      
      try {
        const savedItem = JSON.parse(localStorage.getItem(key) || '{}');
        if (savedItem && savedItem.metadata && savedItem.metadata.savedAt) {
          saveTimestamp = new Date(savedItem.metadata.savedAt).toLocaleString();
        } else if (savedItem && savedItem.currentDate) { // Older format fallback
          saveTimestamp = new Date(savedItem.currentDate).toLocaleString();
        }
      } catch (e) { /* ignore parsing errors */ }
      
      saves.push({ name, timestamp: saveTimestamp });
    }
  }
  
  // Sort by date descending
  saves.sort((a, b) => {
    if (a.timestamp === 'N/A') return 1;
    if (b.timestamp === 'N/A') return -1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  
  return saves;
};

/**
 * Deletes a saved game
 */
export const deleteSaveGame = (slotName: string): void => {
  localStorage.removeItem(`fm_save_${slotName}`);
};