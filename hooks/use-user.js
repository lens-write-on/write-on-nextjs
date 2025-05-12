'use client';

import { useState, createContext, useContext, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

// Create a context for user state
const UserContext = createContext(undefined);

/**
 * Provider component for user state management
 * @param {object} props - The component props
 * @param {React.ReactNode} props.children - The child components
 */
export function UserProvider({ children }) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [userExists, setUserExists] = useState(null);
  const [userData, setUserData] = useState(null);

  /**
   * Fetch user data from API based on wallet address
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<{exists: boolean, userData?: object}>} - User existence status and data
   */
  const fetchUserData = async (walletAddress) => {
    if (!walletAddress) {
      return { exists: false };
    }
    
    setIsCheckingUser(true);
    
    try {
      const response = await fetch(`/api/users?walletAddress=${walletAddress}`);
      const data = await response.json();
      
      if (data.success) {
        // Update user data if available in API response
        if (data.user) {
          setUserData(data.user);
        }
        
        return { exists: data.exists, userData: data.user };
      } else {
        throw new Error(data.message || 'Failed to check user status');
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Couldn't verify your account status. Please try again.",
      });
      return { exists: null };
    } finally {
      setIsCheckingUser(false);
    }
  };

  // Check if user exists when wallet address changes
  useEffect(() => {
    async function checkUserExists() {
      if (!address || !isConnected) {
        // Reset state when disconnected
        setUserExists(null);
        setUserData(null);
        return;
      }
      
      const { exists } = await fetchUserData(address);
      setUserExists(exists);
      
      // If user doesn't exist, redirect to registration
      if (exists === false) {
        toast({
          title: "Registration Required",
          description: "Please complete your profile to continue.",
          duration: 5000,
        });
        router.push('/apps/account/register');
      }
    }

    checkUserExists();
  }, [address, isConnected, router]);

  /**
   * Update user existence status with fresh data from API
   * @param {boolean} exists - New user existence status
   */
  const updateUserExists = async (exists) => {
    // If manually setting to true, verify with fresh data from API
    if (exists === true && address) {
      const result = await fetchUserData(address);
      setUserExists(result.exists);
    } else {
      // Direct update when setting to false or null
      setUserExists(exists);
    }
  };

  return (
    <UserContext.Provider
      value={{
        isCheckingUser,
        userExists,
        userData,
        setUserData, // Expose setUserData function
        setUserExists: updateUserExists,
        refreshUserData: () => address && fetchUserData(address),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/**
 * Custom hook for using user state
 * @returns {object} User state
 */
export function useUser() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
}