"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
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

export function useLoanApi() {
  const { profile } = useAuth()
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


  return {
    createLoan,
    isLoading,
    error
  }
}