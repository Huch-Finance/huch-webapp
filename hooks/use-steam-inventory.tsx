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
  inventory: {
    items: SteamItem[]
  } | SteamItem[]
  lastUpdated: string
  fromCache?: boolean
}

export function useSteamInventory() {
  const { profile, isAuthenticated } = useAuth()
  const [inventory, setInventory] = useState<SteamItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [inventoryFetched, setInventoryFetched] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  // Function to fetch the user's Steam inventory
  const fetchInventory = async () => {
    // Check if the inventory has already been fetched or is currently fetching
    if (inventoryFetched || isFetching) {
      console.log("Inventory already fetched or fetch in progress, skipping");
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
      //console.log("API call to /api/inventory with Privy ID:", profile.id);
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
      
      // Extract inventory items based on the response structure
      let inventoryItems: SteamItem[] = [];
      if (data.inventory) {
        if ('items' in data.inventory) {
          inventoryItems = data.inventory.items;
          //console.log("Format d'API détecté: inventory.items[]");
        } else if (Array.isArray(data.inventory)) {
          inventoryItems = data.inventory;
          //console.log("Format d'API détecté: inventory[]");
        }
      }
      
      //console.log("Inventory fetched successfully:", inventoryItems.length, "skins");
      //console.log("Inventory content:", inventoryItems);
      if (inventoryItems.length === 0) {
        console.warn("API returned an empty inventory!");
      }
      
      setInventory(inventoryItems)
      setLastUpdated(data.lastUpdated)
      setInventoryFetched(true);
    } catch (error) {
      //console.error("Error fetching inventory:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      //console.log("End fetching inventory, isLoading = false");
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  // Function to fetch inventory when the profile is loaded and the user has a steamId and tradeLink
  useEffect(() => {
    console.log("useEffect dans useSteamInventory - Auth:", isAuthenticated, "SteamId:", profile?.steamId);

    if (isAuthenticated && profile?.steamId && profile?.tradeLink) {
      console.log("Conditions remplies pour récupérer l'inventaire");
      fetchInventory();
    } else {
      console.log("Conditions non remplies, réinitialisation de l'inventaire");
      setInventory([]);
      setLastUpdated(null);
      setIsLoading(false);
      setInventoryFetched(false);
      setIsFetching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, profile?.steamId, profile?.tradeLink])

  const forceRefreshInventory = async() => {
    setInventoryFetched(false);
    setIsFetching(false);
    if (!isAuthenticated || !profile?.id) {
      setError("You must be connected with Steam and have an exchange link to see your inventory")
      setIsLoading(false);
      return
    }
    try{
      console.log('id:', profile.id);
      const response = await fetch('http://localhost:3333/api/user/inventory/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Privy-Id': profile.id
        }
      })
      if (!response.ok) {
        throw new Error(`Error refreshing inventory: ${await response.text()}`)
      }
      fetchInventory();
    } catch (error) {
      console.error("Error refreshing inventory:", error)
    }
  };
  
  return {
    inventory,
    isLoading,
    error,
    lastUpdated,
    refreshInventory: forceRefreshInventory,
    inventoryFetched
  }
}
