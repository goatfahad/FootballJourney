import React, { useState } from 'react';
import { TitleScreen } from './components/screens/TitleScreen';
import { Dashboard } from './components/screens/Dashboard';
import { MainLayout } from './components/layout/MainLayout';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Notification } from './components/ui/Notification';
import { GameProvider } from './context/GameContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100 antialiased">
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
          theme="dark"
        />
        
        <Routes>
          <Route path="/" element={<TitleScreen setIsLoaded={setIsLoaded} />} />
          <Route path="/game/*" element={
            <MainLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
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