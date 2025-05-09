import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { ActionTypes } from '../../types/actionTypes';
import { simulateMinute } from '../../gameEngine/matchSimulator';
import { Button } from '../ui/Button';
import { Match, Team, LiveMatchState } from '../../types/gameTypes'; // Import necessary types

// Placeholder for 2D Pitch Visualizer
const PitchVisualizer: React.FC<{ liveMatchState: LiveMatchState | null }> = ({ liveMatchState }) => {
  if (!liveMatchState) return null;

  // Basic representation - adjust size as needed
  const pitchWidth = 500;
  const pitchHeight = 300;
  const ballSize = 8;

  // Convert 0-100 coordinates to SVG coordinates
  const ballX = (liveMatchState.ballPosition.x / 100) * pitchWidth;
  const ballY = (liveMatchState.ballPosition.y / 100) * pitchHeight;

  return (
    <div className="bg-green-600 border-4 border-white rounded-md relative mb-4" style={{ width: pitchWidth, height: pitchHeight }}>
      {/* Basic Pitch Markings (Optional) */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/50 transform -translate-y-1/2"></div> {/* Halfway line */}
      <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div> {/* Center circle */}

      {/* Ball */}
      <div
        className="absolute bg-yellow-400 rounded-full shadow-md"
        style={{
          width: ballSize,
          height: ballSize,
          left: ballX - ballSize / 2,
          top: ballY - ballSize / 2,
          transition: 'left 0.5s linear, top 0.5s linear' // Smooth ball movement
        }}
      ></div>
      {/* TODO: Add player dots based on simplified positions */}
    </div>
  );
};

// Placeholder for Commentary Feed
const CommentaryFeed: React.FC<{ commentary: LiveMatchState['commentary'] }> = ({ commentary }) => {
  const feedRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [commentary]);

  return (
    <div ref={feedRef} className="h-40 bg-gray-700 dark:bg-gray-900 p-2 rounded overflow-y-auto text-sm space-y-1">
      {/* Ensure commentary is an array */}
      {(commentary || []).map((entry, index) => (
        <p key={index} className="text-gray-300 dark:text-gray-400">
          <span className="font-semibold mr-1">{entry.minute}'</span>
          {entry.text}
        </p>
      ))}
    </div>
  );
};


export const LiveMatchScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const { liveMatch } = state;
  const navigate = useNavigate();
  const [simSpeed, setSimSpeed] = useState(1000); // Interval in ms (1 second per minute)

  // Find the full match details from the leagues array using liveMatch.matchId
  const currentMatchDetails = useMemo(() => {
     if (!liveMatch || !Array.isArray(state.leagues)) return null; // Check leagues array
     return state.leagues.flatMap(l => l.fixtures || []) // Check fixtures array
                         .find(m => m && m.id === liveMatch.matchId); // Check match object
  }, [liveMatch, state.leagues]);

  const homeTeam = useMemo(() => {
     if (!currentMatchDetails || !Array.isArray(state.teams)) return null; // Check teams array
     return state.teams.find(t => t && t.id === currentMatchDetails.homeTeamId); // Check team object
  }, [currentMatchDetails, state.teams]);

  const awayTeam = useMemo(() => {
     if (!currentMatchDetails || !Array.isArray(state.teams)) return null; // Check teams array
     return state.teams.find(t => t && t.id === currentMatchDetails.awayTeamId); // Check team object
  }, [currentMatchDetails, state.teams]);


  // Game loop effect
  useEffect(() => {
    if (!liveMatch || liveMatch.status !== 'playing') {
      return; // Don't run if no live match or not playing
    }

    const intervalId = setInterval(() => {
      if (liveMatch.minute >= 90) { // End condition (simplified)
        // TODO: Add stoppage time logic
        dispatch({ type: ActionTypes.UPDATE_LIVE_MATCH, payload: { liveMatchState: { status: 'full-time' } } });
        // TODO: Dispatch action to update the main Match object with final score/stats
        // Maybe dispatch END_LIVE_MATCH here or after a short delay?
        return;
      }

      // Simulate one minute
      const result = simulateMinute(liveMatch, state);

      // Dispatch update
      dispatch({
        type: ActionTypes.UPDATE_LIVE_MATCH,
        payload: {
          liveMatchState: {
            minute: liveMatch.minute + 1,
            homeScore: result.newHomeScore,
            awayScore: result.newAwayScore,
            ballPosition: result.newBallPosition,
            // Ensure commentary is always an array
            commentary: [...(liveMatch.commentary || []), ...result.newEvents]
          }
        }
      });

      // TODO: Handle half-time pause
      if (liveMatch.minute === 44) { // Minute 45 about to start
         // dispatch pause action?
      }

    }, simSpeed); // Control simulation speed

    return () => clearInterval(intervalId); // Cleanup on unmount or state change

  }, [liveMatch, state, dispatch, simSpeed]); // Rerun if liveMatch state changes

  const handlePauseToggle = () => {
     if (!liveMatch) return;
     const newStatus = liveMatch.status === 'playing' ? 'paused' : 'playing';
     dispatch({ type: ActionTypes.UPDATE_LIVE_MATCH, payload: { liveMatchState: { status: newStatus } } });
  };

  const handleEndMatch = () => {
     // Manually end (e.g., if user wants to skip) or after FT
     // TODO: Update main match record before ending
     dispatch({ type: ActionTypes.END_LIVE_MATCH });
     navigate('/game/dashboard'); // Go back to dashboard after match
  };

  // Placeholder handlers for touchline actions
  const handleShout = (shout: string) => alert(`Shout: ${shout} (not implemented)`);
  const handleMentalityChange = (e: React.ChangeEvent<HTMLInputElement>) => alert(`Mentality changed to ${e.target.value} (not implemented)`);
  const handleMakeSub = () => alert('Make Substitution (not implemented)');
  const handleChangeTactics = () => alert('Change Tactics (not implemented)');


  if (!liveMatch || !currentMatchDetails || !homeTeam || !awayTeam) {
    // If there's no live match state, maybe redirect or show message
    // This might happen if user navigates here directly
    useEffect(() => {
       if (!liveMatch) {
          console.log("No live match active, redirecting...");
          // Avoid navigation during render, maybe set a state to trigger redirect effect
          // For now, just log. A redirect here can cause issues.
       }
    }, [liveMatch]); // Removed navigate dependency to avoid potential loops
    return <div className="p-4 text-center">Loading match data or no match in progress...</div>;
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full">
      {/* Scoreboard */}
      <div className="text-center mb-4 p-4 bg-gray-700 dark:bg-gray-900 rounded shadow">
        <h1 className="text-2xl font-bold text-white">
          {homeTeam.name} <span className="text-3xl mx-2">{liveMatch.homeScore} - {liveMatch.awayScore}</span> {awayTeam.name}
        </h1>
        <p className="text-xl text-yellow-400">{liveMatch.minute}'</p>
      </div>

      {/* Main Area (Pitch + Controls) */}
      <div className="flex-grow flex flex-col md:flex-row gap-4 mb-4">
         {/* Pitch Visualizer */}
         <div className="flex-grow flex items-center justify-center">
            <PitchVisualizer liveMatchState={liveMatch} />
         </div>

         {/* Controls */}
         <div className="w-full md:w-1/4 flex flex-col space-y-3 bg-gray-700 dark:bg-gray-900 p-3 rounded shadow">
            <h2 className="text-lg font-semibold text-white border-b border-gray-600 pb-1 mb-2">Controls</h2>
            <Button onClick={handlePauseToggle} variant="warning" size="sm">
               {liveMatch.status === 'playing' ? 'Pause' : 'Resume'}
            </Button>
             {/* Speed Control Example */}
             <div className="flex items-center justify-between text-xs">
                <label htmlFor="speed" className="text-gray-300">Speed:</label>
                <select id="speed" value={simSpeed} onChange={(e) => setSimSpeed(parseInt(e.target.value))} className="bg-gray-800 text-white p-1 rounded">
                   <option value={2000}>Slow</option>
                   <option value={1000}>Normal</option>
                   <option value={500}>Fast</option>
                   <option value={100}>Very Fast</option>
                </select>
             </div>
            <Button onClick={handleMakeSub} variant="secondary" size="sm">Make Sub</Button>
            <Button onClick={handleChangeTactics} variant="secondary" size="sm">Change Tactics</Button>
            {/* Mentality Slider Placeholder */}
            <div className="pt-2">
               <label htmlFor="mentality" className="block text-sm font-medium text-gray-300 mb-1">Mentality</label>
               <input type="range" id="mentality" min="1" max="5" defaultValue="3" onChange={handleMentalityChange} className="w-full" />
               <div className="flex justify-between text-xs text-gray-400 px-1">
                  <span>Def</span><span>Bal</span><span>Att</span>
               </div>
            </div>
             {/* Touchline Shouts Placeholder */}
             <div className="pt-2 space-y-1">
                 <h3 className="text-sm font-medium text-gray-300">Shouts:</h3>
                 <Button onClick={() => handleShout('Encourage')} variant="info" size="sm" className="w-full">Encourage</Button>
                 <Button onClick={() => handleShout('Push Forward')} variant="info" size="sm" className="w-full">Push Forward</Button>
                 <Button onClick={() => handleShout('Tighten Up')} variant="info" size="sm" className="w-full">Tighten Up</Button>
             </div>
             <Button onClick={handleEndMatch} variant="danger" size="sm" className="mt-auto">
               End/Skip Match
             </Button>
         </div>
      </div>

      {/* Commentary Feed */}
      <CommentaryFeed commentary={liveMatch.commentary} />
    </div>
  );
};
