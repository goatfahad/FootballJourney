import React, { useState, useEffect } from 'react'; // Import useEffect
import { TitleScreen } from './components/screens/TitleScreen';
import { Dashboard } from './components/screens/Dashboard';
import { SquadScreen } from './components/screens/SquadScreen';
import { TacticsScreen } from './components/screens/TacticsScreen';
import { FixturesScreen } from './components/screens/FixturesScreen';
import { LeagueTableScreen } from './components/screens/LeagueTableScreen';
import { TransfersScreen } from './components/screens/TransfersScreen';
import { FinancesScreen } from './components/screens/FinancesScreen';
import { TrainingScreen } from './components/screens/TrainingScreen';
import { InboxScreen } from './components/screens/InboxScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { LiveMatchScreen } from './components/screens/LiveMatchScreen'; // Import LiveMatchScreen
import { MainLayout } from './components/layout/MainLayout';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Notification } from './components/ui/Notification';
import { GameProvider, useGame } from './context/GameContext'; // Import useGame
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Component to apply theme class based on context
const ThemeApplicator: React.FC = () => {
  const { state } = useGame();
  // Ensure gameSettings exists before accessing theme
  const theme = state.gameSettings?.theme || 'dark'; // Default to dark if undefined

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark'); // Remove previous theme
    root.classList.add(theme); // Add current theme
  }, [theme]);

  return null; // This component doesn't render anything itself
};

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <GameProvider>
      <ThemeApplicator /> {/* Add ThemeApplicator inside Provider */}
      <div className="min-h-screen antialiased bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-200"> {/* Add base light/dark styles */}
        <LoadingScreen />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark" // Keep toast dark for now, or make it dynamic too
        />

        <Routes>
          <Route path="/" element={<TitleScreen setIsLoaded={setIsLoaded} />} />
          <Route path="/game/*" element={
            <MainLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="squad" element={<SquadScreen />} />
                <Route path="tactics" element={<TacticsScreen />} />
                <Route path="fixtures" element={<FixturesScreen />} />
                <Route path="league-table" element={<LeagueTableScreen />} />
                <Route path="transfers" element={<TransfersScreen />} />
                <Route path="finances" element={<FinancesScreen />} />
                <Route path="training" element={<TrainingScreen />} />
                <Route path="inbox" element={<InboxScreen />} />
                <Route path="settings" element={<SettingsScreen />} />
                <Route path="match/:matchId" element={<LiveMatchScreen />} /> {/* Add route for live match */}
                {/* Other game screens will be added here */}
                <Route path="*" element={<Navigate to="/game/dashboard" replace />} />
              </Routes>
            </MainLayout>
          } />
        </Routes>

        <Notification />
      </div>
    </GameProvider>
  );
}

export default App;
