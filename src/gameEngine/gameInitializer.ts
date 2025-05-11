import { GameState, NewGameSettings, League, Team, Player, Match } from '../types/gameTypes';
import { generateId } from '../utils/idGenerator';
import { createPlayer, createTeam } from './dataGenerator';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';

dayjs.extend(weekday);

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

const generateLeagueFixtures = (leagueId: string, teamIds: string[], seasonStartDate: string): Match[] => {
  const fixtures: Match[] = [];
  if (teamIds.length < 2) return fixtures;

  let teams = [...teamIds];
  // If odd number of teams, add a "bye" placeholder
  if (teams.length % 2 !== 0) {
    teams.push("BYE");
  }
  const numTeams = teams.length;
  const numRounds = (numTeams - 1) * 2; // Play each team home and away
  const matchesPerRound = numTeams / 2;
  let matchDate = dayjs(seasonStartDate);

  // Find the first Saturday from the season start date
  matchDate = matchDate.weekday(6); // 6 for Saturday (0 for Sunday, 1 for Monday, etc.)

  for (let round = 0; round < numRounds; round++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const homeTeamId = teams[i];
      const awayTeamId = teams[numTeams - 1 - i];

      if (homeTeamId !== "BYE" && awayTeamId !== "BYE") {
        // Alternate home/away for the second half of the season
        const isSecondHalf = round >= (numTeams - 1);
        const currentHome = isSecondHalf ? awayTeamId : homeTeamId;
        const currentAway = isSecondHalf ? homeTeamId : awayTeamId;

        fixtures.push({
          id: generateId('match_'),
          homeTeamId: currentHome,
          awayTeamId: currentAway,
          date: matchDate.toISOString(),
          leagueId,
          status: 'scheduled',
          result: { homeScore: 0, awayScore: 0 },
          events: [],
          stats: { homeShots: 0, awayShots: 0, homeShotsOnTarget: 0, awayShotsOnTarget: 0, homePossession: 0, awayPossession: 0 },
          commentaryLog: [],
          className: 'Match',
        });
      }
    }

    // Rotate teams for the next round (except the first team)
    const lastTeam = teams.pop();
    if (lastTeam) { // Should always be true unless teams array was empty
        teams.splice(1, 0, lastTeam);
    }
    
    matchDate = matchDate.add(1, 'week'); // Advance to next week's matchday
  }
  return fixtures;
};

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
          fixtures: [], // Initialize empty, will be populated below
          table: [],    // Initialize empty table
          promotionSpots: leagueConfig.tier === 1 ? 2 : 3, // Example
          relegationSpots: leagueConfig.tier === 1 ? 3 : 2, // Example
          currentMatchday: 0,
          isFinished: false,
          className: 'League'
        };

        for (let i = 0; i < leagueConfig.teamsCount; i++) {
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
          
          league.table.push({
             teamId: team.id, played: 0, won: 0, drawn: 0, lost: 0,
             goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
          });

          if (leagueConfig.name === 'Premier Division' && i === 0 && settings.selectedClubId === 'team_1') {
            determinedPlayerTeamId = team.id; 
          } else if (leagueConfig.name === 'Premier Division' && i === 1 && settings.selectedClubId === 'team_2') {
            determinedPlayerTeamId = team.id;
          } 
          
          if (i === 0 && leagueSetups.indexOf(leagueConfig) === 0 && !newTeams.find(t => t.id === determinedPlayerTeamId)) {
            determinedPlayerTeamId = team.id;
          }
        }
        // Generate fixtures for the league
        league.fixtures = generateLeagueFixtures(league.id, league.teamIds, START_DATE);
        console.log(`[GameInitializer] Generated ${league.fixtures.length} fixtures for league: ${league.name}`);
        
        console.log(`[GameInitializer] Finished creating league: ${league.name} with ${league.teamIds.length} teams.`);
        newLeagues.push(league);
      });
      
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
        staff: [], // Added missing staff property
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
          theme: 'dark'
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
