"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAccount } from "wagmi";
import { LENS_CLIENT, WALLET_CLIENT } from "@/components/fragments/client";
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
  const [walletcl, setWalletcl] = useState(null);

  if(address && !walletcl) {
    const wc = WALLET_CLIENT(address);
    setWalletcl(wc);
    console.log(`set walletcl`, wc);
  }

  // Move authenticateWithLens to a useCallback to avoid recreation and allow external calls
  const authenticateWithLens = useCallback(async () => {
    // Don't attempt authentication if already in progress or if we already have a session
    if (isAuthenticating || sessionClient || !isConnected || !address || !walletcl) {
      return;
    }

    try {
      setIsAuthenticating(true);
      setAuthError(null);

      // check account existence
      const accountExists = await CheckLensAccountExists(
        address,
        LENS_CLIENT
      );
      setLensAccountExist(!!accountExists?.value?.address);
      console.log("Lens account exists:", !!accountExists?.value?.address);
      console.log(`walletcl`,walletcl);

      console.log("Authenticating with Lens...");
      const authenticated = await LENS_CLIENT.login({
        onboardingUser: {
          app: process.env.NEXT_PUBLIC_APP_ADDRESS,
          wallet: signer.address,
        },
        signMessage: signMessageWith(signer)
      });

      if (authenticated.isErr()) {
        setAuthError(authenticated.error);
        console.error(authenticated.error);
        setIsAuthenticating(false);
        return;
      }

      console.log("authenticated", authenticated);
      console.log(`sessionClient`, authenticated.value);
      setSessionClient(authenticated.value);
    } catch (error) {
      console.error("Failed to authenticate with Lens:", error);
      setAuthError(error);
    } finally {
      setIsAuthenticating(false);
    }
  }, [isConnected, address, sessionClient, isAuthenticating, walletcl]);

  // Attempt authentication only once on component mount when conditions are right
  useEffect(() => {
    // Skip if no wallet connection or already handling auth
    if (!isConnected || !address || sessionClient || isAuthenticating) return;

    const initialAuth = async () => {
      await authenticateWithLens();
    };

    initialAuth();
  }, [isConnected, address]);

  // Context value provided to consumers
  const value = {
    lensClient: LENS_CLIENT,
    sessionClient,
    authError,
    isAuthenticating,
    lensAccountExist,
    authenticate: authenticateWithLens,
    WalletClient: walletcl // Expose authenticate function to consumers
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
export { LENS_CLIENT, WALLET_CLIENT };
