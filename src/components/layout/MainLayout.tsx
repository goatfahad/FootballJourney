import React, { ReactNode } from 'react';
import { useGame } from '../../context/GameContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { state } = useGame();
  
  if (!state.gameLoaded) {
    return <div className="flex justify-center items-center h-screen">Loading game...</div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-grow container mx-auto p-2 sm:p-4">
        <Sidebar />
        <main className="w-4/5 bg-gray-800 p-2 sm:p-6 rounded-lg shadow-lg overflow-y-auto h-[calc(100vh-100px)]">
          {children}
        </main>
      </div>
    </div>
  );
};