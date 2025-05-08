import React from 'react';
import { useGame } from '../../context/GameContext';

export const Notification: React.FC = () => {
  const [notification, setNotification] = React.useState<{
    visible: boolean;
    message: string;
    type: 'info' | 'success' | 'error';
  }>({ visible: false, message: '', type: 'info' });
  
  // In a real app, this would use a context or state management system
  // to handle notifications. For this example, we're just showing a stub.
  
  if (!notification.visible) return null;
  
  return (
    <div 
      className="fixed bottom-5 right-5 bg-gray-700 text-white p-4 rounded-lg shadow-lg z-[100]"
      style={{
        animation: 'fadeInOut 0.3s ease-in-out'
      }}
    >
      <p>{notification.message}</p>
    </div>
  );
};