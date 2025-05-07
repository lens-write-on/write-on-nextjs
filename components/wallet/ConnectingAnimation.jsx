'use client';

import { useState, useEffect } from 'react';
import { useConnectors } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { motion } from 'framer-motion';

// Helper function to find an appropriate connector
const findAppropriateConnector = (connectors) => {
  if (!connectors || connectors.length === 0) return null;
  
  // Try to find popular wallet connectors first
  const popularWalletIds = ['metaMask', 'rainbow', 'coinbase', 'walletConnect', 'injected'];
  
  for (const id of popularWalletIds) {
    const connector = connectors.find(c => {
      // Enhanced check for connector matching
      const connectorId = c.id?.toLowerCase() || '';
      const connectorName = c.name?.toLowerCase() || '';
      return connectorId.includes(id.toLowerCase()) || connectorName.includes(id.toLowerCase());
    });
    if (connector) return connector;
  }
  
  // If no popular wallet found, but connectors exist, return the first available connector
  if (connectors.length > 0) {
    return connectors[0]; // Fallback to first connector
  }
  
  return null;
};

export function ConnectingAnimation() {
  const { connectors, connectAsync } = useConnectors();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState(0);
  const [error, setError] = useState(null);
  
  // Animation steps
  const steps = [
    "Initializing connection...",
    "Connecting to wallet...",
    "Requesting accounts...",
    "Almost there..."
  ];
  
  useEffect(() => {
    // Listen for connection request events from the button
    const handleConnectRequest = () => {
      setIsConnecting(true);
      setError(null);
      
      // Simulate connection steps
      const stepInterval = setInterval(() => {
        setConnectionStep(prev => {
          if (prev >= steps.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 800);

      try {
        // In RainbowKit v2, connector IDs have changed
        // Try to find an appropriate connector - prioritize popular ones
        console.log('Available connectors:', connectors);    
        const connector = findAppropriateConnector(connectors);
        
        if (connector) {
          console.log('Selected connector:', connector.name || connector.id);
          connectAsync({ connector })
            .catch(error => {
              console.error('Connection error:', error);
              setError(error.message || 'Failed to connect to wallet');
            })
            .finally(() => {
              clearInterval(stepInterval);
              setTimeout(() => {
                setIsConnecting(false);
                setConnectionStep(0);
              }, 500);
            });
        } else {
          // If no connector is found, try to use any available connector
          if (connectors && connectors.length > 0) {
            console.log('Using first available connector:', connectors[0].name || connectors[0].id);
            connectAsync({ connector: connectors[0] })
              .catch(error => {
                console.error('Connection error:', error);
                setError(error.message || 'Failed to connect to wallet');
              })
              .finally(() => {
                clearInterval(stepInterval);
                setTimeout(() => {
                  setIsConnecting(false);
                  setConnectionStep(0);
                }, 500);
              });
          } else {
            console.error('No wallet connectors found');
            setError('No wallet connectors found. Please install a web3 wallet.');
            clearInterval(stepInterval);
            setTimeout(() => {
              setIsConnecting(false);
              setConnectionStep(0);
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Unexpected error during wallet connection:', err);
        setError('An unexpected error occurred. Please try again.');
        clearInterval(stepInterval);
        setTimeout(() => {
          setIsConnecting(false);
          setConnectionStep(0);
        }, 2000);
      }
    };
    
    window.addEventListener('rk-connect-request', handleConnectRequest);
    
    return () => {
      window.removeEventListener('rk-connect-request', handleConnectRequest);
    };
  }, [connectors, connectAsync, steps.length]);
  
  if (!isConnecting) return null;
  
  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <Card className="p-8 max-w-md w-full bg-white dark:bg-slate-900 border-none shadow-2xl rounded-xl">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500/20 to-indigo-500/20"
                  animate={{ 
                    scale: [1, 1.5, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                />
              </div>
              <Spinner size="lg" className="text-violet-600 dark:text-violet-400" />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">Connecting to Wallet</h3>
              <motion.div
                key={connectionStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-slate-500 dark:text-slate-400 h-5"
              >
                {error ? (
                  <span className="text-red-500">{error}</span>
                ) : (
                  steps[connectionStep]
                )}
              </motion.div>
            </div>
            
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
              <motion.div 
                className={`${error ? 'bg-red-500' : 'bg-gradient-to-r from-violet-500 to-indigo-600'} h-1.5 rounded-full`}
                animate={{ width: error ? '100%' : `${((connectionStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}