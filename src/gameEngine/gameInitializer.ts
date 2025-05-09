import { GameState, NewGameSettings, League, Team, Player } from '../types/gameTypes';
import { generateId } from '../utils/idGenerator';
import { createPlayer, createTeam } from './dataGenerator';
import dayjs from 'dayjs';

const START_DATE = "2023-07-01";
const DEFAULT_PLAYERS_PER_TEAM = 20;

interface LeagueConfig {
  name: string;
  country: string;
  teamsCount: number;
  tier: number;
}

const leagueSetups: LeagueConfig[] = [
  { name: 'Premier Division', country: 'England', teamsCount: 6, tier: 1 },
  { name: 'Championship', country: 'England', teamsCount: 6, tier: 2 },
  { name: 'Primera Liga', country: 'Spain', teamsCount: 6, tier: 1 },
  { name: 'Segunda Liga', country: 'Spain', teamsCount: 6, tier: 2 },
];

export const initializeNewGame = async (settings: NewGameSettings): Promise<GameState> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("[GameInitializer] Starting initializeNewGame with settings:", JSON.parse(JSON.stringify(settings)));
      const newPlayers: Player[] = [];
      const newTeams: Team[] = [];
      const newLeagues: League[] = [];
      let determinedPlayerTeamId: string | null = settings.selectedClubId; // Start with settings

      const playersPerTeam = settings.playersPerTeam || DEFAULT_PLAYERS_PER_TEAM;
      console.log(`[GameInitializer] Players per team: ${playersPerTeam}`);

      leagueSetups.forEach(leagueConfig => {
        console.log(`[GameInitializer] Creating league: ${leagueConfig.name} in ${leagueConfig.country}`);
        const league: League = {
          id: generateId('league_'),
          name: leagueConfig.name,
          country: leagueConfig.country,
          level: leagueConfig.tier,
          teamIds: [],
          fixtures: [], // Fixtures should be generated separately if complex
          table: [],    // Initialize empty table
          promotionSpots: leagueConfig.tier === 1 ? 2 : 3, // Example
          relegationSpots: leagueConfig.tier === 1 ? 3 : 2, // Example
          currentMatchday: 0,
          isFinished: false,
          className: 'League'
        };

        for (let i = 0; i < leagueConfig.teamsCount; i++) {
          // Pass league.id, leagueConfig.country, league.name to createTeam
          const team = createTeam(league.id, leagueConfig.country, league.name);
          console.log(`[GameInitializer] Created team: ${team.name} (ID: ${team.id}) for league ${league.name}`);
          
          for (let j = 0; j < playersPerTeam; j++) {
            const player = createPlayer(team.id, undefined, false);
            team.playerIds.push(player.id);
            newPlayers.push(player);
          }
          console.log(`[GameInitializer] Added ${playersPerTeam} players to ${team.name}`);
          
          newTeams.push(team);
          league.teamIds.push(team.id);
          
          // Initialize table entry for this team
          league.table.push({
             teamId: team.id, played: 0, won: 0, drawn: 0, lost: 0,
             goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
          });

          // This logic for determinedPlayerTeamId needs to be robust.
          // If settings.selectedClubId is a placeholder like 'team_1', it won't match generated IDs.
          // For now, if it's the first team of the first league, and a specific placeholder ID was passed, try to use it.
          // Otherwise, the fallback will take over.
          if (leagueConfig.name === 'Premier Division' && i === 0 && settings.selectedClubId === 'team_1') {
            determinedPlayerTeamId = team.id; 
          } else if (leagueConfig.name === 'Premier Division' && i === 1 && settings.selectedClubId === 'team_2') {
            determinedPlayerTeamId = team.id;
          } // Add more specific mappings if NewGameModal uses a fixed list of selectable IDs/names
          
          // Fallback if no specific match or if it's the first team overall
          if (i === 0 && leagueSetups.indexOf(leagueConfig) === 0 && !newTeams.find(t => t.id === determinedPlayerTeamId)) {
            determinedPlayerTeamId = team.id;
          }
        }
        console.log(`[GameInitializer] Finished creating league: ${league.name} with ${league.teamIds.length} teams.`);
        newLeagues.push(league);
      });
      
      // Final check and default for playerTeamId if still not validly set
      if (newTeams.length > 0 && (!determinedPlayerTeamId || !newTeams.find(t => t.id === determinedPlayerTeamId))) {
        console.warn(`[GameInitializer] playerTeamId '${determinedPlayerTeamId}' not found among generated teams or was null. Defaulting to first generated team.`);
        determinedPlayerTeamId = newTeams[0].id;
      }
      console.log(`[GameInitializer] Final playerTeamId: ${determinedPlayerTeamId}`);
      console.log(`[GameInitializer] Total leagues created: ${newLeagues.length}, Total teams: ${newTeams.length}, Total players: ${newPlayers.length}`);

      const gameState: GameState = {
        currentDate: dayjs(START_DATE).toISOString(),
        playerTeamId: determinedPlayerTeamId,
        teams: newTeams,
        players: newPlayers,
        leagues: newLeagues,
        news: [{
          id: generateId('news_'),
          date: dayjs(START_DATE).toISOString(),
          type: 'game_start',
          subject: 'Welcome to FootballJourney!',
          message: `Welcome, manager ${settings.managerName || 'Manager'}! Your journey with ${newTeams.find(t=>t.id === determinedPlayerTeamId)?.name || 'your new club'} begins now. Good luck!`,
          isRead: false,
          teamId: determinedPlayerTeamId
        }],
        gameSettings: {
          autosaveInterval: 7,
          theme: 'dark' // Default theme
        },
        transferOfferQueue: [],
        jobOffers: [],
        seasonYear: dayjs(START_DATE).year(),
        processedEndOfSeason: false,
        autosaveCounter: 0,
        gameLoaded: true,
        liveMatch: null
      };
      
      console.log("[GameInitializer] Resolving with gameState (teams, players, leagues counts):", gameState.teams.length, gameState.players.length, gameState.leagues.length);
      resolve(gameState);
    }, 500);
  });
};

export const loadGame = async (loadedGameState: GameState): Promise<GameState> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("[GameInitializer] Loading game from saved state. Teams count:", loadedGameState.teams?.length || 0);
      resolve({...loadedGameState, gameLoaded: true});
    }, 250);
  });
};
