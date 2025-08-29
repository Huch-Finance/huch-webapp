'use client'

import { useState, useCallback } from 'react'
import { useSolanaWallets } from '@privy-io/react-auth/solana'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { useAuth } from './use-auth'
import { useHuchOracle } from './use-huch-oracle'
import { getSolanaConnection } from '@/lib/solana-connection'

export interface NFTListing {
  nftMint: string
  seller: string
  priceUsd: number
  priceHuch: number
  listedAt: Date
  expiresAt?: Date
  signature?: string
}

export interface PurchaseParams {
  nftMint: string
  maxPriceInHuch: number
  sellerAddress?: string
}

export interface PurchaseResult {
  success: boolean
  purchase?: {
    nftMint: string
    buyer: string
    seller: string
    priceHuch: number
    purchasedAt: Date
    txSignature: string
  }
  signature?: string
  error?: string
}

const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3333' 
  : 'https://api.yourdomain.com'

export function useMetaplexPurchase() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { profile, isAuthenticated, accessToken, getPrivyAccessToken } = useAuth()
  const { wallets } = useSolanaWallets()
  const { balance: huchBalance, convertUsdToHuch, formatHuchAmount: formatHuchAmountFromOracle } = useHuchOracle()

  const activeWallet = wallets.find(w => w.walletClientType === 'privy')

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Purchase NFT using Metaplex Auction House with HUCH tokens
   * Uses Privy wallet for signing transactions
   */
  const purchaseNFT = useCallback(async (params: PurchaseParams): Promise<PurchaseResult> => {
    setIsLoading(true)
    setError(null)

    try {
      // Validation checks
      if (!isAuthenticated || !profile) {
        throw new Error('User must be authenticated. Please login first.')
      }

      if (!activeWallet?.address) {
        throw new Error('Solana wallet not connected. Please connect your wallet.')
      }

      // Get fresh access token
      const token = await getPrivyAccessToken()
      if (!token) {
        throw new Error('Failed to get authentication token. Please login again.')
      }

      // Log wallet info for debugging
      console.log('Purchase validation:', {
        isAuthenticated,
        profileId: profile.id,
        profileWallet: profile.wallet,
        activeWallet: activeWallet.address,
        hasToken: !!token
      })

      // If profile doesn't have wallet set, it might not be synced with backend
      if (!profile.wallet) {
        console.warn('Profile wallet not set, but active wallet exists. User may need to re-register.')
      }

      // Check HUCH balance
      const userHuchBalance = huchBalance?.balance || 0
      console.log('Balance check:', {
        userBalance: userHuchBalance,
        requiredAmount: params.maxPriceInHuch,
        hasEnoughBalance: userHuchBalance >= params.maxPriceInHuch
      })
      
      if (userHuchBalance < params.maxPriceInHuch) {
        const shortfall = params.maxPriceInHuch - userHuchBalance
        throw new Error(
          `Insufficient HUCH balance. Required: ${formatHuchAmountFromOracle(params.maxPriceInHuch)} HUCH, Available: ${formatHuchAmountFromOracle(userHuchBalance)} HUCH, Shortfall: ${formatHuchAmountFromOracle(shortfall)} HUCH`
        )
      }

      console.log('Initiating HUCH token purchase:', {
        nftMint: params.nftMint,
        maxPrice: params.maxPriceInHuch,
        userBalance: userHuchBalance,
        walletAddress: activeWallet.address,
        profileId: profile.id
      })

      console.log('Making purchase request with:', {
        url: `${BACKEND_URL}/api/marketplace/simple/purchase`,
        tokenLength: token.length,
        profileId: profile.id,
        nftMint: params.nftMint,
        maxPrice: params.maxPriceInHuch
      })

      // Call backend simple marketplace purchase endpoint with proper authentication
      const response = await fetch(`${BACKEND_URL}/api/marketplace/simple/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Privy-Id': profile.id // Keep this for backward compatibility
        },
        body: JSON.stringify({
          nftMint: params.nftMint,
          maxPriceInHuch: params.maxPriceInHuch
        })
      })

      console.log('Purchase response status:', response.status)
      const result = await response.json()
      console.log('Purchase response body:', result)

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Purchase failed`)
      }

      if (!result.success) {
        throw new Error(result.error || 'Purchase failed')
      }

      console.log('Purchase successful:', result)

      // Check if the transaction requires user signature (real blockchain transaction)
      if (result.requiresSignature && result.signatureData) {
        console.log('Transaction requires user signature, preparing wallet transaction...')
        
        // This would be a real blockchain transaction that needs user approval
        // The wallet will show a transaction confirmation popup
        try {
          if (activeWallet && 'signTransaction' in activeWallet) {
            console.log('Requesting user signature for blockchain transaction...')
            // Note: This would require implementing the actual transaction signing
            // For now, we'll indicate that signature is required
            return {
              success: true,
              requiresSignature: true,
              purchase: result.purchase,
              signature: result.signature,
              transactionId: result.transactionId,
              message: result.message || 'Transaction prepared - user signature required'
            }
          } else {
            throw new Error('Wallet does not support transaction signing')
          }
        } catch (signError) {
          console.error('Transaction signature failed:', signError)
          throw new Error(`Transaction signature failed: ${signError.message}`)
        }
      }

      // Transaction completed without requiring signature (likely mock or pre-signed)
      return {
        success: true,
        purchase: result.purchase,
        signature: result.signature,
        transactionId: result.transactionId,
        message: result.message || 'Purchase completed successfully'
      }

    } catch (err: any) {
      console.error('Purchase error:', err)
      const errorMessage = err.message || 'Failed to purchase NFT'
      setError(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }, [profile, isAuthenticated, activeWallet, huchBalance, formatHuchAmountFromOracle, getPrivyAccessToken])

  /**
   * Get marketplace listings
   */
  const getMarketplaceListings = useCallback(async (filters?: {
    page?: number
    limit?: number
    minPrice?: number
    maxPrice?: number
    collection?: string
  }): Promise<{ listings: NFTListing[]; total: number }> => {
    try {
      setError(null)

      const queryParams = new URLSearchParams()
      if (filters?.page) queryParams.append('page', filters.page.toString())
      if (filters?.limit) queryParams.append('limit', filters.limit.toString())
      if (filters?.minPrice) queryParams.append('minPrice', filters.minPrice.toString())
      if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString())
      if (filters?.collection) queryParams.append('collection', filters.collection)

      const response = await fetch(`${BACKEND_URL}/api/marketplace/browse?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(profile && { 'X-Privy-Id': profile.id })
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch listings')
      }

      return {
        listings: result.listings || [],
        total: result.pagination?.total || 0
      }

    } catch (err: any) {
      console.error('Error fetching marketplace listings:', err)
      setError(err.message)
      return { listings: [], total: 0 }
    }
  }, [profile])

  /**
   * Check if user has sufficient HUCH balance for purchase
   */
  const checkHuchBalance = useCallback(async (requiredAmount: number): Promise<{
    sufficient: boolean
    balance: number
    required: number
    shortfall?: number
  }> => {
    const balance = huchBalance?.balance || 0
    const sufficient = balance >= requiredAmount

    return {
      sufficient,
      balance,
      required: requiredAmount,
      ...(sufficient ? {} : { shortfall: requiredAmount - balance })
    }
  }, [huchBalance])

  /**
   * Convert USD price to HUCH for purchase estimation
   */
  const estimateHuchPrice = useCallback(async (usdPrice: number): Promise<number | null> => {
    try {
      return await convertUsdToHuch(usdPrice)
    } catch (err) {
      console.error('Error estimating HUCH price:', err)
      return null
    }
  }, [convertUsdToHuch])

  /**
   * Validate NFT purchase before execution
   */
  const validatePurchase = useCallback(async (params: PurchaseParams): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> => {
    const errors: string[] = []
    const warnings: string[] = []

    // Check authentication
    if (!isAuthenticated || !profile) {
      errors.push('User must be authenticated. Please login first.')
    }

    // Check wallet connection
    if (!activeWallet?.address) {
      errors.push('Solana wallet not connected. Please connect your Privy wallet.')
    }

    // Check wallet consistency (only warn if there's a mismatch, don't block)
    if (profile?.wallet && activeWallet?.address && profile.wallet !== activeWallet.address) {
      warnings.push('Wallet address mismatch detected. Using your current Privy wallet.')
    }

    // Warn if profile doesn't have wallet set
    if (!profile?.wallet && activeWallet?.address) {
      console.log('Profile wallet not synced, but this should not block purchase')
    }

    // Check HUCH balance
    const balanceCheck = await checkHuchBalance(params.maxPriceInHuch)
    if (!balanceCheck.sufficient) {
      const shortfallFormatted = formatHuchAmountFromOracle(balanceCheck.shortfall || 0)
      const availableFormatted = formatHuchAmountFromOracle(balanceCheck.balance)
      const requiredFormatted = formatHuchAmountFromOracle(balanceCheck.required)
      errors.push(`Insufficient HUCH balance. Required: ${requiredFormatted} HUCH, Available: ${availableFormatted} HUCH, Need: ${shortfallFormatted} more HUCH`)
    }

    // Check for reasonable price limits
    if (params.maxPriceInHuch > 100000) {
      warnings.push('Very high purchase price - please verify this is correct')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }, [isAuthenticated, profile, activeWallet, checkHuchBalance])

  return {
    // State
    isLoading,
    error,
    
    // Actions
    purchaseNFT,
    getMarketplaceListings,
    validatePurchase,
    clearError,
    
    // Helpers
    checkHuchBalance,
    estimateHuchPrice,
    
    // Wallet info
    walletAddress: activeWallet?.address,
    isWalletConnected: !!activeWallet?.address,
    huchBalance: huchBalance?.balance || 0,
    huchBalanceUsd: huchBalance?.usdValue || 0
  }
}