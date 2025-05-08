import React from 'react';
import { useGame } from '../../context/GameContext';

export const LoadingScreen: React.FC = () => {
  const { isLoading, loadingMessage } = useGame();
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-[100]">
      <svg className="animate-spin h-16 w-16 text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-xl text-gray-200">{loadingMessage}</p>
    </div>
  );
};