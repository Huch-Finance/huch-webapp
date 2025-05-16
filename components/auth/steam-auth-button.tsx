"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Gamepad2 } from "lucide-react" // Utiliser Gamepad2 à la place de Steam qui n'existe pas
import { useAuth } from "@/hooks/use-auth"
import { useSearchParams } from "next/navigation"

export function SteamAuthButton() {
  const { profile, updateSteamId, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showtradeLinkInput, setShowtradeLinkInput] = useState(false)
  const [tradeLink, settradeLink] = useState('')
  const searchParams = useSearchParams()
  
  // Réinitialiser l'état quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!isAuthenticated) {
      setShowtradeLinkInput(false)
      settradeLink('')
    }
  }, [isAuthenticated])
  
  // Vérifier si l'utilisateur a déjà un steamId dans son profil
  useEffect(() => {
    // Si l'utilisateur est authentifié et a déjà un steamId mais pas de tradeLink, afficher le champ pour le lien d'échange
    // Si l'utilisateur a déjà un tradeLink, ne pas afficher le champ
    if (isAuthenticated && profile?.steamId) {
      if (profile.tradeLink) {
        // L'utilisateur a déjà un lien d'échange, ne pas afficher le champ
        setShowtradeLinkInput(false)
      } else if (!showtradeLinkInput) {
        // L'utilisateur n'a pas de lien d'échange, afficher le champ
        setShowtradeLinkInput(true)
      }
    }
  }, [isAuthenticated, profile?.steamId, profile?.tradeLink, showtradeLinkInput])
  
  // Check if the user is coming from the Steam authentication callback
  useEffect(() => {
    const steamConnected = searchParams.get('steam_connected')
    const steamId = searchParams.get('steam_id')
    const steamName = searchParams.get('steam_name')
    const steamAvatar = searchParams.get('steam_avatar')
    
    // Ne traiter les paramètres que si l'utilisateur n'a pas déjà un steamId
    if (steamConnected === 'true' && steamId && updateSteamId && !profile?.steamId) {
      // Mettre à jour le profil avec l'ID Steam seulement si ce n'est pas déjà fait
      // et attendre la confirmation du backend
      setIsLoading(true)
      updateSteamId(steamId, '', steamName || '', steamAvatar || '')
        .then(success => {
          if (success) {
            // Afficher le champ pour le lien d'échange seulement si l'association a réussi
            setShowtradeLinkInput(true)
          }
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    }
  }, [searchParams, updateSteamId, profile?.steamId])
  
  // Charger le tradeLink depuis le profil si disponible
  useEffect(() => {
    if (profile?.tradeLink && profile.tradeLink !== tradeLink) {
      settradeLink(profile.tradeLink)
    }
  }, [profile?.tradeLink, tradeLink])
  
  const handleSteamLogin = () => {
    setIsLoading(true)
    
    // Générer l'URL d'authentification Steam OpenID
    const steamOpenIDUrl = new URL("https://steamcommunity.com/openid/login")
    
    // Paramètres requis pour l'authentification OpenID
    steamOpenIDUrl.searchParams.append("openid.ns", "http://specs.openid.net/auth/2.0")
    steamOpenIDUrl.searchParams.append("openid.mode", "checkid_setup")
    steamOpenIDUrl.searchParams.append("openid.return_to", `${window.location.origin}/api/auth/steam-callback`)
    steamOpenIDUrl.searchParams.append("openid.realm", window.location.origin)
    steamOpenIDUrl.searchParams.append("openid.identity", "http://specs.openid.net/auth/2.0/identifier_select")
    steamOpenIDUrl.searchParams.append("openid.claimed_id", "http://specs.openid.net/auth/2.0/identifier_select")
    
    // Rediriger l'utilisateur vers l'URL d'authentification Steam
    window.location.href = steamOpenIDUrl.toString()
  }
  
  // Fonction pour gérer la soumission du lien d'échange
  const handletradeLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (profile?.steamId && updateSteamId) {
      setIsLoading(true)
      try {
        // Récupérer les valeurs existantes du profil pour les conserver
        const steamName = profile.username || ''
        const steamAvatar = profile.avatar || ''
        
        // Attendre la confirmation du backend avant de cacher le formulaire
        const success = await updateSteamId(profile.steamId, tradeLink, steamName, steamAvatar)
        if (success) {
          // Cacher le formulaire seulement si la mise à jour a réussi
          setShowtradeLinkInput(false)
        } else {
          // Afficher un message d'erreur ou garder le formulaire ouvert
          console.error('Failed to save trade link')
        }
      } catch (error) {
        console.error('Error saving trade link:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Si l'utilisateur a déjà connecté son compte Steam et que nous devons afficher le champ de saisie du lien d'échange
  if (profile?.steamId && showtradeLinkInput) {
    return (
      <div className="relative">
        <form onSubmit={handletradeLinkSubmit} className="flex items-center gap-1">
          <input
            type="text"
            id="steam-trade-link"
            name="steam-trade-link"
            value={tradeLink}
            onChange={(e) => settradeLink(e.target.value)}
            placeholder="Enter your Steam trade link"
            className="bg-[#161e2e] border border-[#2a3548] rounded-md py-1 px-2 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
          />
          <Button 
            type="submit"
            variant="outline"
            size="sm"
            className="bg-[#1f2937] border-[#2a3548] hover:bg-[#2a3548] rounded-full h-6 px-2 text-xs ml-1"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </div>
    )
  }

  // Afficher le bouton normal
  return (
    <Button 
      variant="outline"
      size="sm"
      className="bg-[#1f2937] border-[#2a3548] hover:bg-[#2a3548] rounded-full flex items-center gap-1 h-6 px-2 text-xs"
      onClick={profile?.steamId ? () => setShowtradeLinkInput(true) : handleSteamLogin}
      disabled={isLoading}
    >
      <Gamepad2 className="h-3 w-3 mr-1" />
      <span>
        {isLoading ? "Connecting..." : 
         (profile?.steamId ? "Steam Connected" : "Link Steam Account")}
      </span>
    </Button>
  )
}
