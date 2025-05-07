'use client';
import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import contracts from '@/lib/contracts';

const MintBlog = () => {
  const [isMinting, setIsMinting] = useState(false);
  const [tokenBalance, setTokenBalance] = useState('0');
  
  const { address, isConnected, chainId } = useAccount();
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: chainId && contracts[chainId]?.blog?.address,
    abi: contracts[chainId]?.blog?.abi,
    functionName: 'balanceOf',
    args: [address],
    watch: true,
    enabled: isConnected && !!address && !!chainId && !!contracts[chainId]?.blog?.address,
  });

  // Update token balance when it changes
  useEffect(() => {
    if (balance && balance !== undefined) {
      setTokenBalance(formatEther(balance));
    }
  }, [balance, balanceLoading]);

  // Handle transaction confirmation
  useEffect(() => {
    if(isSuccess && hash) {
      setIsMinting(false);
      toast({
        title: "Mint successful!",
        description: "You have successfully minted 1000 $BLOG tokens.",
        variant: "success"
      });
    }
  }, [isLoading, isSuccess, hash]);

  const handleMint = async () => {
    try {
      setIsMinting(true);
      await writeContract({
        address: contracts[chainId].blog.address,
        abi: contracts[chainId].blog.abi,
        functionName: 'mint',
        args: [1000n * 10n ** 18n], // Mint 1000 tokens with 18 decimals
      });
    } catch (error) {
      console.error("Mint error:", error);
      setIsMinting(false);
      toast({
        title: "Mint failed",
        description: error.message || "Failed to mint BLOG tokens",
        variant: "destructive"
      });
    }
  };

  if (!isConnected) return null;

  return (
    <Button 
      onClick={handleMint}
      variant="outline" 
      disabled={isPending || isLoading || isMinting}
      className="flex items-center space-x-2 rounded-full border-emerald-600/40 hover:bg-emerald-600/20 text-emerald-400"
    >
      <Coins className="h-4 w-4 mr-2" />
      {isPending || isLoading || isMinting ? 'Minting...' : 'Mint $BLOG'}
    </Button>
  );
};

export default MintBlog;