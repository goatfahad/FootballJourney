import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Team, Player, TeamSquad } from '../../types/gameTypes';
import { ActionTypes } from '../../types/actionTypes';
import { Button } from '../ui/Button';
import Sortable from 'sortablejs';

// Define available formations and tactical options
const formations = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2'];
// Define layouts for formations (positions/roles for each slot)
const formationLayouts: { [key: string]: string[] } = {
  '4-4-2': ['GK', 'DR', 'DC', 'DC', 'DL', 'MR', 'MC', 'MC', 'ML', 'ST', 'ST'],
  '4-3-3': ['GK', 'DR', 'DC', 'DC', 'DL', 'MC', 'MC', 'MC', 'FWR', 'ST', 'FWL'],
  '3-5-2': ['GK', 'DC', 'DC', 'DC', 'DMR', 'MC', 'MC', 'MC', 'DML', 'ST', 'ST'],
  '4-2-3-1': ['GK', 'DR', 'DC', 'DC', 'DL', 'DMC', 'DMC', 'AMR', 'AMC', 'AML', 'ST'],
  '5-3-2': ['GK', 'DR', 'DC', 'DC', 'DC', 'DL', 'MC', 'MC', 'MC', 'ST', 'ST'],
};

const mentalities = ['defensive', 'balanced', 'attacking'];
const passingStyles = ['short', 'mixed', 'direct'];
const pressingIntensities = ['low', 'medium', 'high'];

export const TacticsScreen: React.FC = () => {
  const { state, dispatch } = useGame();

  const playerTeam = useMemo(() => {
    if (!state.gameLoaded || !state.playerTeamId) return null;
    return state.teams.find(t => t.id === state.playerTeamId);
  }, [state.gameLoaded, state.playerTeamId, state.teams]);

  // Memoize player map for performance
  const playerMap = useMemo(() => {
    return new Map(state.players.map(p => [p.id, p]));
  }, [state.players]);

  // State to hold the current squad arrangement for rendering
  const [localStartingXI, setLocalStartingXI] = useState<(string | null)[]>(Array(11).fill(null));
  const [localBench, setLocalBench] = useState<string[]>([]);

  // Refs for SortableJS containers
  const pitchRef = useRef<HTMLDivElement>(null);
  const benchRef = useRef<HTMLDivElement>(null);
  const sortablePitchInstance = useRef<Sortable | null>(null);
  const sortableBenchInstance = useRef<Sortable | null>(null);

  // Initialize/Update local state when playerTeam changes from context
  useEffect(() => {
    if (playerTeam) {
      const starters = playerTeam.squad.startingXI || [];
      const initialPitch: (string | null)[] = Array(11).fill(null);
      starters.slice(0, 11).forEach((playerId, index) => {
        initialPitch[index] = playerId;
      });
      setLocalStartingXI(initialPitch);

      const allPlayerIdsSet = new Set(playerTeam.playerIds);
      const startersSet = new Set(starters.slice(0, 11));
      const benchIds = [...allPlayerIdsSet].filter(id => !startersSet.has(id));
      setLocalBench(benchIds);
    } else {
      setLocalStartingXI(Array(11).fill(null));
      setLocalBench([]);
    }
  }, [playerTeam]); // Depend only on playerTeam object

  // Handler to update team data (formation or a specific tactic)
  const handleTeamUpdate = useCallback((data: Partial<Pick<Team, 'formation'>> | { tactics: Partial<Team['tactics']> }) => {
    if (!playerTeam) return;
    let updatedTeam: Team;
    if ('formation' in data && data.formation) {
      updatedTeam = { ...playerTeam, formation: data.formation };
    } else if ('tactics' in data && data.tactics) {
      const newTactics = { ...playerTeam.tactics, ...data.tactics };
      updatedTeam = { ...playerTeam, tactics: newTactics };
    } else { return; }
    dispatch({ type: ActionTypes.UPDATE_TEAM, payload: { team: updatedTeam } });
  }, [playerTeam, dispatch]);

   // SortableJS Initialization and Logic
   useEffect(() => {
     // Ensure refs are current and Sortable instances don't already exist
     if (pitchRef.current && benchRef.current && !sortablePitchInstance.current && !sortableBenchInstance.current) {

       const handleSortEnd = (evt: Sortable.SortableEvent) => {
         const { item, from, to, oldIndex, newIndex } = evt;
         console.log("--- Sort End Event ---", { // ADDED LOG
             itemId: (item as HTMLElement).dataset.id,
             fromId: from.id,
             fromClass: from.className,
             toId: to.id,
             toClass: to.className,
             oldIndex, newIndex
         });

         // 1. Ensure basic indices from event are valid numbers
         if (typeof oldIndex !== 'number' || typeof newIndex !== 'number') {
             console.error("Sortable event missing valid indices.");
             return;
         }

         const originIsPitch = from === pitchRef.current;
         const targetIsPitch = to === pitchRef.current;
         console.log("Origin/Target:", { originIsPitch, targetIsPitch }); // ADDED LOG

         // 2. Calculate origin slot/list index, ensuring it's a valid number >= 0
         let originActualIndex: number = -1;
         if (originIsPitch) {
             // For pitch, the index comes from the slot the player *was* in
             // The item being dragged is the player div inside the slot div
             const slotElement = (item as HTMLElement).parentElement;
             const slotIndexStr = slotElement?.dataset.slotIndex;
             originActualIndex = slotIndexStr ? parseInt(slotIndexStr, 10) : -1;
             console.log("Origin Pitch Slot Index Str:", slotIndexStr); // ADDED LOG
         } else { // Origin is bench
             originActualIndex = oldIndex; // Index in bench array (relative to filtered children if filter applied)
             console.log("Origin Bench Index (Sortable):", originActualIndex); // ADDED LOG
         }
         if (isNaN(originActualIndex) || originActualIndex < 0) {
              console.error("Invalid origin index calculated:", originActualIndex); return;
         }
         console.log("Origin Actual Index:", originActualIndex); // ADDED LOG

         // 3. Calculate target slot/list index, ensuring it's a valid number >= 0
         let targetActualIndex: number = -1;
         if (targetIsPitch) {
             // For pitch, the index comes from the slot being dropped onto
             const targetElement = to.children[newIndex]; // The element at the drop position (could be placeholder or player div)
             // Check if dropping onto placeholder or player div inside slot
             const slotIndexStr = (targetElement as HTMLElement)?.dataset.slotIndex || (targetElement?.parentElement as HTMLElement)?.dataset.slotIndex;
             targetActualIndex = slotIndexStr ? parseInt(slotIndexStr, 10) : -1;
             console.log("Target Pitch Slot Index Str:", slotIndexStr); // ADDED LOG
         } else { // Target is bench
             targetActualIndex = newIndex; // Index where it was dropped in the bench list
             console.log("Target Bench Index (Sortable):", targetActualIndex); // ADDED LOG
         }
          if (isNaN(targetActualIndex) || targetActualIndex < 0) {
              console.error("Invalid target index calculated:", targetActualIndex); return;
          }
          console.log("Target Actual Index:", targetActualIndex); // ADDED LOG

         const movedPlayerId = (item as HTMLElement).dataset.id; // ID of the player being dragged
         if (!movedPlayerId) {
             console.error("Dragged item missing player ID"); return;
         }
         console.log("Moved Player ID:", movedPlayerId); // ADDED LOG

         let currentStarters = [...localStartingXI]; // Array of (string | null)
         let currentBench = [...localBench];       // Array of string
         let playerToBench: string | null = null; // Player displaced from pitch

         // --- Perform the move ---
         console.log("State Before Move:", { currentStarters, currentBench }); // ADDED LOG

         // 1. Remove from Origin
         if (originIsPitch) {
             // originActualIndex is the pitch slot index (0-10)
             if (originActualIndex < 11 && currentStarters[originActualIndex] === movedPlayerId) { // Check bounds and player match
                  console.log(`Removing ${movedPlayerId} from pitch slot ${originActualIndex}`); // ADDED LOG
                  currentStarters[originActualIndex] = null; // Vacate the origin slot
             } else {
                  console.error("Origin pitch index mismatch or invalid!", {originActualIndex, movedPlayerId, currentStarters}); return;
             }
         } else { // Origin is bench
             // Need the actual index in the *current* localBench array, not Sortable's oldIndex if list changed
             const benchIndex = currentBench.indexOf(movedPlayerId);
             if (benchIndex !== -1) {
                  console.log(`Removing ${movedPlayerId} from bench index ${benchIndex}`); // ADDED LOG
                  currentBench.splice(benchIndex, 1); // Remove from bench
             } else {
                  console.error("Dragged player not found in localBench!", {movedPlayerId, currentBench}); return;
             }
         }

         // 2. Add to Destination / Handle Swaps
         if (targetIsPitch) {
             // targetActualIndex is the pitch slot index (0-10)
             if (targetActualIndex < 11) { // Check bounds
                  playerToBench = currentStarters[targetActualIndex]; // Who is already there? (null if empty)
                  console.log(`Placing ${movedPlayerId} into pitch slot ${targetActualIndex}. Displacing: ${playerToBench}`); // ADDED LOG
                  currentStarters[targetActualIndex] = movedPlayerId; // Place moved player
                  if (playerToBench) {
                      console.log(`Adding displaced player ${playerToBench} to bench`); // ADDED LOG
                      currentBench.push(playerToBench); // Add displaced player to bench
                  }
             } else {
                  console.error("Invalid target pitch index!", targetActualIndex);
                  currentBench.push(movedPlayerId); // Revert to bench
             }
         } else { // Target is bench
             console.log(`Adding ${movedPlayerId} to bench at index ${targetActualIndex}`); // ADDED LOG
             // Ensure index is within bounds for splice insertion
             const safeTargetBenchIndex = Math.min(targetActualIndex, currentBench.length);
             currentBench.splice(safeTargetBenchIndex, 0, movedPlayerId);
         }

         // --- Update State & Dispatch ---
         console.log("Updating local state:", { currentStarters, currentBench }); // ADDED LOG
         setLocalStartingXI(currentStarters);
         setLocalBench(currentBench);

         const finalStarters = currentStarters.filter((id): id is string => id !== null);
         const updatedSquad: TeamSquad = {
             startingXI: finalStarters,
             subs: currentBench.slice(0, 7), // Example: Max 7 subs
             reserves: currentBench.slice(7),
         };
         console.log("Dispatching UPDATE_TEAM with squad:", updatedSquad); // ADDED LOG

         if (playerTeam) {
             const updatedTeam = { ...playerTeam, squad: updatedSquad };
             dispatch({ type: ActionTypes.UPDATE_TEAM, payload: { team: updatedTeam } });
         }
       };

       // Initialize SortableJS
       sortablePitchInstance.current = Sortable.create(pitchRef.current, {
         group: 'squad', animation: 150, ghostClass: 'sortable-ghost-pitch', // Use single token
         dragClass: 'sortable-drag-item', // Use single token
         filter: '.slot-placeholder', preventOnFilter: false,
         draggable: '.player-draggable', // Target draggable player divs
         onEnd: handleSortEnd,
       });
       sortableBenchInstance.current = Sortable.create(benchRef.current, {
         group: 'squad', animation: 150, ghostClass: 'sortable-ghost-bench', // Use single token
         dragClass: 'sortable-drag-item', // Use single token
         draggable: '.player-draggable',
         onEnd: handleSortEnd,
      });
    }
    // Cleanup
    return () => {
      sortablePitchInstance.current?.destroy(); sortableBenchInstance.current?.destroy();
      sortablePitchInstance.current = null; sortableBenchInstance.current = null;
    };
  // Rerun effect if playerTeam changes
  }, [playerTeam, dispatch]);

  // Helper to get player details
  const getPlayerDetails = (id: string): Player | undefined => playerMap.get(id);

  if (!state.gameLoaded || !playerTeam) {
    return <div>Loading tactics data or no team selected...</div>;
  }

  // Render pitch slots based on formation
  const renderPitchSlots = () => {
    const formation = playerTeam?.formation || '4-4-2'; // Use optional chaining
    const layout = formationLayouts[formation] || formationLayouts['4-4-2'];

    // Helper to render a player div or placeholder
    const renderPlayerDiv = (playerId: string | null, slotIndex: number, positionRole: string) => {
       const player = playerId ? getPlayerDetails(playerId) : null;
       const isEmpty = !player;
       return (
          // Each slot is a drop target
          <div
            key={`slot-${slotIndex}`}
            data-slot-index={slotIndex} // Store slot index
            className={`border border-dashed border-white/30 rounded p-1 m-1 h-20 w-20 flex items-center justify-center text-center relative ${ // Fixed width/height
              isEmpty ? 'bg-black/10 slot-placeholder' : 'bg-blue-500/80'
            }`}
          >
            {isEmpty ? (
              <span className="text-white/50 text-xs">{positionRole}</span>
            ) : (
              // Player div is the draggable item
              <div
                data-id={playerId} // Player ID for SortableJS
                data-slot-index={slotIndex} // Also store slot index here for origin check
                className="text-white text-xs w-full h-full flex flex-col justify-center items-center cursor-grab player-draggable" // Make player div draggable
              >
                <span className="font-semibold block truncate w-full">{player?.name}</span>
                <span className="text-white/80">{player?.position}</span>
                {/* Add role display later */}
              </div>
            )}
          </div>
       );
    };

    // Render slots in rough formation lines (this is approximate)
    // Group slots by general position defined in layout
    const gkSlots = layout.map((role, index) => role === 'GK' ? renderPlayerDiv(localStartingXI[index], index, role) : null).filter(Boolean);
    const dfSlots = layout.map((role, index) => ['DR', 'DC', 'DL', 'DMC', 'SW'].includes(role) ? renderPlayerDiv(localStartingXI[index], index, role) : null).filter(Boolean);
    const mfSlots = layout.map((role, index) => ['MR', 'MC', 'ML', 'AMR', 'AMC', 'AML', 'DMR', 'DML'].includes(role) ? renderPlayerDiv(localStartingXI[index], index, role) : null).filter(Boolean);
    const fwSlots = layout.map((role, index) => ['ST', 'FWR', 'FWL', 'FC'].includes(role) ? renderPlayerDiv(localStartingXI[index], index, role) : null).filter(Boolean);

    return (
      // Use flex column to stack lines, items-center to center lines horizontally
      <div className="w-full h-full flex flex-col justify-around items-center p-4">
        {/* Forwards Line */}
        <div className="flex justify-center gap-4 w-full">{fwSlots}</div>
         {/* Midfielders Line */}
        <div className="flex justify-center gap-4 w-full">{mfSlots}</div>
         {/* Defenders Line */}
        <div className="flex justify-center gap-4 w-full">{dfSlots}</div>
         {/* Goalkeeper Line */}
        <div className="flex justify-center gap-4 w-full">{gkSlots}</div>
      </div>
    );
  };


  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">{playerTeam.name} - Tactics</h1>
      {/* Formation and Instructions Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <label htmlFor="formation" className="block text-sm font-medium text-gray-300 mb-1">Formation</label>
          <select id="formation" value={playerTeam.formation} onChange={(e) => handleTeamUpdate({ formation: e.target.value })}
            className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2">
            {formations.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Team Instructions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="mentality" className="block text-sm font-medium text-gray-300 mb-1">Mentality</label>
              <select id="mentality" value={playerTeam.tactics.mentality} onChange={(e) => handleTeamUpdate({ tactics: { mentality: e.target.value } })}
                className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 capitalize">
                {mentalities.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="passingStyle" className="block text-sm font-medium text-gray-300 mb-1">Passing Style</label>
              <select id="passingStyle" value={playerTeam.tactics.passingStyle} onChange={(e) => handleTeamUpdate({ tactics: { passingStyle: e.target.value } })}
                className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 capitalize">
                {passingStyles.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pressingIntensity" className="block text-sm font-medium text-gray-300 mb-1">Pressing Intensity</label>
              <select id="pressingIntensity" value={playerTeam.tactics.pressingIntensity} onChange={(e) => handleTeamUpdate({ tactics: { pressingIntensity: e.target.value } })}
                className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 capitalize">
                {pressingIntensities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Pitch and Player Lists Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pitch Area */}
        <div ref={pitchRef} className="lg:col-span-2 bg-green-700 border-4 border-white p-4 rounded-lg min-h-[60vh] relative flex flex-col"> {/* Use flex column for lines */}
          {/* Render structured player slots */}
          {renderPitchSlots()}
          {localStartingXI.every(p => p === null) && (
            <p className="text-white opacity-70 absolute inset-0 flex items-center justify-center pointer-events-none">Drag players here to start</p>
          )}
        </div>
        {/* Bench/Reserves Area */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Bench / Reserves</h3>
          <div ref={benchRef} className="space-y-2 max-h-[55vh] overflow-y-auto min-h-[50px] border border-dashed border-gray-600 p-2 rounded">
            {localBench.map(playerId => {
              const player = getPlayerDetails(playerId);
              return (
                // Each player on bench is draggable
                <div key={playerId} data-id={playerId}
                  className="bg-gray-700 p-2 rounded text-white text-sm cursor-grab border border-gray-600 shadow player-draggable">
                  {player?.name} ({player?.position})
                </div>
              );
            })}
            {localBench.length === 0 && (
              <p className="text-gray-500 text-center text-sm">Bench is empty</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
