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
  // Propriétés supplémentaires pour la compatibilité avec l'interface existante
  wear?: string
  rarity?: string
}

export type SteamInventoryResponse = {
  inventory: SteamItem[]
  lastUpdated: string
  fromCache: boolean
}

export function useSteamInventory() {
  const { profile, isAuthenticated } = useAuth()
  const [inventory, setInventory] = useState<SteamItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Fonction pour récupérer l'inventaire Steam de l'utilisateur
  const fetchInventory = async () => {
    // Vérifier si l'utilisateur est authentifié et a un steamId et un tradeLink
    if (!isAuthenticated || !profile?.steamId || !profile?.tradeLink) {
      setError("Vous devez être connecté avec Steam et avoir un lien d'échange pour voir votre inventaire")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3333/api/user/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Privy-Id': profile.id
        }
      })

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération de l'inventaire: ${await response.text()}`)
      }

      const data: SteamInventoryResponse = await response.json()
      setInventory(data.inventory)
      setLastUpdated(data.lastUpdated)
    } catch (error) {
      console.error("Erreur lors de la récupération de l'inventaire Steam:", error)
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  // Récupérer l'inventaire lorsque le profil est chargé et que l'utilisateur a un steamId et un tradeLink
  useEffect(() => {
    if (isAuthenticated && profile?.steamId && profile?.tradeLink) {
      fetchInventory()
    } else {
      // Réinitialiser l'inventaire si l'utilisateur n'est pas authentifié ou n'a pas de steamId/tradeLink
      setInventory([])
      setLastUpdated(null)
    }
  }, [isAuthenticated, profile?.steamId, profile?.tradeLink])

  return {
    inventory,
    isLoading,
    error,
    lastUpdated,
    refreshInventory: fetchInventory
  }
}
