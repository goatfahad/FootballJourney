import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency } from '../../utils/formatters';
import dayjs from 'dayjs';

export const Header: React.FC = () => {
  const { state } = useGame();
  // Ensure teams array exists before finding playerTeam
  const playerTeam = Array.isArray(state.teams) ? state.teams.find(t => t.id === state.playerTeamId) : null;
  
  return (
     // Added dark mode variants for background and text
     <header className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 shadow-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
       <div className="container mx-auto flex justify-between items-center">
         <div>
           <h1 className="text-xl font-bold">{playerTeam ? playerTeam.name : 'FootballJourney'}</h1>
           <p className="text-sm text-gray-500 dark:text-gray-400">{playerTeam?.leagueName || 'Unemployed'}</p>
         </div>
         <div className="text-right">
           <p className="text-lg">{dayjs(state.currentDate).format("ddd, D MMM YYYY")}</p>
           <p className="text-sm text-gray-500 dark:text-gray-400">
             {/* Ensure playerTeam and finances exist before accessing balance */}
             Balance: {formatCurrency(playerTeam && playerTeam.finances ? playerTeam.finances.balance : 0)}
           </p>
        </div>
      </div>
    </header>
  );
};
