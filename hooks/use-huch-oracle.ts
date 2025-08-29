'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'

export interface HuchPrice {
  priceUsd: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  lastUpdated: string
  symbol: string
  mint: string
}

export interface HuchBalance {
  walletAddress: string
  balance: number
  balanceRaw: string
  usdValue: number
  tokenAccount: string
  mint: string
  decimals: number
  symbol: string
  formatted: {
    balance: string
    usdValue: string
  }
}

export interface HuchTokenInfo {
  mint: string
  decimals: number
  supply: string
  name: string
  symbol: string
  currentPrice: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  lastPriceUpdate: string
}

const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3333' 
  : 'https://api.yourdomain.com'

export function useHuchOracle() {
  const [price, setPrice] = useState<HuchPrice | null>(null)
  const [balance, setBalance] = useState<HuchBalance | null>(null)
  const [tokenInfo, setTokenInfo] = useState<HuchTokenInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Get current HUCH price
  const fetchPrice = useCallback(async (): Promise<HuchPrice | null> => {
    try {
      setError(null)
      
      const response = await fetch(`${BACKEND_URL}/api/huch/price`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch HUCH price')
      }

      const priceData = result.data
      setPrice(priceData)
      return priceData

    } catch (err: any) {
      console.error('Error fetching HUCH price:', err)
      setError(err.message)
      return null
    }
  }, [])

  // Get HUCH balance for a specific wallet
  const fetchBalance = useCallback(async (walletAddress?: string): Promise<HuchBalance | null> => {
    try {
      setError(null)
      
      // Priority order: provided address > profile.wallet > user.wallet?.address
      const address = walletAddress || profile?.wallet || user?.wallet?.address
      if (!address) {
        console.log('No wallet address available for balance check')
        return null
      }

      console.log('Fetching HUCH balance for address:', address)
      
      const response = await fetch(`${BACKEND_URL}/api/huch/balance/${address}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Balance API response not ok:', response.status, response.statusText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        console.error('Balance API returned error:', result.error)
        throw new Error(result.error || 'Failed to fetch HUCH balance')
      }

      const balanceData = result.data
      console.log('HUCH balance retrieved successfully:', balanceData)
      setBalance(balanceData)
      return balanceData

    } catch (err: any) {
      console.error('Error fetching HUCH balance:', err)
      
      // Don't set error for network issues, just log them
      if (err.message?.includes('fetch') || err.message?.includes('network')) {
        console.log('Network error fetching balance, will retry later')
      } else {
        setError(`Balance fetch failed: ${err.message}`)
      }
      
      return null
    }
  }, [user, profile])

  // Get HUCH token information
  const fetchTokenInfo = useCallback(async (): Promise<HuchTokenInfo | null> => {
    try {
      setError(null)
      
      const response = await fetch(`${BACKEND_URL}/api/huch/info`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch token info')
      }

      const info = result.data
      setTokenInfo(info)
      return info

    } catch (err: any) {
      console.error('Error fetching HUCH token info:', err)
      setError(err.message)
      return null
    }
  }, [])

  // Convert USD to HUCH tokens
  const convertUsdToHuch = useCallback(async (usdAmount: number): Promise<number | null> => {
    try {
      setError(null)
      
      const response = await fetch(`${BACKEND_URL}/api/huch/convert/usd-to-huch/${usdAmount}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to convert USD to HUCH')
      }

      return result.data.huchAmount

    } catch (err: any) {
      console.error('Error converting USD to HUCH:', err)
      setError(err.message)
      return null
    }
  }, [])

  // Convert HUCH tokens to USD
  const convertHuchToUsd = useCallback(async (huchAmount: number): Promise<number | null> => {
    try {
      setError(null)
      
      const response = await fetch(`${BACKEND_URL}/api/huch/convert/huch-to-usd/${huchAmount}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to convert HUCH to USD')
      }

      return result.data.usdAmount

    } catch (err: any) {
      console.error('Error converting HUCH to USD:', err)
      setError(err.message)
      return null
    }
  }, [])

  // Get multiple wallet balances
  const fetchMultipleBalances = useCallback(async (walletAddresses: string[]): Promise<HuchBalance[]> => {
    try {
      setError(null)
      
      if (walletAddresses.length === 0) {
        return []
      }

      const response = await fetch(`${BACKEND_URL}/api/huch/balances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ wallets: walletAddresses })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch multiple balances')
      }

      return result.data.balances.filter((b: any) => b.success)

    } catch (err: any) {
      console.error('Error fetching multiple balances:', err)
      setError(err.message)
      return []
    }
  }, [])

  // Refresh all data
  const refreshAll = useCallback(async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchPrice(),
        fetchBalance(),
        fetchTokenInfo()
      ])
    } finally {
      setIsLoading(false)
    }
  }, [fetchPrice, fetchBalance, fetchTokenInfo])

  // Auto-refresh price every 5 minutes
  useEffect(() => {
    fetchPrice() // Initial fetch
    
    const interval = setInterval(() => {
      fetchPrice()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchPrice])

  // Auto-fetch balance when wallet changes
  useEffect(() => {
    const walletAddress = profile?.wallet || user?.wallet?.address
    if (walletAddress) {
      fetchBalance()
    }
  }, [profile?.wallet, user?.wallet?.address, fetchBalance])

  // Format HUCH amount for display
  const formatHuchAmount = useCallback((amount: number): string => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }, [])

  // Format USD amount for display
  const formatUsdAmount = useCallback((amount: number): string => {
    return `$${amount.toFixed(2)}`
  }, [])

  // Get price change color
  const getPriceChangeColor = useCallback((change: number): string => {
    if (change > 0) return 'text-green-500'
    if (change < 0) return 'text-red-500'
    return 'text-gray-500'
  }, [])

  // Get price change display
  const getPriceChangeDisplay = useCallback((change: number): string => {
    const prefix = change > 0 ? '+' : ''
    return `${prefix}${change.toFixed(2)}%`
  }, [])

  return {
    // State
    price,
    balance,
    tokenInfo,
    isLoading,
    error,
    
    // Actions
    fetchPrice,
    fetchBalance,
    fetchTokenInfo,
    convertUsdToHuch,
    convertHuchToUsd,
    fetchMultipleBalances,
    refreshAll,
    clearError,
    
    // Helpers
    formatHuchAmount,
    formatUsdAmount,
    getPriceChangeColor,
    getPriceChangeDisplay,
    
    // Constants
    HUCH_MINT: 'B8zW7B8T7ntCiiRYw18jrFu9MBqMZVk9pP7nYyT5iBLV',
    HUCH_DECIMALS: 6
  }
}