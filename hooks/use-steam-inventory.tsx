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
  const [isLoading, setIsLoading] = useState(true) // Commencer avec isLoading = true
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [inventoryFetched, setInventoryFetched] = useState(false) // Nouvel état pour suivre si l'inventaire a été récupéré

  // Fonction pour récupérer l'inventaire Steam de l'utilisateur
  const fetchInventory = async () => {
    // Vérifier si l'inventaire a déjà été récupéré
    if (inventoryFetched) {
      console.log("Inventaire déjà récupéré, utilisation du cache");
      return;
    }
    
    // Vérifier si l'utilisateur est authentifié et a un steamId et un tradeLink
    if (!isAuthenticated || !profile?.steamId || !profile?.tradeLink) {
      setError("Vous devez être connecté avec Steam et avoir un lien d'échange pour voir votre inventaire")
      setIsLoading(false);
      return
    }

    console.log("Début de la récupération de l'inventaire pour", profile.steamId);
    setIsLoading(true)
    setError(null)

    try {
      console.log("Appel API vers /api/inventory avec Privy ID:", profile.id);
      const response = await fetch('http://localhost:3333/api/inventory', {
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
      
      // Extraire les items de l'inventaire selon la structure de la réponse
      let inventoryItems: SteamItem[] = [];
      if (data.inventory) {
        if ('items' in data.inventory) {
          // Structure { inventory: { items: SteamItem[] } }
          inventoryItems = data.inventory.items;
          console.log("Format d'API détecté: inventory.items[]");
        } else if (Array.isArray(data.inventory)) {
          // Structure { inventory: SteamItem[] }
          inventoryItems = data.inventory;
          console.log("Format d'API détecté: inventory[]");
        }
      }
      
      console.log("Inventaire récupéré avec succès:", inventoryItems.length, "skins");
      console.log("Contenu de l'inventaire:", inventoryItems);
      
      // Vérifier si l'inventaire est vide ou non
      if (inventoryItems.length === 0) {
        console.warn("L'API a retourné un inventaire vide!");
      }
      
      setInventory(inventoryItems)
      setLastUpdated(data.lastUpdated)
      setInventoryFetched(true); // Marquer l'inventaire comme récupéré
    } catch (error) {
      console.error("Erreur lors de la récupération de l'inventaire Steam:", error)
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      console.log("Fin de la récupération de l'inventaire, isLoading = false");
      setIsLoading(false)
    }
  }

  // Récupérer l'inventaire lorsque le profil est chargé et que l'utilisateur a un steamId et un tradeLink
  useEffect(() => {
    console.log("useEffect dans useSteamInventory - Auth:", isAuthenticated, "SteamId:", profile?.steamId);
    
    // Vérifier si l'utilisateur est authentifié et a un steamId et un tradeLink
    if (isAuthenticated && profile?.steamId && profile?.tradeLink) {
      console.log("Conditions remplies pour récupérer l'inventaire");
      // Appeler fetchInventory une seule fois
      fetchInventory();
    } else {
      // Réinitialiser l'inventaire si l'utilisateur n'est pas authentifié ou n'a pas de steamId/tradeLink
      console.log("Conditions non remplies, réinitialisation de l'inventaire");
      setInventory([]);
      setLastUpdated(null);
      setIsLoading(false); // S'assurer que isLoading est mis à false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, profile?.steamId, profile?.tradeLink])

  // Fonction pour forcer le rafraîchissement de l'inventaire
  const forceRefreshInventory = () => {
    setInventoryFetched(false); // Réinitialiser l'état pour permettre une nouvelle récupération
    return fetchInventory();
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
