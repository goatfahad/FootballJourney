import { GameState, League, Match, Player, LeagueTableEntry, NewsItem, LiveMatchState } from '../types/gameTypes';
import { GameActions, ActionTypes } from '../types/actionTypes';
import { simulateMatch } from '../gameEngine/matchSimulator';
import { processWeeklyTraining } from '../gameEngine/playerDevelopment';
import { generateId } from '../utils/idGenerator';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const gameReducer = (state: GameState, action: GameActions): GameState => {
  switch (action.type) {
    case ActionTypes.INITIALIZE_NEW_GAME:
      return {
        ...action.payload,
        gameLoaded: true
      };

    case ActionTypes.LOAD_GAME:
      return {
        ...action.payload,
        gameLoaded: true
      };

    case ActionTypes.ADVANCE_TIME: {
      let newState = { ...state };
      const daysToAdvance = action.payload.days;
      let currentDate = dayjs(state.currentDate);
      const newsToAdd: NewsItem[] = [];
      let liveMatchStarted = false; // Flag to stop advancing if live match begins
      let daysProcessed = 0;

      for (let i = 0; i < daysToAdvance; i++) {
        currentDate = currentDate.add(1, 'day');
        daysProcessed++;
        const dateStr = currentDate.toISOString();

        // Find matches scheduled for this specific day
        const matchesToday: Match[] = [];
        // Ensure leagues and fixtures exist
        (newState.leagues || []).forEach(league => {
          (league.fixtures || []).forEach(match => {
            if (match && match.status === 'scheduled' && dayjs(match.date).isSame(currentDate, 'day')) {
              matchesToday.push(match);
            }
          });
        });

        if (matchesToday.length > 0) {
          console.log(`Processing ${matchesToday.length} matches for ${currentDate.format('YYYY-MM-DD')}`);

          for (const matchToProcess of matchesToday) {
            // Check if it's the player's match
            if (matchToProcess.homeTeamId === newState.playerTeamId || matchToProcess.awayTeamId === newState.playerTeamId) {
              console.log(`Triggering live match start for: ${matchToProcess.id}`);
              // Update state immediately by calling reducer recursively
              newState = gameReducer(newState, { type: ActionTypes.START_LIVE_MATCH, payload: { matchId: matchToProcess.id } });
              liveMatchStarted = true;
              break; // Stop processing further matches or days for this ADVANCE_TIME action
            } else {
              // --- Simulate AI vs AI matches instantly ---
              console.log(`Simulating AI match: ${matchToProcess.id}`);
              const simulationResult = simulateMatch(matchToProcess, newState);

              // Update the match in the corresponding league
              const leagueIndex = newState.leagues.findIndex(l => l.id === matchToProcess.leagueId);
              if (leagueIndex !== -1) {
                const matchIndex = newState.leagues[leagueIndex].fixtures.findIndex(m => m.id === matchToProcess.id);
                if (matchIndex !== -1) {
                   newState.leagues[leagueIndex].fixtures[matchIndex] = simulationResult.updatedMatch;
                }

                // Update league table entries
                // Ensure table exists and is an array
                if (Array.isArray(newState.leagues[leagueIndex].table)) {
                    simulationResult.updatedTableEntries.forEach(updatedEntry => {
                       const tableIndex = newState.leagues[leagueIndex].table.findIndex(t => t && t.teamId === updatedEntry.teamId); // Check t exists
                       if (tableIndex !== -1) {
                          newState.leagues[leagueIndex].table[tableIndex] = updatedEntry;
                       }
                    });
                }
              }
              // TODO: Update AI player stats post-match? (Optional for now)

              // Add news item for the AI result
              const homeTeamName = newState.teams.find(t => t.id === simulationResult.updatedMatch.homeTeamId)?.name || 'Home';
              const awayTeamName = newState.teams.find(t => t.id === simulationResult.updatedMatch.awayTeamId)?.name || 'Away';
              newsToAdd.push({
                id: generateId('news_'),
                date: dateStr,
                type: 'match_result',
                subject: `Result: ${homeTeamName} vs ${awayTeamName}`,
                message: `${homeTeamName} ${simulationResult.updatedMatch.result.homeScore} - ${simulationResult.updatedMatch.result.awayScore} ${awayTeamName}`,
                isRead: false,
              });
            }
          } // End loop through matchesToday
        }

        // If live match started, stop advancing time for this action
        if (liveMatchStarted) {
           // The loop advanced currentDate one extra time before breaking.
           currentDate = currentDate.subtract(1, 'day');
           daysProcessed--; // Don't count the day the live match starts
           break;
        }

        // Check if it's the end of a week (e.g., Sunday) to process training
        if (currentDate.day() === 0) { // 0 = Sunday
           console.log(`Processing weekly training for week ending ${currentDate.format('YYYY-MM-DD')}`);
           const trainingResults = processWeeklyTraining(newState);
           if (trainingResults.updatedPlayers.length > 0) {
              // Create a map of updated players for efficient update
              const updatedPlayerMap = new Map(trainingResults.updatedPlayers.map(p => [p.id, p]));
              newState.players = newState.players.map(p => updatedPlayerMap.get(p.id) || p);
              // Optionally add news items about significant improvements/injuries
           }
        }

        // TODO: Add other daily/weekly processing (news generation, financial updates, etc.) here
      } // End loop through daysToAdvance

      // Update final state
      return {
        ...newState, // Contains the updated liveMatch state if started
        currentDate: currentDate.toISOString(),
        autosaveCounter: state.autosaveCounter + daysProcessed, // Count days actually processed
        news: [...newsToAdd, ...(newState.news || [])] // Ensure news is an array
      };
    }

    // --- Live Match Action Handlers ---
    case ActionTypes.START_LIVE_MATCH: {
       const matchId = action.payload.matchId;
       // Ensure leagues and fixtures exist
       const match = (state.leagues || []).flatMap(l => l.fixtures || []).find(m => m && m.id === matchId);
       if (!match) return state; // Should not happen if triggered correctly

       // Initialize LiveMatchState
       const initialLiveState: LiveMatchState = {
           matchId: match.id,
           minute: 0,
           homeScore: 0,
           awayScore: 0,
           status: 'playing', // Or 'paused' initially? Let's start playing.
           ballPosition: { x: 50, y: 50 }, // Center pitch
           commentary: [{ minute: 0, text: "Kick off!" }],
           // Initialize live tactics from the match teams' current tactics
           liveHomeTactics: state.teams.find(t => t.id === match.homeTeamId)?.tactics,
           liveAwayTactics: state.teams.find(t => t.id === match.awayTeamId)?.tactics,
       };
       return { ...state, liveMatch: initialLiveState };
    }

    case ActionTypes.UPDATE_LIVE_MATCH: {
       if (!state.liveMatch) return state; // No live match active
       return {
           ...state,
           liveMatch: {
               ...state.liveMatch,
               ...action.payload.liveMatchState // Merge partial updates
           }
       };
    }

    case ActionTypes.END_LIVE_MATCH: {
       // TODO: Potentially update the main Match record with final score/stats from liveMatch state here?
       // Or ensure the simulation logic does this before END_LIVE_MATCH is dispatched.
       return { ...state, liveMatch: null }; // Clear live match state
    }

    case ActionTypes.UPDATE_TEAM:
      return {
        ...state,
        teams: (state.teams || []).map(team => // Ensure teams is an array
          team.id === action.payload.team.id ? action.payload.team : team
        )
      };

    case ActionTypes.UPDATE_PLAYER:
      return {
        ...state,
        players: (state.players || []).map(player => // Ensure players is an array
          player.id === action.payload.player.id ? action.payload.player : player
        )
      };

    case ActionTypes.ADD_NEWS:
      return {
        ...state,
        news: [action.payload.newsItem, ...(state.news || [])] // Ensure news is an array
      };

    case ActionTypes.MARK_NEWS_READ:
      return {
        ...state,
        news: (state.news || []).map(item => // Ensure news is an array
          item.id === action.payload.id ? { ...item, isRead: true } : item
        )
      };

    case ActionTypes.UPDATE_GAME_SETTINGS:
      return {
        ...state,
        gameSettings: {
          ...(state.gameSettings || { autosaveInterval: 7, theme: 'dark' }), // Provide default if null
          ...action.payload.settings
        }
      };

    case ActionTypes.RESET_AUTOSAVE_COUNTER:
      return {
        ...state,
        autosaveCounter: 0
      };

    case ActionTypes.UPDATE_MATCH:
      // This might need adjustment if live match handles final update
      return {
        ...state,
        leagues: (state.leagues || []).map(league => ({ // Ensure leagues is an array
          ...league,
          fixtures: (league.fixtures || []).map(match => // Ensure fixtures is an array
            match && match.id === action.payload.match.id ? action.payload.match : match
          )
        }))
      };

    default:
      // https://github.com/typescript-eslint/typescript-eslint/issues/1134
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
      // const exhaustiveCheck: never = action; // Comment out if action types are extended elsewhere
      return state;
  }
};
