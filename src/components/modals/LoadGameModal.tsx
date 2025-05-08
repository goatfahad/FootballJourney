import React from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Modal } from './Modal';
import { ActionTypes } from '../../types/actionTypes';
import { loadGame, deleteSaveGame } from '../../utils/storage';
import { toast } from 'react-toastify';

interface LoadGameModalProps {
  onClose: () => void;
  onGameLoaded: () => void;
  savedGames: Array<{name: string, timestamp: string}>;
}

export const LoadGameModal: React.FC<LoadGameModalProps> = ({ 
  onClose, 
  onGameLoaded,
  savedGames 
}) => {
  const { dispatch, startLoading, stopLoading } = useGame();
  
  const handleLoadGame = async (slotName: string) => {
    startLoading(`Loading game: ${slotName}...`);
    
    try {
      const gameState = await loadGame(slotName);
      
      if (!gameState) {
        toast.error(`Save slot ${slotName} not found.`);
        return;
      }
      
      dispatch({
        type: ActionTypes.LOAD_GAME,
        payload: gameState
      });
      
      toast.success(`Game loaded from slot: ${slotName}`);
      onGameLoaded();
    } catch (error) {
      console.error('Error loading game:', error);
      toast.error(`Error loading game. Save might be corrupted.`);
    } finally {
      stopLoading();
    }
  };
  
  const handleDeleteSave = (slotName: string) => {
    if (window.confirm(`Are you sure you want to delete save slot: ${slotName}?`)) {
      deleteSaveGame(slotName);
      toast.success(`Save slot ${slotName} deleted.`);
      // In a real app, this would update the savedGames list
    }
  };
  
  return (
    <Modal title="Load Game" onClose={onClose}>
      {savedGames.length === 0 && (
        <div className="text-gray-400">No saved games found.</div>
      )}
      
      <div className="space-y-3">
        {savedGames.map((slot, index) => (
          <div 
            key={index}
            className="flex justify-between items-center p-3 bg-gray-700 rounded-md hover:bg-gray-600"
          >
            <span className="text-white">
              {slot.name} (Saved: {slot.timestamp})
            </span>
            <div>
              <Button 
                onClick={() => handleLoadGame(slot.name)} 
                variant="success" 
                size="sm"
                className="mr-2"
              >
                Load
              </Button>
              <Button 
                onClick={() => handleDeleteSave(slot.name)} 
                variant="danger" 
                size="sm"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end mt-6">
        <Button onClick={onClose} variant="secondary">
          Back to Title
        </Button>
      </div>
    </Modal>
  );
};