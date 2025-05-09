import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Removed useLocation as it's not used
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { ActionTypes } from '../../types/actionTypes';
import { findNextMatch } from '../../utils/matchUtils';
import dayjs from 'dayjs'; // Ensure dayjs is imported

export const Sidebar: React.FC = () => {
  const { state, dispatch, startLoading, stopLoading } = useGame();
  const navigate = useNavigate();

  // Ensure news array exists before filtering
  const unreadMessagesCount = Array.isArray(state.news) ? state.news.filter(
    item => item && !item.isRead && (!item.teamId || item.teamId === state.playerTeamId)
  ).length : 0;

  // Simplified advanceTime - dispatches total days. Reducer handles day-by-day.
  const advanceTime = (days: number) => {
    if (days < 0) return;
    
    startLoading(`Advancing time by ${days} day(s)...`);
    
    setTimeout(() => {
        try {
            dispatch({
                type: ActionTypes.ADVANCE_TIME,
                payload: { days } 
            });
            // Navigation to live match (if any) will be handled by App.tsx or MainLayout.tsx
            // observing state.liveMatch
        } catch (error) {
            console.error("Error dispatching ADVANCE_TIME:", error);
        } finally {
            stopLoading();
        }
    }, 50); 
  };

  const advanceToNextMatch = () => {
    const nextMatch = findNextMatch(state);
    if (nextMatch) {
      const currentDate = dayjs(state.currentDate);
      const matchDate = dayjs(nextMatch.date);
      const daysToAdvance = Math.max(0, matchDate.diff(currentDate, 'day'));

      if (daysToAdvance >= 0) {
        advanceTime(daysToAdvance);
      } else {
         console.log("Next match date is in the past?");
      }
    } else {
      console.log("No upcoming matches found to simulate to.");
      // Consider using toast for feedback if no match found
      // toast.info("No upcoming matches found.");
    }
   };
 
   return (
     // Added dark mode variants for background and links
     <nav className="w-1/5 bg-white dark:bg-gray-800 p-1 sm:p-4 rounded-lg shadow-lg mr-1 sm:mr-4 sticky top-[88px] h-[calc(100vh-100px)] overflow-y-auto border-r border-gray-200 dark:border-gray-700">
       <ul className="space-y-2">
         <li>
           <NavLink 
             to="/game/dashboard"
             className={({ isActive }) => 
               isActive 
                 ? "block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white" // Active state remains the same
                 : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" // Default state with dark variants
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
                 : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                 : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                 : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                 : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                 : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                 : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                 : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                 : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                 : "block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
            disabled={!findNextMatch(state)} // Disable if no next match
          >
            Sim to Next Match
          </Button>
        </li>
      </ul>
    </nav>
  );
};
