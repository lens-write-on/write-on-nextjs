import { PublicClient, testnet } from "@lens-protocol/client";
import {fragments} from "./index.js";

// Create a singleton instance of the Lens client to prevent duplicate fragment registration
let lensClient = null;

// Export a function to get the Lens client instance
export const LENS_CLIENT = (() => {
  if (!lensClient) {
    console.log("Creating new Lens client instance");
    try {
      lensClient = PublicClient.create({
        environment: testnet,
        fragments: fragments || [] // Ensure fragments is defined or use empty array
      });
    } catch (error) {
      console.error("Error creating Lens client:", error);
      // Create client without custom fragments as fallback
      lensClient = PublicClient.create({
        environment: testnet
      });
    }
  }
  return lensClient;
})();