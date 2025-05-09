'use client'
import { createContext, useState, useEffect, useContext } from 'react'
import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import Campaign from '@/lib/abi/Campaign.json'

// Create context
const RewardStatusContext = createContext(null)

// Hook to use the context
export function useRewardStatus() {
  const context = useContext(RewardStatusContext)
  if (!context) {
    throw new Error('useRewardStatus must be used within a RewardStatusProvider')
  }
  return context
}

// Provider component
export function RewardStatusProvider({ children, campaignAddress }) {
  const [isRewardsDeposited, setIsRewardsDeposited] = useState(false)
  const [totalReward, setTotalReward] = useState("0")

  // Read rewardsDeposited state from contract
  const { data: rewardsDepositedData, refetch: refetchRewardsDeposited } = useReadContract({
    address: campaignAddress,
    abi: Campaign,
    functionName: 'rewardsDeposited',
    watch: true,
  })

  // Read totalReward from contract
  const { data: totalRewardData, refetch: refetchTotalReward } = useReadContract({
    address: campaignAddress,
    abi: Campaign,
    functionName: 'totalReward',
    watch: true,
  })

  // Function to manually update reward status
  const updateRewardStatus = async () => {
    await Promise.all([
      refetchRewardsDeposited(),
      refetchTotalReward()
    ])
  }

  // Update rewardsDeposited and totalReward state when data changes
  useEffect(() => {
    if (rewardsDepositedData !== undefined) {
      setIsRewardsDeposited(rewardsDepositedData)
    }
    if (totalRewardData) {
      setTotalReward(formatEther(totalRewardData))
    }
  }, [rewardsDepositedData, totalRewardData])

  return (
    <RewardStatusContext.Provider value={{ isRewardsDeposited, totalReward, updateRewardStatus }}>
      {children}
    </RewardStatusContext.Provider>
  )
}