'use client';

import { useState, createContext, useContext } from 'react';

// Create a context for our drawer state
const DrawerContext = createContext(undefined);

/**
 * Provider component for drawer state management
 * @param {object} props - The component props
 * @param {React.ReactNode} props.children - The child components
 */
export function DrawerProvider({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Open drawer function
  const openDrawer = () => {
    setIsDrawerOpen(true);
  };
  
  // Close drawer function
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <DrawerContext.Provider
      value={{
        isDrawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

/**
 * Custom hook for using drawer state and functions
 * @returns {object} Drawer state and functions
 */
export function useDrawer() {
  const context = useContext(DrawerContext);
  
  if (context === undefined) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  
  return context;
}