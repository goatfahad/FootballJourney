import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LeaguePosition } from '../widgets/LeaguePosition';
import { NextMatch } from '../widgets/NextMatch';
import { FinanceOverview } from '../widgets/FinanceOverview';
import { NewsFeed } from '../widgets/NewsFeed';
import { Link } from 'react-router-dom';
import { Match, NewsItem } from '../../types/gameTypes';

export const Dashboard: React.FC = () => {
  const { state } = useGame();
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const playerTeam = state.teams.find(t => t.id === state.playerTeamId);

  useEffect(() => {
    // Find the next match
    if (state.gameLoaded && playerTeam && state.leagues) { // Added check for state.leagues
      const upcomingMatches = state.leagues
        .flatMap(l => l.fixtures || []) // Added default empty array for fixtures
        .filter(m =>
          m && // Added check for match object
          (m.homeTeamId === playerTeam.id || m.awayTeamId === playerTeam.id) &&
          m.status === 'scheduled' &&
          new Date(m.date) >= new Date(state.currentDate)
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setNextMatch(upcomingMatches[0] || null);
    } else {
      setNextMatch(null); // Reset if not loaded or no team/leagues
    }

    // Get latest news
    if (state.gameLoaded && state.news) { // Added check for state.news
      const filteredNews = state.news
        .filter(item => item && (!item.teamId || item.teamId === state.playerTeamId)) // Added check for item object
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setLatestNews(filteredNews);
    } else {
       setLatestNews([]); // Reset if not loaded or no news
    }
    // Ensure all dependencies that could affect the outcome are listed
  }, [state.gameLoaded, state.currentDate, state.leagues, state.news, playerTeam, state.playerTeamId]); 

  if (!state.gameLoaded || !playerTeam) {
    // This check was confirmed correct previously
    return <div className="p-4 text-center">Loading dashboard data...</div>; // Adjusted message slightly
  }

  // Ensure playerTeam.leagueId exists before passing to LeaguePosition
  if (!playerTeam.leagueId) {
     return <div className="p-4 text-center">Error: Player team has no assigned league.</div>;
  }

  return (
    // Added dark mode classes based on previous work
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Ensure components handle potentially null props gracefully or add checks */}
        <NextMatch match={nextMatch} />
        <LeaguePosition teamId={playerTeam.id} leagueId={playerTeam.leagueId} />
        <FinanceOverview team={playerTeam} />
      </div>

      {/* Ensure Card and NewsFeed handle dark mode */}
      <Card title="Latest News">
        <NewsFeed newsItems={latestNews} />
        <div className="mt-3">
          <Link to="/game/inbox">
            <Button variant="primary" size="sm">View All News</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
