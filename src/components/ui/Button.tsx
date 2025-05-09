import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'info' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded focus:outline-none focus:ring-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out';
  
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white focus:ring-blue-500 dark:focus:ring-blue-400',
    secondary: 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white focus:ring-gray-500 dark:focus:ring-gray-500', // Changed green to gray for secondary
    success: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white focus:ring-green-500 dark:focus:ring-green-400',
    danger: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white focus:ring-red-500 dark:focus:ring-red-400',
    info: 'bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 text-white focus:ring-teal-500 dark:focus:ring-teal-400',
    warning: 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-gray-800 dark:text-gray-900 focus:ring-yellow-500 dark:focus:ring-yellow-400' // Adjusted warning text for better contrast
  };
  
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-sm',
    lg: 'py-3 px-6 text-lg'
  };
  
  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
