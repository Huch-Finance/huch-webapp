"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useSolanaWallets } from "@privy-io/react-auth/solana"
import { useEffect, useState } from "react"
import type { UserProfile, AuthStatus } from "@/lib/privy"
import { isPrivyConfigured } from "@/lib/privy"

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isConfigured, setIsConfigured] = useState(isPrivyConfigured)

  const { ready, authenticated, user, login, logout, createWallet, connectWallet } = usePrivy()
  const { wallets } = useSolanaWallets()

  useEffect(() => {
    if (!isConfigured) {
      // Simulate a loading delay then switch to unauthenticated
      const timer = setTimeout(() => {
        setStatus("unauthenticated")
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isConfigured])

  // Fonction pour enregistrer l'utilisateur dans la base de données via l'API
  const registerUserInDatabase = async (userId: string, walletAddress?: string) => {
    try {
      const response = await fetch('http://localhost:3333/api/auth/privy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          wallet: walletAddress,
          email: user?.email?.address || null,
        }),
      });

      if (!response.ok) {
        console.error('Error register user in database:', await response.text());
      }
    } catch (error) {
      console.error('Error call API register user in database:', error);
    }
  };

  useEffect(() => {
    if (!ready) {
      setStatus("loading")
      return
    }

    if (!authenticated) {
      setStatus("unauthenticated")
      setProfile(null)
      return
    }

    // User is authenticated, build profile
    const userProfile: UserProfile = {
      id: user?.id || "",
      email: user?.email?.address,
      wallet: wallets?.[0]?.address,
      steamId: (user?.metadata?.steamId as string) || localStorage.getItem("steamID") || undefined,
      username: (user?.metadata?.username as string) || undefined,
      avatar: user?.avatar?.url,
    }

    setProfile(userProfile)
    setStatus("authenticated")

    // Enregistrer l'utilisateur dans la base de données seulement si un portefeuille est disponible
    if (user?.id && wallets && wallets.length > 0 && wallets[0]?.address) {
      registerUserInDatabase(user.id, wallets[0].address);
    }

    // If user has a steamID in Privy metadata, save it locally
    if (user?.metadata?.steamId && !localStorage.getItem("steamID")) {
      localStorage.setItem("steamID", user.metadata.steamId as string)
    }
  }, [ready, authenticated, user, wallets])

  // Function to update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!authenticated || !user) return false

    try {
      // Update Privy metadata
      if (data.steamId) {
        await user.setMetadata("steamId", data.steamId)
        localStorage.setItem("steamID", data.steamId)
      }

      if (data.username) {
        await user.setMetadata("username", data.username)
      }

      // Update local profile
      setProfile((prev) => (prev ? { ...prev, ...data } : null))
      return true
    } catch (error) {
      console.error("Error updating profile:", error)
      return false
    }
  }

  if (!isConfigured) {
    return {
      status,
      profile: null,
      login: () =>
        alert("Authentication is not configured. Please add NEXT_PUBLIC_PRIVY_APP_ID to your environment variables."),
      logout: () => {},
      //createWallet: () => {},
      connectWallet: () => {},
      updateProfile: () => Promise.resolve(false),
      isLoading: status === "loading",
      isAuthenticated: false,
      //hasWallet: false,
    }
    
  }

  return {
    status,
    profile,
    login,
    logout,
    //createWallet,
    connectWallet,
    updateProfile,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    //hasWallet: !!profile?.wallet,
  }
}
