'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const SubmissionContext = createContext(null)

export function SubmissionProvider({ campaignId, children, address: userWalletAddress }) {
  const [submissions, setSubmissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUserSubmitted, setIsUserSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/campaigns/submission/list?campaignId=${campaignId}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch submissions')
      }
      
      setSubmissions(result.data)
    } catch (err) {
      console.error("Error fetching submissions:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const checkIsUserSubmitted = async () => {
    if(!userWalletAddress) return false;
    try {
      const response = await fetch(`/api/campaigns/submission/is-user-submitted?campaignId=${campaignId}&address=${userWalletAddress}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to check submission status')
      }
      console.log(result.data)
      setIsUserSubmitted(result.data);
      return result.data
    } catch (err) {
      console.error("Error checking submission status:", err)
      return false
    }
  };

  const refreshSubmissions = () => {
    fetchSubmissions()
  }

  useEffect(() => {
    if (userWalletAddress) {
      checkIsUserSubmitted();
    }
  }, [userWalletAddress]);


  useEffect(() => {
    if (campaignId) {
      fetchSubmissions()
    }
  }, [campaignId]);


  return (
    <SubmissionContext.Provider value={{ 
      submissions, 
      isLoading, 
      error,
      isUserSubmitted,
      checkIsUserSubmitted,
      refreshSubmissions 
    }}>
      {children}
    </SubmissionContext.Provider>
  )
}

export const useSubmissions = () => {
  const context = useContext(SubmissionContext)
  
  if (context === null) {
    throw new Error('useSubmissions must be used within a SubmissionProvider')
  }
  
  return context
}