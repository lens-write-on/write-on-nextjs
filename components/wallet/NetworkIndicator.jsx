'use client';

import { useMemo } from 'react';
import { useNetwork } from 'wagmi';
import { cn } from '@/lib/utils';

export function NetworkIndicator({ showName = false, className }) {
  const { chain } = useNetwork();
  
  const networkInfo = useMemo(() => {
    // Default to Ethereum mainnet if no chain is provided
    if (!chain) {
      return {
        color: 'bg-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        name: 'Ethereum'
      };
    }

    // Network color mappings
    switch (chain.id) {
      case 1: // Ethereum Mainnet
        return {
          color: 'bg-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          name: 'Ethereum'
        };
      case 137: // Polygon
        return {
          color: 'bg-purple-500',
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          name: 'Polygon'
        };
      case 42161: // Arbitrum
        return {
          color: 'bg-blue-600',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          name: 'Arbitrum'
        };
      case 10: // Optimism
        return {
          color: 'bg-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          name: 'Optimism'
        };
      case 56: // BSC
        return {
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          name: 'BNB Chain'
        };
      case 43114: // Avalanche
        return {
          color: 'bg-red-600',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          name: 'Avalanche'
        };
      case 8453: // Base
        return {
          color: 'bg-blue-500',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          name: 'Base'
        };
      default:
        return {
          color: 'bg-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          name: chain.name || 'Unknown'
        };
    }
  }, [chain]);

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className={cn('flex items-center', showName ? 'gap-1.5' : '')}>
        <div className="relative flex h-2.5 w-2.5 items-center justify-center">
          <div className={cn('absolute h-full w-full rounded-full opacity-30', networkInfo.bgColor)} />
          <div className={cn('h-1.5 w-1.5 rounded-full', networkInfo.color)} />
        </div>
        {showName && <span className="text-sm font-medium">{networkInfo.name}</span>}
      </div>
    </div>
  );
}