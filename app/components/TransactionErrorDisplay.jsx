'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

/**
 * Component to display blockchain transaction errors with retry functionality
 * 
 * @param {object} props - Component props
 * @param {object} props.error - Error object from the blockchain transaction
 * @param {function} props.onRetry - Function to call when retry button is clicked
 */
const TransactionErrorDisplay = ({ error, onRetry }) => {
  // Extract the most user-friendly error message
  const getErrorMessage = () => {
    if (!error) return "Unknown error occurred";
    
    // Handle different error object structures
    if (typeof error === 'object') {
      if (error.shortMessage) return error.shortMessage;
      if (error.message) {
        // Clean up common Web3 error messages
        let message = error.message;
        if (message.includes("execution reverted")) {
          const revertReason = message.match(/execution reverted: (.*?)(?:"|$)/);
          return revertReason ? revertReason[1] : "Transaction reverted by smart contract";
        }
        // Handle user rejected errors
        if (message.includes("user rejected") || message.includes("rejected transaction")) {
          return "You rejected the transaction request";
        }
        return message;
      }
    }
    
    return String(error);
  };

  // Format more detailed error information for developers
  const getTechnicalDetails = () => {
    if (typeof error !== 'object' || !error) return null;
    
    const details = [];
    if (error.code) details.push(`Error Code: ${error.code}`);
    if (error.data) details.push(`Error Data: ${JSON.stringify(error.data)}`);
    
    return details.length > 0 ? details.join(' | ') : null;
  };

  const errorMessage = getErrorMessage();
  const technicalDetails = getTechnicalDetails();

  return (
    <Alert variant="destructive" className="bg-red-950/30 border-red-800/50 my-4">
      <AlertTitle className="text-red-400">Transaction Failed</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p>{errorMessage}</p>
        {technicalDetails && (
          <p className="text-xs opacity-70 font-mono">{technicalDetails}</p>
        )}
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="w-fit self-end bg-red-950/50 border-red-700/30 hover:bg-red-900/50"
          >
            <RefreshCcw className="mr-2 h-3 w-3" />
            Retry Transaction
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default TransactionErrorDisplay;