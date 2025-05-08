import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { ActionTypes } from '../../types/actionTypes';
import { findNextMatch } from '../../utils/matchUtils';

export const Sidebar: React.FC = () => {
  const { state, dispatch, startLoading, stopLoading } = useGame();
  const location = useLocation();
  const navigate = useNavigate();
  
  const unreadMessagesCount = state.news.filter(
    item => !item.isRead && (!item.teamId || item.teamId === state.playerTeamId)
  ).length;
  
  const advanceTime = async (days: number) => {
    startLoading(`Advancing time...`);
    
    // Using setTimeout to allow UI to update
    setTimeout(() => {
      try {
        // Process each day one by one (can be optimized for larger jumps)
        for (let i = 0; i < days; i++) {
          dispatch({
            type: ActionTypes.ADVANCE_TIME,
            payload: { days: 1 }
          });
          
          // Process daily events here
          // This would run simulation for each day
          
          // Check if there's a match for player's team on this day
          // If so, navigate to match preview
          const nextMatch = findNextMatch(state);
          if (nextMatch) {
            navigate('/game/match-preview');
            break;
          }
        }
      } finally {
        stopLoading();
      }
    }, 100);
  };
  
  const advanceToNextMatch = () => {
    const nextMatch = findNextMatch(state);
    if (nextMatch) {
      const currentDate = dayjs(state.currentDate);
      const matchDate = dayjs(nextMatch.date);
      const daysToAdvance = matchDate.diff(currentDate, 'day');
      
      if (daysToAdvance >= 0) {
        advanceTime(daysToAdvance);
      }
    } else {
      // Show notification that no matches were found
    }
  };
  
  return (
    <nav className="w-1/5 bg-gray-800 p-1 sm:p-4 rounded-lg shadow-lg mr-1 sm:mr-4 sticky top-[88px] h-[calc(100vh-100px)] overflow-y-auto">
      <ul className="space-y-2">
        <li>
          <NavLink 
            to="/game/dashboard"
            className={({ isActive }) => 
              isActive 
                ? "block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white" 
                : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 text-gray-300"
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/game/squad"
            className={({ isActive }) => 
              isActive 
                ? "block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white" 
                : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 text-gray-300"
            }
          >
            Squad
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/game/tactics"
            className={({ isActive }) => 
              isActive 
                ? "block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white" 
                : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 text-gray-300"
            }
          >
            Tactics
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/game/fixtures"
            className={({ isActive }) => 
              isActive 
                ? "block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white" 
                : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 text-gray-300"
            }
          >
            Fixtures
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/game/league-table"
            className={({ isActive }) => 
              isActive 
                ? "block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white" 
                : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 text-gray-300"
            }
          >
            League Table
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/game/transfers"
            className={({ isActive }) => 
              isActive 
                ? "block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white" 
                : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 text-gray-300"
            }
          >
            Transfer Market
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/game/finances"
            className={({ isActive }) => 
              isActive 
                ? "block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white" 
                : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 text-gray-300"
            }
          >
            Finances
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/game/training"
            className={({ isActive }) => 
              isActive 
                ? "block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white" 
                : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 text-gray-300"
            }
          >
            Training & Youth
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/game/inbox"
            className={({ isActive }) => 
              isActive 
                ? "block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white" 
                : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 text-gray-300"
            }
          >
            Inbox
            {unreadMessagesCount > 0 && (
              <span className="ml-1 inline-block py-0.5 px-1.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-red-500 text-white rounded-full text-xs">
                {unreadMessagesCount}
              </span>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/game/settings"
            className={({ isActive }) => 
              isActive 
                ? "block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white" 
                : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 text-gray-300"
            }
          >
            Settings & Save
          </NavLink>
        </li>
        <li>
          <Button
            onClick={() => advanceTime(1)}
            variant="success"
            className="mt-4 w-full"
          >
            Advance Day
          </Button>
        </li>
        <li>
          <Button
            onClick={advanceToNextMatch}
            variant="info"
            className="mt-2 w-full"
          >
            Sim to Next Match
          </Button>
        </li>
      </ul>
    </nav>
  );
};