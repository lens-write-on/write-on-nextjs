import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to truncate Ethereum addresses
export const truncateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatNiceNumber = (num: number | string) => {
  if (typeof num === "string") {
    num = parseFloat(num);
  }

  num = num.toFixed(4);

  return num.toString();
};

/**
 * Checks if a campaign has ended by comparing deadline to current date
 * @param deadline - Campaign deadline string in various formats (ISO or human-readable)
 * @returns boolean - True if campaign has ended, false otherwise
 */
export const isCampaignEnded = (deadline: string): boolean => {
  console.log(new Date(deadline), new Date(), deadline);
  if (!deadline) return false;
  
  // Parse the deadline string into a Date object - handles both format types
  let deadlineDate: Date;
  
  // Handle different date formats
  if (deadline.includes('-')) {
    // For ISO format like "2025-04-30T13:00:00.000Z"
    deadlineDate = new Date(deadline);
  } else {
    // For human-readable format like "May 1, 2025"
    deadlineDate = new Date(deadline);
  }
  
  const now = new Date();
  return deadlineDate < now;
};

// Function to check and parse special message format
export const processMessageText = (messageText: string) => {
  // Regular expression to match the specific object format
  const objectRegex =
    /\{\{fromChainId: '(\d+)', toChainId: '(\d+)', amount: '(\d+(?:\.\d+)?)', targetAddress: '([^']*)'\}\}/;

  const match = messageText.match(objectRegex);

  if (match) {
    console.log("Full Match:", match[0]);
    console.log("Match Details:", {
      fromChainId: match[1],
      toChainId: match[2],
      amount: match[3],
      targetAddress: match[4],
    });

    const parsedObject = {
      fromChainId: match[1],
      toChainId: match[2],
      amount: match[3],
      targetAddress: match[4] === "null" ? null : match[4],
    };

    // Save parsedObject to localStorage if available (browser environment check)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("bridging_via_ai", JSON.stringify(parsedObject));
        console.log("Saved to localStorage with key: bridging_via_ai");
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
      }
    }

    console.log("Parsed Object:", parsedObject);

    // Return the text before the matched object
    return messageText.split(match[0])[0].trim();
  }

  // If not a special format, return the original text
  return messageText;
};
