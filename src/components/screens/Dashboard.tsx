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
    if (state.gameLoaded && playerTeam) {
      const upcomingMatches = state.leagues
        .flatMap(l => l.fixtures)
        .filter(m => 
          (m.homeTeamId === playerTeam.id || m.awayTeamId === playerTeam.id) && 
          m.status === 'scheduled' && 
          new Date(m.date) >= new Date(state.currentDate)
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setNextMatch(upcomingMatches[0] || null);
    }
    
    // Get latest news
    if (state.gameLoaded) {
      const filteredNews = state.news
        .filter(item => !item.teamId || item.teamId === state.playerTeamId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      
      setLatestNews(filteredNews);
    }
  }, [state.gameLoaded, state.currentDate, state.leagues, state.news, playerTeam]);
  
  if (!state.gameLoaded || !playerTeam) {
    return <div>Loading dashboard...</div>;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <NextMatch match={nextMatch} />
        <LeaguePosition teamId={playerTeam.id} leagueId={playerTeam.leagueId} />
        <FinanceOverview team={playerTeam} />
      </div>
      
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