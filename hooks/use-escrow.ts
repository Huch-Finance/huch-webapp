'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './use-auth'

export interface EscrowListing {
  nftMintAddress: string
  sellerAddress: string
  priceInHuch: string
  escrowAddress: string
  isActive: boolean
}

export interface EscrowPurchaseParams {
  nftMintAddress: string
  sellerAddress: string
  buyerAddress: string
}

export interface EscrowResult {
  success: boolean
  error?: string
  data?: any
}

const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3333' 
  : 'https://api.yourdomain.com'

export function useEscrow() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Get all active escrow listings
  const getActiveListings = useCallback(async (): Promise<EscrowListing[]> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${BACKEND_URL}/api/escrow/listings`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch listings')
      }

      return result.data.listings || []

    } catch (err: any) {
      console.error('Error fetching escrow listings:', err)
      setError(err.message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get details for a specific listing
  const getListingDetails = useCallback(async (nftMintAddress: string): Promise<EscrowListing | null> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${BACKEND_URL}/api/escrow/listing/${nftMintAddress}`)
      const result = await response.json()

      if (!result.success) {
        if (response.status === 404) {
          return null // Not found is not an error
        }
        throw new Error(result.error || 'Failed to fetch listing details')
      }

      return result.data

    } catch (err: any) {
      console.error('Error fetching listing details:', err)
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Purchase an NFT using HUCH tokens
  const purchaseNFT = useCallback(async (params: EscrowPurchaseParams): Promise<EscrowResult> => {
    try {
      setIsLoading(true)
      setError(null)

      if (!user) {
        throw new Error('User must be authenticated to purchase NFTs')
      }

      const response = await fetch(`${BACKEND_URL}/api/escrow/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Privy-Id': user.id
        },
        body: JSON.stringify(params)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to purchase NFT')
      }

      return {
        success: true,
        data: result.data
      }

    } catch (err: any) {
      console.error('Error purchasing NFT:', err)
      const error = err.message
      setError(error)
      return {
        success: false,
        error
      }
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Get user's HUCH token balance
  const getUserBalance = useCallback(async (userAddress?: string): Promise<number> => {
    try {
      if (!userAddress && !user?.wallet?.address) {
        throw new Error('User address is required')
      }

      const address = userAddress || user?.wallet?.address!

      const response = await fetch(`${BACKEND_URL}/api/escrow/balance/${address}`, {
        headers: user ? {
          'X-Privy-Id': user.id
        } : {}
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch balance')
      }

      return result.data.huchBalance || 0

    } catch (err: any) {
      console.error('Error fetching user balance:', err)
      setError(err.message)
      return 0
    }
  }, [user])

  // Check if an NFT is currently listed in escrow
  const checkListingStatus = useCallback(async (nftMintAddress: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/escrow/check/${nftMintAddress}`)
      const result = await response.json()

      if (!result.success) {
        return false
      }

      return result.data.isListed || false

    } catch (err: any) {
      console.error('Error checking listing status:', err)
      return false
    }
  }, [])

  // Get vault information
  const getVaultInfo = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/escrow/vault`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch vault info')
      }

      return result.data

    } catch (err: any) {
      console.error('Error fetching vault info:', err)
      setError(err.message)
      return null
    }
  }, [])

  // Helper function to convert USD price to HUCH tokens (simplified conversion)
  const convertUsdToHuch = useCallback((usdPrice: number): number => {
    // Simple conversion: 1 USD = 10 HUCH (you can adjust this ratio)
    return usdPrice * 10
  }, [])

  // Helper function to format HUCH amount for display
  const formatHuchAmount = useCallback((amount: number): string => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }, [])

  return {
    // State
    isLoading,
    error,
    
    // Actions
    getActiveListings,
    getListingDetails,
    purchaseNFT,
    getUserBalance,
    checkListingStatus,
    getVaultInfo,
    clearError,
    
    // Helpers
    convertUsdToHuch,
    formatHuchAmount
  }
}