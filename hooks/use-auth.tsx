"use client"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useEffect, useState } from "react"
import type { UserProfile, AuthStatus } from "@/lib/privy"
import { isPrivyConfigured } from "@/lib/privy"

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isConfigured, setIsConfigured] = useState(isPrivyConfigured)

  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()

  useEffect(() => {
    if (!isConfigured) {
      // Simulate a loading delay then switch to unauthenticated
      const timer = setTimeout(() => {
        setStatus("unauthenticated")
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isConfigured])

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
      updateProfile: () => Promise.resolve(false),
      isLoading: status === "loading",
      isAuthenticated: false,
    }
    
  }

  return {
    status,
    profile,
    login,
    logout,
    updateProfile,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}
