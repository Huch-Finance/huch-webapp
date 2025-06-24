"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"

export type SteamItem = {
  id: string
  market_hash_name: string
  basePrice: number
  floatValue: number
  liquidationRate: number
  loanOffer: number
  imageUrl: string
  steamId: string
  stickers: any[]
  wear?: string
  rarity?: string
}

export interface SteamInventoryResponse {
  inventory: SteamItem[]
  lastUpdated: string
  fromCache?: boolean
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export function useSteamInventory() {
  const { profile, isAuthenticated } = useAuth()
  const [inventory, setInventory] = useState<SteamItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [inventoryFetched, setInventoryFetched] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [lastFetchKey, setLastFetchKey] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)

  // Function to fetch the user's Steam inventory
  const fetchInventory = async (forceRefresh: boolean = false) => {
    // Create a unique key for this user's inventory fetch
    const currentFetchKey = `${profile?.id}-${profile?.steamId}`;
    
    // Check if cache is still valid
    const now = Date.now();
    const cacheValid = lastFetchTime && (now - lastFetchTime) < CACHE_DURATION;
    
    // Check if we're already fetching or if we've already fetched for this user within cache duration
    if (!forceRefresh && (isFetching || (inventoryFetched && lastFetchKey === currentFetchKey && cacheValid))) {
      console.log("Inventory cached and still valid or fetch in progress, skipping", {
        isFetching,
        inventoryFetched,
        cacheValid,
        timeSinceLastFetch: lastFetchTime ? now - lastFetchTime : 'never'
      });
      return;
    }

    // Check if the user is authenticated and has a steamId and tradeLink
    if (!isAuthenticated || !profile?.steamId || !profile?.tradeLink) {
      setError("You must be connected with Steam and have an exchange link to see your inventory")
      setIsLoading(false);
      return
    }

    //console.log("Start fetching inventory for", profile.steamId);
    setIsFetching(true)
    setIsLoading(true)
    setError(null)

    try {
      console.log("API call to /api/inventory with Privy ID:", profile.id);
      const response = await fetch('http://localhost:3333/api/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Privy-Id': profile.id
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

  // Function to fetch inventory when the profile is loaded and the user has a steamId and tradeLink
  useEffect(() => {
    const currentFetchKey = `${profile?.id}-${profile?.steamId}`;
    
    if (isAuthenticated && profile?.steamId && profile?.tradeLink) {
      // Only fetch if we haven't fetched for this specific user yet
      if (!inventoryFetched || lastFetchKey !== currentFetchKey) {
        fetchInventory();
      }
    } else {
      setInventory([]);
      setLastUpdated(null);
      setIsLoading(false);
      setInventoryFetched(false);
      setIsFetching(false);
      setLastFetchKey(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, profile?.steamId, profile?.tradeLink])

  const forceRefreshInventory = async() => {
    if (!isAuthenticated || !profile?.id) {
      setError("You must be connected with Steam and have an exchange link to see your inventory")
      setIsLoading(false);
      return
    }
    
    setIsLoading(true);
    setError(null);
    
    try{
      console.log('Refreshing inventory for user:', profile.id);
      const response = await fetch('http://localhost:3333/api/user/inventory/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Privy-Id': profile.id
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 429) {
          // Rate limited
          console.log('Inventory refresh rate limited:', errorData.retryAfter);
          setError(`Please wait ${errorData.retryAfter} seconds before refreshing again`);
          return;
        }
        
        throw new Error(errorData.error || `Error refreshing inventory`)
      }
      
      // Refresh successful, now fetch the updated inventory with force refresh
      await fetchInventory(true);
    } catch (error) {
      console.error("Error refreshing inventory:", error)
      setError(error instanceof Error ? error.message : "Failed to refresh inventory")
      setIsLoading(false)
    }
  };

  const refreshPrices = async() => {
    // Since we removed the price refresh endpoint, just refresh the entire inventory
    await forceRefreshInventory();
    return true;
  };
  
  return {
    inventory,
    isLoading,
    error,
    lastUpdated,
    refreshInventory: forceRefreshInventory,
    refreshPrices,
    inventoryFetched
  }
}
