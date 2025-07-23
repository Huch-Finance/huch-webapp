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
  borrowId: string
  signature: string
  message: string
}

interface RepayResponse {
  success: boolean
  message: string
  signature?: string
}

interface BorrowRecord {
  id: string
  userId: string
  steamId: string
  items: SteamItem[]
  amount: number
  totalAmountToRepay: number
  duration: number
  status: string
  createdAt: string
  updatedAt: string
  tradeId?: string
  blockchainSignature?: string
}

// Interest rate calculation based on duration
const getInterestRate = (duration: number): number => {
  if (duration <= 7) return 5
  if (duration <= 14) return 8
  if (duration <= 21) return 12
  return 15 // 30 days
}

export function useLoanApi() {
  const { profile, getPrivyAccessToken } = useAuth()
  const { repayLoan: splRepayLoan } = useSPLTransactions()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createLoan = async (params: CreateLoanParams): Promise<LoanResponse | null> => {
    if (!profile?.id || !profile?.steamId || !profile?.wallet) {
      setError("User not authenticated or missing required data")
      return null
    }

    // Get access token for secure authentication
    const token = await getPrivyAccessToken()
    if (!token) {
      setError("No access token available")
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      // Calculate total amount to repay with interest
      const interestRate = getInterestRate(params.duration);
      const totalAmountToRepay = params.amount * (1 + interestRate / 100);

      const response = await fetch('http://localhost:3333/solana/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: profile.id,
          steamId: profile.steamId,
          items: params.items,
          amount: params.amount,
          totalAmountToRepay: totalAmountToRepay, // Send total amount with interest
          duration: params.duration,
          skinId: params.skinId,
          value: params.value,
          userWallet: profile.wallet,
          interestRate: interestRate
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

    // Get access token for secure authentication
    const token = await getPrivyAccessToken()
    if (!token) {
      setError("No access token available")
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3333/api/user/borrows`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

    // Get access token for secure authentication
    const token = await getPrivyAccessToken()
    if (!token) {
      console.log("No access token available")
      return null
    }

    try {
      const response = await fetch(`http://localhost:3333/solana/borrow-state/${borrowId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

    // Get access token for secure authentication
    const token = await getPrivyAccessToken()
    if (!token) {
      setError("No access token available")
      return null
    }

    try {
      const response = await fetch(`http://localhost:3333/solana/borrow-details/${borrowId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  const getLoanExpiration = async (borrowId: string): Promise<any | null> => {
    if (!profile?.id) {
      setError("User not authenticated")
      return null
    }

    // Get access token for secure authentication
    const token = await getPrivyAccessToken()
    if (!token) {
      setError("No access token available")
      return null
    }

    try {
      const response = await fetch(`http://localhost:3333/solana/loan-expiration/${borrowId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch loan expiration")
        return null
      }

      const data = await response.json()
      return data.expiration || null
    } catch (err) {
      setError("Network error when fetching loan expiration")
      console.error("Error fetching loan expiration:", err)
      return null
    }
  }

  const liquidateLoan = async (borrowId: string): Promise<boolean> => {
    if (!profile?.id) {
      setError("User not authenticated")
      return false
    }

    // Get access token for secure authentication
    const token = await getPrivyAccessToken()
    if (!token) {
      setError("No access token available")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3333/solana/liquidate/${borrowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to liquidate loan")
        return false
      }

      return true
    } catch (err) {
      setError("Network error when liquidating loan")
      console.error("Error liquidating loan:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const checkAllLiquidations = async (): Promise<boolean> => {
    if (!profile?.id) {
      setError("User not authenticated")
      return false
    }

    // Get access token for secure authentication
    const token = await getPrivyAccessToken()
    if (!token) {
      setError("No access token available")
      return false
    }

    try {
      const response = await fetch(`http://localhost:3333/solana/check-liquidations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to check liquidations")
        return false
      }

      return true
    } catch (err) {
      setError("Network error when checking liquidations")
      console.error("Error checking liquidations:", err)
      return false
    }
  }

  return {
    createLoan,
    getUserLoans,
    getBorrowDetails,
    getBorrowBlockchainState,
    repayPartialLoan,
    getLoanExpiration,
    liquidateLoan,
    checkAllLiquidations,
    isLoading,
    error
  }
}