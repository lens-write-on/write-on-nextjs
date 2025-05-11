"use client";

import React, {useEffect} from "react";

import { WagmiProvider, useSwitchChain, useAccount, http, createConfig } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import chainList from "@/lib/chains.js";
import { Toaster } from "@/components/ui/toaster";
import { ModalProvider } from "@/hooks/use-modal";
import { DrawerProvider } from "@/hooks/use-drawer";
import { UserProvider } from "@/hooks/use-user";
import { LensProvider } from "@/hooks/use-lens";
import AccountDrawer from "@/components/wallet/AccountDrawer";
import { mainnet } from "wagmi/chains";

import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const transports = () => {
  let transport = {};
  chainList.forEach((chain) => {
    transport[chain.id] = http(chain.rpcUrls.default.http[0])
  });
  return transport;
};

const config = createConfig(getDefaultConfig({
  autoConnect: true,
  appName: "WriteOn",
  chains: chainList,
  // chains: [mainnet],
  transports: {...transports()},
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  ssr: true, // Add this line to fix the error
}));
console.log(config);

const AutoSwitchNetwork = () => {
  const { switchChain } = useSwitchChain();
  const {isConnected, chainId} = useAccount();

  const allChainsIds = chainList.map((chain) => chain.id);

  useEffect(() => {
    if (isConnected) {
      if (!allChainsIds.includes(chainId)) {
        console.log(`switching to ${chainList[0].name}`);
        switchChain(chainList[0].id); // pharos
      }
      
    }
  }, [isConnected]);

  return null;
};

/**
 * Providers component to wrap the application with all necessary providers
 * This is where theme providers, auth providers, state providers, etc. can be configured
 *
 * @param {object} props - The component props
 * @param {React.ReactNode} props.children - The content to be wrapped by providers
 * @returns {React.ReactNode} The providers wrapping the children
 */
export default function Providers({ children }) {
  const queryClient = new QueryClient();
  return (
    <>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider
            initialChainId={chainList[0].id}
            showRecentTransactions={true}
          >
            <DrawerProvider>
              <ModalProvider>
                <UserProvider>
                  <LensProvider>
                    <AutoSwitchNetwork />
                    {children}
                    <AccountDrawer />
                    <Toaster />
                  </LensProvider>
                </UserProvider>
              </ModalProvider>
            </DrawerProvider>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
