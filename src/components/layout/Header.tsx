import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency } from '../../utils/formatters';
import dayjs from 'dayjs';

export const Header: React.FC = () => {
  const { state } = useGame();
  const playerTeam = state.teams.find(t => t.id === state.playerTeamId);
  
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{playerTeam ? playerTeam.name : 'Football Manager'}</h1>
          <p className="text-sm text-gray-400">{playerTeam?.leagueName || 'Unemployed'}</p>
        </div>
        <div className="text-right">
          <p className="text-lg">{dayjs(state.currentDate).format("ddd, D MMM YYYY")}</p>
          <p className="text-sm text-gray-400">
            Balance: {formatCurrency(playerTeam ? playerTeam.finances.balance : 0)}
          </p>
        </div>
      </div>
    </header>
  );
};