import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Modal } from './Modal';
import { ActionTypes } from '../../types/actionTypes';
import { faker } from '@faker-js/faker';
import { initializeNewGame } from '../../gameEngine/gameInitializer';

interface NewGameModalProps {
  onClose: () => void;
  onGameCreated: () => void;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({ onClose, onGameCreated }) => {
  const { dispatch, startLoading, stopLoading } = useGame();
  const [managerName, setManagerName] = useState(faker.person.fullName());
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [playersPerTeam, setPlayersPerTeam] = useState(20);
  const [potentialTeams, setPotentialTeams] = useState<Array<{id: string, name: string, leagueName: string}>>([]);
  
  useEffect(() => {
    // In a real app, this would fetch potential teams from the game engine
    // For now, we'll create a dummy list
    const teams = [
      { id: 'team_1', name: 'London FC', leagueName: 'Premier League' },
      { id: 'team_2', name: 'Manchester United', leagueName: 'Premier League' },
      { id: 'team_3', name: 'Liverpool FC', leagueName: 'Premier League' },
      { id: 'team_4', name: 'FC Barcelona', leagueName: 'La Liga' },
      { id: 'team_5', name: 'Real Madrid', leagueName: 'La Liga' },
      { id: 'team_6', name: 'Bayern Munich', leagueName: 'Bundesliga' }
    ];
    
    setPotentialTeams(teams);
    if (teams.length > 0) {
      setSelectedClubId(teams[0].id);
    }
  }, []);
  
  const handleStartGame = async () => {
    if (!managerName || !selectedClubId) {
      // Show error
      return;
    }
    
    startLoading('Initializing New Game...');
    
    try {
      const newGameSettings = {
        managerName,
        selectedClubId,
        playersPerTeam
      };
      
      // In a real app, this would call the game engine to initialize a new game
      const gameState = await initializeNewGame(newGameSettings);
      
      dispatch({
        type: ActionTypes.INITIALIZE_NEW_GAME,
        payload: gameState
      });
      
      onGameCreated();
    } catch (error) {
      console.error('Error starting new game:', error);
      // Show error notification
    } finally {
      stopLoading();
    }
  };
  
  return (
    <Modal title="New Game Setup" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label htmlFor="managerName" className="block text-sm font-medium text-gray-300">
            Manager Name:
          </label>
          <input
            type="text"
            id="managerName"
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          />
        </div>
        
        <div>
          <label htmlFor="clubChoice" className="block text-sm font-medium text-gray-300">
            Choose Your Club:
          </label>
          <select
            id="clubChoice"
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          >
            {potentialTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.leagueName})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="playersPerTeam" className="block text-sm font-medium text-gray-300">
            Initial Player Count (per team):
          </label>
          <select
            id="playersPerTeam"
            value={playersPerTeam}
            onChange={(e) => setPlayersPerTeam(parseInt(e.target.value))}
            className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          >
            <option value={20}>Standard (20)</option>
            <option value={15}>Reduced (15) - Faster Init</option>
            <option value={25}>Expanded (25)</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Fewer players per team will make initial game generation faster.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleStartGame} variant="primary">
            Start Game
          </Button>
        </div>
      </div>
    </Modal>
  );
};