import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { NewsItem } from '../../types/gameTypes';
import { ActionTypes } from '../../types/actionTypes';
import { formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';
// Import InboxDetailModal - assuming it will be created
import { InboxDetailModal } from '../modals/InboxDetailModal';

export const InboxScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const { news, playerTeamId } = state;
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);

  // Filter news relevant to the player's team or general news
  const relevantNews = useMemo(() => {
    // Ensure news is an array before filtering/sorting
    if (!Array.isArray(news)) return []; 
    return news
      .filter(item => item && (!item.teamId || item.teamId === playerTeamId)) // Added null check for item
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first
  }, [news, playerTeamId]);

  const handleViewItem = (item: NewsItem) => {
    setSelectedNewsItem(item);
    if (!item.isRead) {
      dispatch({ type: ActionTypes.MARK_NEWS_READ, payload: { id: item.id } });
    }
  };

  const handleCloseModal = () => {
    setSelectedNewsItem(null);
  };

  const handleDeleteItem = (id: string) => {
    console.log(`Delete news item ${id} (not implemented in reducer yet)`);
    // TODO: Add DELETE_NEWS action type and reducer logic
    if (selectedNewsItem?.id === id) {
      handleCloseModal(); // Close modal if the deleted item was open
    }
  };

  if (!state.gameLoaded) {
    return <div className="p-4 text-center">Loading inbox...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Inbox</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {relevantNews.map(item => (
            <li 
              key={item.id} 
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!item.isRead ? 'font-semibold' : ''}`}
              onClick={() => handleViewItem(item)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${!item.isRead ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.subject}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(item.date)} - {item.type.replace('_', ' ')}
                  </p>
                </div>
                <div className="ml-2">
                   <Button 
                     onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} 
                     variant="danger" 
                     size="sm"
                   >
                     Delete
                   </Button>
                </div>
              </div>
            </li>
          ))}
          {relevantNews.length === 0 && (
            <li className="p-4 text-center text-gray-500 dark:text-gray-400">Your inbox is empty.</li>
          )}
        </ul>
      </div>

      {/* News Detail Modal */}
      {selectedNewsItem && (
        <InboxDetailModal 
          item={selectedNewsItem} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};
