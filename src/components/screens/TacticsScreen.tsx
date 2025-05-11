import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Team, Player, TeamSquad, PlayerRole, PlayerDuty } from '../../types/gameTypes';
import { ActionTypes } from '../../types/actionTypes';
import { Button } from '../ui/Button'; // Import Button
import Sortable from 'sortablejs';

// Define available formations and tactical options
const formations = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2'];
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

const playerRoleValues: PlayerRole[] = [
  'Goalkeeper', 'CentreBack', 'FullBack', 'InvertedWingBack', 'DefensiveMidfielder', 
  'Anchor', 'BallWinningMidfielder', 'CentralMidfielder', 'BoxToBoxMidfielder', 
  'Playmaker', 'AttackingMidfielder', 'AdvancedPlaymaker', 'ShadowStriker', 
  'Winger', 'InsideForward', 'TargetMan', 'Poacher', 'DeepLyingForward', 'FalseNine'
];
const playerDutyValues: PlayerDuty[] = ['Defend', 'Support', 'Attack'];

const getValidRolesForPosition = (positionCategory: string): PlayerRole[] => {
  switch (positionCategory) {
    case 'GK': return ['Goalkeeper'];
    case 'DR': case 'DL': return ['FullBack', 'InvertedWingBack'];
    case 'DC': return ['CentreBack'];
    case 'DMC': return ['DefensiveMidfielder', 'Anchor', 'BallWinningMidfielder', 'Playmaker'];
    case 'MR': case 'ML': return ['Winger', 'InsideForward', 'CentralMidfielder', 'FullBack'];
    case 'MC': return ['CentralMidfielder', 'BoxToBoxMidfielder', 'Playmaker', 'BallWinningMidfielder', 'Anchor', 'DefensiveMidfielder', 'AttackingMidfielder'];
    case 'AMR': case 'AML': return ['Winger', 'InsideForward', 'AdvancedPlaymaker', 'AttackingMidfielder'];
    case 'AMC': return ['AttackingMidfielder', 'AdvancedPlaymaker', 'ShadowStriker', 'Playmaker', 'DeepLyingForward', 'FalseNine'];
    case 'ST': case 'FC': return ['TargetMan', 'Poacher', 'DeepLyingForward', 'FalseNine', 'AdvancedPlaymaker', 'ShadowStriker'];
    case 'FWR': case 'FWL': return ['Winger', 'InsideForward', 'Poacher'];
    default: return [...playerRoleValues];
  }
};

export const TacticsScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const playerTeam = useMemo(() => state.playerTeamId ? state.teams.find(t => t.id === state.playerTeamId) : null, [state.playerTeamId, state.teams]);
  const playerMap = useMemo(() => new Map(state.players.map(p => [p.id, p])), [state.players]);

  const [pitchSlotDetails, setPitchSlotDetails] = useState<Array<{ playerId: string | null; role?: PlayerRole; duty?: PlayerDuty }>>(
    Array(11).fill(null).map(() => ({ playerId: null, role: undefined, duty: undefined }))
  );
  const [localBench, setLocalBench] = useState<string[]>([]);

  const slotRefs = useRef<Array<HTMLDivElement | null>>(Array(11).fill(null));
  const benchRef = useRef<HTMLDivElement>(null);
  const sortableInstances = useRef<Sortable[]>([]);

  useEffect(() => {
    if (playerTeam) {
      const starters = playerTeam.squad.startingXI || [];
      const initialPitchSlots = Array(11).fill(null).map((_, index) => {
        const playerId = starters[index] || null;
        if (playerId) {
          const player = playerMap.get(playerId);
          return { playerId, role: player?.assignedRole, duty: player?.assignedDuty };
        }
        return { playerId: null, role: undefined, duty: undefined };
      });
      setPitchSlotDetails(initialPitchSlots);

      const allPlayerIdsSet = new Set(playerTeam.playerIds);
      const startersSet = new Set(starters.filter(Boolean) as string[]);
      setLocalBench([...allPlayerIdsSet].filter(id => !startersSet.has(id)));
    }
  }, [playerTeam, playerMap]);

  const handleTeamUpdate = useCallback((data: Partial<Pick<Team, 'formation'>> | { tactics: Partial<Team['tactics']> }) => {
    if (!playerTeam) return;
    let updatedTeam: Team;
    if ('formation' in data && data.formation) {
      updatedTeam = { ...playerTeam, formation: data.formation };
    } else if ('tactics' in data && data.tactics) {
      updatedTeam = { ...playerTeam, tactics: { ...playerTeam.tactics, ...data.tactics } };
    } else { return; }
    dispatch({ type: ActionTypes.UPDATE_TEAM, payload: { team: updatedTeam } });
  }, [playerTeam, dispatch]);

  useEffect(() => {
    sortableInstances.current.forEach(instance => instance.destroy());
    sortableInstances.current = [];

    const commonSortableOptions: Sortable.Options = {
      group: 'squad',
      animation: 150,
      ghostClass: 'sortable-ghost-item',
      dragClass: 'sortable-drag-item',
      draggable: '.player-draggable',
      onEnd: (evt: Sortable.SortableEvent) => {
        const { item, from, to, oldDraggableIndex, newDraggableIndex } = evt;
        const movedPlayerId = (item as HTMLElement).dataset.id;

        if (!movedPlayerId || typeof oldDraggableIndex !== 'number' || typeof newDraggableIndex !== 'number' || !from || !to) {
          console.error("Sortable event missing critical data."); return;
        }

        const fromIsBench = from.classList.contains('bench-area');
        const toIsBench = to.classList.contains('bench-area');
        const fromSlotIndex = !fromIsBench ? parseInt(from.dataset.slotIndex || '-1', 10) : -1;
        const toSlotIndex = !toIsBench ? parseInt(to.dataset.slotIndex || '-1', 10) : -1;
        
        let finalPitchSlots = [...pitchSlotDetails];
        let finalBench = [...localBench]; 

        if (!fromIsBench && fromSlotIndex !== -1) { 
            const playerFromOrigin = finalPitchSlots[fromSlotIndex];
            if (playerFromOrigin.playerId === movedPlayerId) {
                finalPitchSlots[fromSlotIndex] = { playerId: null, role: undefined, duty: undefined };
            }
        } else if (fromIsBench) { 
            const benchIdx = finalBench.indexOf(movedPlayerId);
            if (benchIdx > -1) finalBench.splice(benchIdx, 1);
        }

        if (!toIsBench && toSlotIndex !== -1) { 
            const playerInTarget = { ...finalPitchSlots[toSlotIndex] }; 
            if (playerInTarget.playerId) { 
                if (!fromIsBench && fromSlotIndex !== -1) { 
                    finalPitchSlots[fromSlotIndex] = playerInTarget; 
                } else { 
                    finalBench.push(playerInTarget.playerId); 
                }
            }
            finalPitchSlots[toSlotIndex] = { playerId: movedPlayerId, role: undefined, duty: undefined };
        } else if (toIsBench) { 
            finalBench.splice(newDraggableIndex, 0, movedPlayerId);
        }
        
        setPitchSlotDetails(finalPitchSlots);
        setLocalBench(finalBench); 
      }
    };

    slotRefs.current.forEach((slotEl) => {
      if (slotEl) {
        const instance = Sortable.create(slotEl, {
          ...commonSortableOptions,
          filter: '.slot-placeholder-text',
          preventOnFilter: false,
        });
        sortableInstances.current.push(instance);
      }
    });

    if (benchRef.current) {
        const benchInstance = Sortable.create(benchRef.current, { ...commonSortableOptions });
        sortableInstances.current.push(benchInstance);
    }

    return () => {
      sortableInstances.current.forEach(instance => instance.destroy());
      sortableInstances.current = [];
    };
  }, [dispatch]);

  const getPlayerDetails = (id: string): Player | undefined => playerMap.get(id);

  if (!state.gameLoaded || !playerTeam) return <div>Loading...</div>;

  const renderSlotContent = (slotDetail: { playerId: string | null; role?: PlayerRole; duty?: PlayerDuty }, slotIndex: number, positionCategory: string) => {
    const player = slotDetail.playerId ? getPlayerDetails(slotDetail.playerId) : null;
    if (!player) return <span className="text-white/50 text-xs slot-placeholder-text">{positionCategory}</span>;

    const availableRoles = getValidRolesForPosition(positionCategory);
    const handleRoleChange = (newRole: PlayerRole) => {
      setPitchSlotDetails(prev => prev.map((s, i) => i === slotIndex ? { ...s, role: newRole } : s));
    };
    const handleDutyChange = (newDuty: PlayerDuty) => {
      setPitchSlotDetails(prev => prev.map((s, i) => i === slotIndex ? { ...s, duty: newDuty } : s));
    };

    return (
      <>
        <div data-id={player.id} className="player-draggable bg-blue-500/80 rounded p-1 w-full flex-grow flex flex-col items-center justify-center text-white text-xs cursor-grab">
          <div className="w-full text-center">
            <span className="font-semibold block truncate w-full">{player.name}</span>
            <span className="text-white/80 text-[10px]">{player.position}</span>
            {pitchSlotDetails[slotIndex]?.role && pitchSlotDetails[slotIndex]?.duty && (
              <span className="text-yellow-400 text-[9px] block mt-0.5">
                {`${(pitchSlotDetails[slotIndex].role as string).substring(0, 3).toUpperCase()} (${(pitchSlotDetails[slotIndex].duty as string).substring(0, 2)})`}
              </span>
            )}
          </div>
        </div>
        <div className="w-full mt-1 flex-shrink-0"> 
          <select 
            value={pitchSlotDetails[slotIndex]?.role || ''} 
            onChange={(e) => handleRoleChange(e.target.value as PlayerRole)} 
            onClick={e => e.stopPropagation()}
            className="text-xs bg-gray-700 text-white border-gray-600 rounded w-full p-0.5 text-[10px] mb-0.5"
          >
            <option value="" disabled>Role</option>
            {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select 
            value={pitchSlotDetails[slotIndex]?.duty || ''} 
            onChange={(e) => handleDutyChange(e.target.value as PlayerDuty)} 
            onClick={e => e.stopPropagation()}
            className="text-xs bg-gray-700 text-white border-gray-600 rounded w-full p-0.5 text-[10px]"
          >
            <option value="" disabled>Duty</option>
            {playerDutyValues.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </>
    );
  };
  
  const currentFormationLayout = formationLayouts[playerTeam.formation] || formationLayouts['4-4-2'];

  const handleApplyTactics = () => {
    if (!playerTeam) return;
    console.log("Applying tactics...");

    setTimeout(() => {
      // 1. Update player tactical assignments for those on the pitch
      pitchSlotDetails.forEach(slot => {
        if (slot.playerId && slot.role && slot.duty) {
          dispatch({
            type: ActionTypes.UPDATE_PLAYER_TACTICAL_ASSIGNMENT,
            payload: { playerId: slot.playerId, role: slot.role, duty: slot.duty }
          });
        } else if (slot.playerId && (!slot.role || !slot.duty)) {
          // Player on pitch but role/duty not set - clear any existing global assignment
          dispatch({
            type: ActionTypes.UPDATE_PLAYER_TACTICAL_ASSIGNMENT,
            payload: { playerId: slot.playerId, role: undefined, duty: undefined }
          });
        }
      });

      // 2. Clear tactical assignments for players NOT on the pitch
      const playersOnPitch = new Set(pitchSlotDetails.map(s => s.playerId).filter(Boolean));
      playerTeam.playerIds.forEach(playerId => {
        if (!playersOnPitch.has(playerId)) {
          const player = playerMap.get(playerId);
          // Only clear if they previously had an assignment, to avoid unnecessary dispatches
          if (player && (player.assignedRole || player.assignedDuty)) {
            dispatch({
              type: ActionTypes.UPDATE_PLAYER_TACTICAL_ASSIGNMENT,
              payload: { playerId, role: undefined, duty: undefined }
            });
          }
        }
      });
      
      // 3. Update team squad (startingXI, subs, reserves)
      const startingXI = pitchSlotDetails.map(slot => slot.playerId).filter(Boolean) as string[];
      const subs = localBench.slice(0, 7);
      const reserves = localBench.slice(7);
      
      const updatedSquad: TeamSquad = { startingXI, subs, reserves };
      const payloadForUpdateTeam = { team: { ...playerTeam, squad: updatedSquad } };
      dispatch({ type: ActionTypes.UPDATE_TEAM, payload: payloadForUpdateTeam });
      
      console.log("All tactics dispatches completed within setTimeout.");
    }, 0);

    console.log("Tactics applied (all dispatches deferred).");
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">{playerTeam.name} - Tactics</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-green-700 border-4 border-white p-2 rounded-lg min-h-[60vh] flex flex-wrap justify-around items-stretch content-around">
          {currentFormationLayout.map((posCat, index) => (
            <div
              key={`slot-wrapper-${index}`}
              ref={el => slotRefs.current[index] = el}
              data-slot-index={index}
              className={`pitch-slot pitch-slot-${posCat.toLowerCase()} border border-dashed border-white/30 rounded flex flex-col items-center justify-between relative w-[calc(18%)] aspect-[3/4] m-1 p-1 ${
                pitchSlotDetails[index]?.playerId ? 'bg-blue-500/60' : 'bg-black/10'
              }`}
            >
              {renderSlotContent(pitchSlotDetails[index], index, posCat)}
            </div>
          ))}
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Bench / Reserves</h3>
          <div ref={benchRef} id="bench-area" className="bench-area space-y-2 max-h-[55vh] overflow-y-auto min-h-[50px] border border-dashed border-gray-600 p-2 rounded">
            {localBench.map(playerId => {
              const player = getPlayerDetails(playerId);
              if (!player) return null;
              return (
                <div key={playerId} data-id={playerId}
                  className="player-draggable bg-gray-700 p-2 rounded text-white text-sm cursor-grab border border-dashed border-gray-600 shadow">
                  {player.name} ({player.position})
                </div>
              );
            })}
            {localBench.length === 0 && <p className="text-gray-500 text-center text-sm">Bench is empty</p>}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <Button onClick={handleApplyTactics} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          Apply Tactics
        </Button>
      </div>
    </div>
  );
};
