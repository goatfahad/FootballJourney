import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">{title}</h3>}
      {/* Children will inherit text color from parent or have their own dark: variants */}
      {children}
    </div>
  );
};
