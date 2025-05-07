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
import { Drawer, DrawerClose, DrawerContent, DrawerOverlay, DrawerTrigger, DrawerPortal } from '@/components/ui/drawer';
import { truncateAddress } from '@/lib/utils';
import { useDisconnect, useAccount, useBalance } from 'wagmi';
import { Copy, ExternalLink, LogOut, Check, Wallet, UserCog, FileText, Users } from 'lucide-react';
import { fetchBalance } from '@/lib/web3-call';
import { useDrawer } from '@/hooks/use-drawer';
import { useUser } from '@/hooks/use-user';
import { getChainById } from '@/lib/chains';
import Link from 'next/link';
import chainList from '@/lib/chains';

export default function AccountDrawer() {
  const { isDrawerOpen, closeDrawer, navigationLinks } = useDrawer();
  const { userData } = useUser();
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(null);
  const { disconnect } = useDisconnect();
  const { address, chainId, isConnected } = useAccount();

  // Navigation links with icons for the drawer
  const navLinksWithIcons = [
    { name: 'Edit Profile', href: '/apps/account/profile', icon: <UserCog className="h-5 w-5" /> },
    { name: 'My Campaigns', href: '/apps/account/my-campaigns', icon: <FileText className="h-5 w-5" /> },
    { name: 'Submission', href: '/apps/account/submission', icon: <Users className="h-5 w-5" /> },
  ];

  // Fetch the balance when address or chainId changes
  useEffect(() => {
    const getBalance = async () => {
      if (address && chainId) {
        try {
          const result = await fetchBalance(address, chainId);
          setBalance({
            formatted: result.toString(),
            symbol: chainList?.find(c => c.id === chainId)?.nativeCurrency?.symbol || 'ETH'
          });
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        }
      }
    };

    if (isConnected && address) {
      getBalance();
    }
    console.log(` ................ > chainId: ${chainId}, address: ${address}, isConnected: ${isConnected}`);
  }, [address, chainId, isConnected, chainList]);

  // Get chain info from the connector
  const chain = getChainById(chainId);


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
    closeDrawer();
  };

  // Get ENS info or displayName from account info
  const displayName = userData?.username || userData?.name || (address ? truncateAddress(address) : '');
  
  // Early returns after all hooks have been called
  if (!isConnected) return null; // If not connected, don't show the drawer
  const rightDrawerStyles = {
    overlay: 'fixed inset-0 bg-black/5 z-50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    content: 'fixed top-0 h-full z-50 sm:w-[380px] md:w-[624px] bg-[#060606] border-l border-gray-800/20 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300'
  };

  return (
    <Drawer 
      open={isDrawerOpen} 
      onOpenChange={closeDrawer} 
      direction="right"
      modal={true}
    >
      <DrawerPortal>
        <DrawerOverlay className={rightDrawerStyles.overlay} />
        <DrawerContent 
          className={rightDrawerStyles.content}
          style={{
            left: 'auto',
            right: '0px',
            transition: 'right 0.3s ease-in-out',
          }}
          title=""
        >
          <div className="px-4 py-5 overflow-y-auto h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Account</h3>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                  ✕
                </Button>
              </DrawerClose>
            </div>
            
            {/* Account section */}
            <Card className="bg-[#060606]/60 border-gray-800/40 backdrop-blur-lg shadow-lg mb-6">
              <CardHeader className="flex flex-col items-center pb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-3 overflow-hidden">
                  {userData?.image ? (
                    <img 
                      src={'/api'+userData.image} 
                      alt={userData?.username || userData?.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Wallet className="h-8 w-8" />
                  )}
                </div>
                
                <CardTitle className="text-xl mb-0.5 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {displayName}
                </CardTitle>
                
                <div className="flex items-center text-sm text-gray-400">
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
                
                <div className="w-full mt-4 mb-2 flex justify-center">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full py-2 px-4 text-center">
                    <span className="font-medium text-emerald-400">{balance?.formatted && Number(balance.formatted).toFixed(4)}</span>
                    <span className="text-gray-400 ml-1">{balance?.symbol}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="rounded-lg bg-black/30 backdrop-blur-sm p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Network</span>
                    <span className="text-sm font-medium flex items-center text-cyan-400">
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
                    className="flex items-center rounded-full border-gray-800/40 hover:bg-gray-800/20"
                    onClick={openExplorer}
                    disabled={!chain?.blockExplorers?.default?.url}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Explorer
                  </Button>
                  
                  <Button
                    variant="destructive"
                    className="flex items-center rounded-full"
                    onClick={handleDisconnect}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            {/* Navigation links section */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-400 mb-2 px-2">Navigation</h4>
              {/* Use either navigationLinks from context or the local navLinksWithIcons */}
              {(navigationLinks || navLinksWithIcons).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeDrawer}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-gray-800/20"
                >
                  <span className="text-gray-400">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
            
            {/* Footer section */}
            <div className="mt-10 border-t border-gray-800/30 pt-4">
              <p className="text-xs text-gray-500 text-center">
                Write-to-Earn Platform &copy; 2025
              </p>
            </div>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}