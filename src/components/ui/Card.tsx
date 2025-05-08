import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-gray-700 p-4 rounded-lg shadow ${className}`}>
      {title && <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>}
      {children}
    </div>
  );
};