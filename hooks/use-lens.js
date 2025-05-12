"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { LENS_CLIENT } from "@/components/fragments/client";
import signer from "@/components/fragments/signer";
import { signMessageWith } from "@lens-protocol/client/viem";
import { fetchAccount } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";

// Create a context to hold the Lens authentication state
const LensContext = createContext(null);

const CheckLensAccountExists = async (address, client) => {
  const result = await fetchAccount(client, {
    address: evmAddress(address),
  });
  return result;
};

export function LensProvider({ children }) {
  const [sessionClient, setSessionClient] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { address, isConnected } = useAccount();
  const [lensAccountExist, setLensAccountExist] = useState(false);

  // Authenticate with Lens when connected and signer is available
  useEffect(() => {
    // This flag prevents the effect from running twice in development mode (React.StrictMode)
    const isMounted = { current: true };

    // Skip if already authenticated or currently authenticating
    if (sessionClient || isAuthenticating) return;

    const authenticateWithLens = async () => {
      // Only proceed if the component is still mounted
      if (!isMounted.current) return;

      if (isConnected && address) {
        try {
          // check account existence
          const accountExists = await CheckLensAccountExists(
            address,
            LENS_CLIENT
          );
          setLensAccountExist(!!accountExists?.value?.address);
          console.log("Lens account exists:",!!accountExists?.value?.address);

          setIsAuthenticating(true);
          console.log("Authenticating with Lens...");
          const authenticated = await LENS_CLIENT.login({
            onboardingUser: {
              app: process.env.NEXT_PUBLIC_APP_ADDRESS,
              wallet: signer.address,
            },
            signMessage: signMessageWith(signer),
          });

          if (authenticated.isErr()) {
            setAuthError(authenticated.error);
            console.error(authenticated.error);
            setIsAuthenticating(false);
            return;
          }

          console.log("authenticated", authenticated);
          setSessionClient(authenticated.value);
          setIsAuthenticating(false);
        } catch (error) {
          console.error("Failed to authenticate with Lens:", error);
          setAuthError(error);
          setIsAuthenticating(false);
        }
      }
    };

    authenticateWithLens();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, [isConnected, address, sessionClient, isAuthenticating]);

  // Context value provided to consumers
  const value = {
    lensClient: LENS_CLIENT,
    sessionClient,
    authError,
    isAuthenticating,
    lensAccountExist,
  };

  return <LensContext.Provider value={value}>{children}</LensContext.Provider>;
}

// Hook to use the Lens context
export function useLens() {
  const context = useContext(LensContext);
  if (context === null) {
    throw new Error("useLens must be used within a LensProvider");
  }
  return context;
}

// Export the Lens client for direct access
export { LENS_CLIENT };
