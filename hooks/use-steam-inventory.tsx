"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"

export interface SteamItem {
  id: string
  assetId: string
  marketHashName: string
  iconUrl: string
  value: number
  rarity: string
  type: string
  exterior?: string
  statTrak?: boolean
  tradeUpContract?: string
}

interface SteamInventoryResponse {
  inventory: SteamItem[]
  lastUpdated: string | null
  fromCache?: boolean
}

export function useSteamInventory() {
  const { profile, getPrivyAccessToken } = useAuth()
  const [inventory, setInventory] = useState<SteamItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [inventoryFetched, setInventoryFetched] = useState(false)
  const [lastFetchKey, setLastFetchKey] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)

  const fetchInventory = async () => {
    if (!profile?.id || !profile?.steamId) {
      setError("User not authenticated or Steam ID not linked")
      return
    }

    // Get access token for secure authentication
    const token = await getPrivyAccessToken()
    if (!token) {
      setError("No access token available")
      return
    }

    const currentFetchKey = `${profile.id}-${profile.steamId}`
    
    // Prevent duplicate requests
    if (isFetching || (lastFetchKey === currentFetchKey && lastFetchTime && Date.now() - lastFetchTime < 5000)) {
      console.log("Skipping fetch - already fetching or recent fetch")
      return
    }

    setIsFetching(true)
    setError(null)

    try {
      console.log("API call to /api/inventory with secure token authentication");
      const response = await fetch('http://localhost:3333/api/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Error fetching inventory: ${await response.text()}`)
      }

      const data: SteamInventoryResponse = await response.json()
      console.log("Raw API response:", data);
      console.log("From cache:", data.fromCache || false);
      
      // Extract inventory items from API response
      // The API returns { inventory: SteamItem[] }
      const inventoryItems: SteamItem[] = Array.isArray(data.inventory) ? data.inventory : [];
      
      console.log("Inventory fetched successfully:", inventoryItems.length, "skins");
      console.log("First few items:", inventoryItems.slice(0, 3));
      if (inventoryItems.length === 0) {
        console.warn("API returned an empty inventory!");
      }

      console.log("Tous les items retournés :", inventoryItems);

      setInventory(inventoryItems)
      setLastUpdated(data.lastUpdated)
      setInventoryFetched(true);
      setLastFetchKey(currentFetchKey);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error("Error fetching inventory:", error)
      const errorMessage = error instanceof Error ? error.message : "An error occurred while fetching your inventory"
      setError(errorMessage)
      setInventory([])
      setLastUpdated(null)
      setInventoryFetched(false)
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  const refreshInventory = useCallback(async () => {
    if (!profile?.id || !profile?.steamId) {
      setError("User not authenticated or Steam ID not linked")
      return
    }

    // Get access token for secure authentication
    const token = await getPrivyAccessToken()
    if (!token) {
      setError("No access token available")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("Forcing refresh of inventory with secure token authentication");
      const response = await fetch('http://localhost:3333/api/inventory?refresh=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Error refreshing inventory: ${await response.text()}`)
      }

      const data: SteamInventoryResponse = await response.json()
      console.log("Refresh API response:", data);
      
      const inventoryItems: SteamItem[] = Array.isArray(data.inventory) ? data.inventory : [];
      
      console.log("Inventory refreshed successfully:", inventoryItems.length, "skins");

      setInventory(inventoryItems)
      setLastUpdated(data.lastUpdated)
      setInventoryFetched(true);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error("Error refreshing inventory:", error)
      const errorMessage = error instanceof Error ? error.message : "An error occurred while refreshing your inventory"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [profile?.id, profile?.steamId, getPrivyAccessToken])

  useEffect(() => {
    if (profile?.id && profile?.steamId && !inventoryFetched) {
      fetchInventory()
    }
  }, [profile?.id, profile?.steamId, inventoryFetched])

  return {
    inventory,
    isLoading,
    error,
    lastUpdated,
    refreshInventory,
    inventoryFetched
  }
}
