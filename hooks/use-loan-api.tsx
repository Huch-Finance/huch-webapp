"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useSPLTransactions } from "@/hooks/use-spl-transactions"
import { SteamItem } from "@/hooks/use-steam-inventory"

interface CreateLoanParams {
  items: SteamItem[]
  amount: number
  duration: number
  skinId: string
  value: number
  tradeId?: string
}

interface LoanResponse {
  success: boolean
  message: string
  borrowId?: string
  tradeId?: string
  tradeUrl?: string
}

interface TradeItem {
  assetId: string
  marketHashName: string
  iconUrl: string
  value: number
}

interface TradeData {
  id: string
  items: TradeItem[]
  totalValue: number
  status: string
  createdAt: string
  completedAt?: string
}

interface BorrowRecord {
  id: string
  userId: string
  walletAddress: string
  borrowId: string
  vaultAddress: string
  amount: number
  tokenMint: string
  status: 'pending' | 'active' | 'liquidated'
  tradeId: string
  tradeStatus: string
  createdAt: string
  updatedAt: string
  trade?: TradeData | null
}

interface RepayResponse {
  success: boolean
  message: string
  signature?: string
}

export function useLoanApi() {
  const { profile } = useAuth()
  const { repayLoan: splRepayLoan } = useSPLTransactions()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createLoan = async (params: CreateLoanParams): Promise<LoanResponse | null> => {
    if (!profile?.id || !profile?.steamId || !profile?.wallet) {
      setError("User not authenticated or missing required data")
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3333/solana/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profile.id,
          steamId: profile.steamId,
          items: params.items,
          amount: params.amount,
          duration: params.duration,
          skinId: params.skinId,
          value: params.value,
          userWallet: profile.wallet
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create loan")
        return null
      }

      const data: LoanResponse = await response.json()
      return data
    } catch (err) {
      setError("Network error when creating loan")
      console.error("Error creating loan:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }


  const getUserLoans = async (): Promise<BorrowRecord[] | null> => {
    if (!profile?.id) {
      setError("User not authenticated")
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3333/api/user/borrows`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Privy-Id': profile.id
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch loans")
        return null
      }

      const data = await response.json()
      return data.borrows || []
    } catch (err) {
      setError("Network error when fetching loans")
      console.error("Error fetching loans:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const getBorrowBlockchainState = async (borrowId: string): Promise<any | null> => {
    if (!profile?.id) {
      console.log("User not authenticated")
      return null
    }

    try {
      const response = await fetch(`http://localhost:3333/solana/borrow-state/${borrowId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Privy-Id': profile.id
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log(`Failed to fetch blockchain state for ${borrowId}:`, errorData.error)
        return null
      }

      const data = await response.json()
      return data.blockchainData || null
    } catch (err) {
      console.log("Network error when fetching blockchain state:", err)
      return null
    }
  }

  const getBorrowDetails = async (borrowId: string): Promise<any | null> => {
    if (!profile?.id) {
      setError("User not authenticated")
      return null
    }

    try {
      const response = await fetch(`http://localhost:3333/solana/borrow-details/${borrowId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Privy-Id': profile.id
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch borrow details")
        return null
      }

      const data = await response.json()
      return data.borrow || null
    } catch (err) {
      setError("Network error when fetching borrow details")
      console.error("Error fetching borrow details:", err)
      return null
    }
  }

  const repayPartialLoan = async (amount: number, loanId?: string): Promise<RepayResponse | null> => {
    if (!profile?.id || !profile?.wallet) {
      setError("User not authenticated or missing wallet")
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use SPL transaction hook for actual token transfer
      const result = await splRepayLoan(amount, loanId || 'unknown')
      
      if (result.success) {
        return {
          success: true,
          message: `Successfully repaid ${amount} USDC`,
          signature: result.signature
        }
      } else {
        setError(result.error || "Failed to repay loan")
        return null
      }
    } catch (err: any) {
      setError("Error when repaying loan: " + err.message)
      console.error("Error repaying loan:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createLoan,
    getUserLoans,
    getBorrowDetails,
    getBorrowBlockchainState,
    repayPartialLoan,
    isLoading,
    error
  }
}