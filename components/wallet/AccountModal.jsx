'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { truncateAddress } from '@/lib/utils';
import { useDisconnect, useAccount, useBalance } from 'wagmi';
import { Copy, ExternalLink, LogOut, Check, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useModal } from '@/hooks/use-modal';
import { fetchBalance } from '@/lib/web3-call';
import { useNetwork } from 'wagmi';
import { getChainById } from '@/lib/chains';

// Using our custom modal hook instead of props
export default function AccountModal() {
  const { isAccountModalOpen, closeAccountModal } = useModal();
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(null);
  const { disconnect } = useDisconnect();
  const { address, connector, chainId, isConnected } = useAccount();

  // Fetch the balance when address or chainId changes
  useEffect(() => {
    const getBalance = async () => {
      if (address && chainId) {
        try {
          const result = await fetchBalance(address, chainId);
          setBalance({
            formatted: result.toString(),
            symbol: connector?.chains?.find(c => c.id === chainId)?.nativeCurrency?.symbol || 'ETH'
          });
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        }
      }
    };

    if (isConnected && address) {
      getBalance();
    }
  }, [address, chainId, connector, isConnected]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isAccountModalOpen && e.target.id === 'modal-backdrop') {
        closeAccountModal();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAccountModalOpen, closeAccountModal]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (isAccountModalOpen && e.key === 'Escape') {
        closeAccountModal();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isAccountModalOpen, closeAccountModal]);

  // Get chain info from the connector
  const chain = getChainById(chainId)

  const copyToClipboard = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openExplorer = () => {
    if (chain?.blockExplorers?.default?.url && address) {
      window.open(`${chain.blockExplorers.default.url}/address/${address}`, '_blank');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    closeAccountModal();
  };

  // Get ENS info or displayName from account info
  const displayName = address ? truncateAddress(address) : '';

  // Early returns after all hooks have been called
  if(!isConnected) return null; // If not connected, don't show the modal
  if(!isAccountModalOpen) return null; // If modal is closed, don't render it

  return (
    <div
      id="modal-backdrop"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md px-4"
      >
        <Card className="border-none dark:bg-[#060606] backdrop-blur-lg shadow-xl">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="w-full flex justify-end mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full h-8 w-8 p-0" 
                onClick={closeAccountModal}
              >
                ✕
              </Button>
            </div>
            
            <div className="mb-4 flex flex-col items-center">
              <CardTitle className="text-xl mb-0.5">
                {displayName}
              </CardTitle>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="mr-2">{truncateAddress(address)}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 rounded-full" 
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            
            <div className="w-full mb-2 flex justify-center">
              <div className="bg-muted/50 rounded-full py-2 px-4 text-center">
                <span className="font-medium">{balance?.formatted && Number(balance.formatted).toFixed(4)}</span>
                <span className="text-muted-foreground ml-1">{balance?.symbol}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            <div className="rounded-lg bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network</span>
                <span className="text-sm font-medium flex items-center">
                  {chain?.hasIcon && (
                    <div
                      className="mr-1.5"
                      style={{
                        background: chain.iconBackground,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        display: 'inline-block',
                      }}
                    >
                      {chain.iconUrl && (
                        <img
                          alt={chain.name ?? 'Chain icon'}
                          src={chain.iconUrl}
                          style={{ width: 12, height: 12 }}
                        />
                      )}
                    </div>
                  )}
                  {chain?.name}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <div className="w-full grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={openExplorer}
                disabled={!chain?.blockExplorers?.default?.url}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Explorer
              </Button>
              
              <Button
                variant="destructive"
                className="flex items-center"
                onClick={handleDisconnect}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}