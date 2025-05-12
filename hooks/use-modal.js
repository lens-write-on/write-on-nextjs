'use client';

import { useState, createContext, useContext } from 'react';

// Create a context for our modal state
const ModalContext = createContext(undefined);

/**
 * Provider component for modal state management
 * @param {object} props - The component props
 * @param {React.ReactNode} props.children - The child components
 */
export function ModalProvider({ children }) {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  
  // Open account modal function
  const openAccountModal = () => {
    setIsAccountModalOpen(true);
  };
  
  // Close account modal function
  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{
        isAccountModalOpen,
        openAccountModal,
        closeAccountModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

/**
 * Custom hook for using modal state and functions
 * @returns {object} Modal state and functions
 */
export function useModal() {
  const context = useContext(ModalContext);
  
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  
  return context;
}