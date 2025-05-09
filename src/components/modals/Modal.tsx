import React, { ReactNode } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  // State for animation
  const [isClosing, setIsClosing] = React.useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      // setIsClosing(false); // Reset if modal can be reopened without unmounting
    }, 200); // Match animation duration
  };

  return (
    <div 
      className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${isClosing ? 'bg-opacity-0' : 'bg-opacity-60 dark:bg-opacity-75'}`}
      onClick={handleClose} // Close on backdrop click
    >
      <div 
        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-gray-300 dark:border-gray-700 transform transition-all duration-300 ease-in-out
                    ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-3xl leading-none focus:outline-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        {/* Children will inherit text color or set their own dark: variants */}
        {children}
      </div>
    </div>
  );
};
