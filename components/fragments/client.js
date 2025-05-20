'use client';
import { PublicClient, mainnet } from "@lens-protocol/client";
import {fragments} from "./index.js";
import {createWalletClient, custom } from "viem";
import { chains } from "@lens-chain/sdk/viem";
import storage from '@/lib/lens-storage.js';

// Create a singleton instance of the Lens client to prevent duplicate fragment registration
let lensClient = null;
let wwalletClient = null;

// Export a function to get the Lens client instance
export const LENS_CLIENT = (() => {
  if (!lensClient) {
    console.log("Creating new Lens client instance");
    try {
      lensClient = PublicClient.create({
        environment: mainnet,
        fragments: fragments || [], // Ensure fragments is defined or use empty array,
        storage
      });
    } catch (error) {
      console.error("Error creating Lens client:", error);
      // Create client without custom fragments as fallback
      lensClient = PublicClient.create({
        environment: mainnet,
        storage
      });
    }
  }
  return lensClient;
})();

export const WALLET_CLIENT = ((address) => {
  if (!wwalletClient) {
    console.log("Creating new Lens client instance");
    try {
      wwalletClient = createWalletClient({
        account: address,
        chain: chains.mainnet,
        transport: custom(window?.ethereum)
      });
    } catch (error) {
      console.error("Error creating Lens client:", error);
      // Create client without custom fragments as fallback
      wwalletClient = PublicClient.create({
        environment: mainnet
      });
    }
  }
  return wwalletClient;
});