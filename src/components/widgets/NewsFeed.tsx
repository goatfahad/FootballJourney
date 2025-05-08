import React from 'react';
import { NewsItem } from '../../types/gameTypes';
import { ActionTypes } from '../../types/actionTypes';
import { useGame } from '../../context/GameContext';
import dayjs from 'dayjs';

interface NewsFeedProps {
  newsItems: NewsItem[];
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ newsItems }) => {
  const { dispatch } = useGame();
  
  const markAsRead = (id: string) => {
    dispatch({
      type: ActionTypes.MARK_NEWS_READ,
      payload: { id }
    });
  };
  
  return (
    <ul className="space-y-2 max-h-60 overflow-y-auto">
      {newsItems.map(item => (
        <li 
          key={item.id}
          onClick={() => markAsRead(item.id)}
          className={`text-sm text-gray-300 p-2 rounded cursor-pointer ${
            item.isRead ? 'bg-gray-600 hover:bg-gray-500' : 'bg-blue-800 hover:bg-blue-700 border-l-4 border-blue-400'
          }`}
        >
          <span className="font-semibold text-gray-200">
            {dayjs(item.date).format('D MMM')}: 
          </span>{' '}
          <span>{item.message}</span>
        </li>
      ))}
      {newsItems.length === 0 && (
        <li className="text-sm text-gray-400">No news items.</li>
      )}
    </ul>
  );
};