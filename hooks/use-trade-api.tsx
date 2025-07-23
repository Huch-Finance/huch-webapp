"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

interface CreateTradeResponse {
  tradeId: string
  trade: {
    userId: string
    steamId: string
    items: {
      assetId: string
      marketHashName: string
      iconUrl: string
      value: number
    }[]
    status: string
    createdAt: string
    updatedAt: string
    totalValue: number
    comment: string
    tradeOfferId: string
    tradeOfferUrl: string
    id: string
  }
  tradeOffer: {
    offerId: string
    url: string
  }
}

interface TradeStatusResponse {
  trade: {
    id: string
    userId: string
    steamId: string
    status: string
    items: {
      assetId: string
      marketHashName: string
      iconUrl: string
      value: number
    }[]
    totalValue: number
    comment: string
    tradeOfferId: string
    tradeOfferUrl: string
    createdAt: string
    updatedAt: string
  }
  status: string
}

interface CancelTradeResponse {
  success: boolean
  message: string
}

export function useTradeApi() {
  const { profile, getPrivyAccessToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTradeId, setCurrentTradeId] = useState<string | null>(null)
  
  const API_BASE_URL = "http://localhost:3333/api"
  
  // Create trade
  const createTrade = async (itemId: string, comment: string = "Loan collateral"): Promise<CreateTradeResponse | null> => {
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
      const response = await fetch(`${API_BASE_URL}/trade/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          itemIds: itemId,
          comment
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create trade")
        return null
      }
      
      const data: CreateTradeResponse = await response.json()
      setCurrentTradeId(data.tradeId)
      return data
    } catch (err) {
      setError("Network error when creating trade")
      console.error("Error creating trade:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }
  
  // Check trade status
  const checkTradeStatus = async (tradeId: string): Promise<TradeStatusResponse | null> => {
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
      const response = await fetch(`${API_BASE_URL}/trade/${tradeId}/status`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to check trade status")
        return null
      }
      
      return await response.json()
    } catch (err) {
      setError("Network error when checking trade status")
      console.error("Error checking trade status:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }
  
  // Cancel trade
  const cancelTrade = async (tradeId: string): Promise<CancelTradeResponse | null> => {
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
      const response = await fetch(`${API_BASE_URL}/trade/${tradeId}/cancel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to cancel trade")
        return null
      }
      
      return await response.json()
    } catch (err) {
      setError("Network error when canceling trade")
      console.error("Error canceling trade:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }
  
  return {
    createTrade,
    checkTradeStatus,
    cancelTrade,
    isLoading,
    error,
    currentTradeId,
    setCurrentTradeId
  }
}
