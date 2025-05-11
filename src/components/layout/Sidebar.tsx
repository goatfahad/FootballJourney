import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { ActionTypes } from '../../types/actionTypes';
import { findNextMatch } from '../../utils/matchUtils';
import dayjs from 'dayjs'; // Ensure dayjs is imported

export const Sidebar: React.FC = () => {
  const { state, dispatch, startLoading, stopLoading } = useGame();
  const router = useRouter();
  const pathname = usePathname();

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
         {[
           { href: "/game/dashboard", label: "Dashboard" },
           { href: "/game/squad", label: "Squad" },
           // { href: "/game/tactics", label: "Tactics" }, // Tactics screen removed for now
           { href: "/game/fixtures", label: "Fixtures" },
           { href: "/game/league-table", label: "League Table" },
           { href: "/game/transfers", label: "Transfer Market" },
           { href: "/game/finances", label: "Finances" },
           { href: "/game/training", label: "Training & Youth" },
           { href: "/game/inbox", label: "Inbox", count: unreadMessagesCount },
           { href: "/game/settings", label: "Settings & Save" },
         ].map((item) => (
           item.href && // Ensure item.href is defined (for the removed tactics link)
           <li key={item.href}>
             <Link
               href={item.href}
               className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                 pathname === item.href
                   ? "bg-blue-500 text-white"
                   : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
               }`}
             >
               {item.label}
               {item.label === "Inbox" && item.count !== undefined && item.count > 0 && (
                 <span className="ml-1 inline-block py-0.5 px-1.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-red-500 text-white rounded-full text-xs">
                   {item.count}
                 </span>
               )}
             </Link>
           </li>
         ))}
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
