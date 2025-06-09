"use client"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useEffect, useState, useRef } from "react"
import type { UserProfile, AuthStatus } from "@/lib/privy"
import { isPrivyConfigured } from "@/lib/privy"

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isConfigured, setIsConfigured] = useState(isPrivyConfigured)
  const isRegisteringRef = useRef(false)

  const { ready, authenticated, user, login, logout, connectWallet } = usePrivy()
  const { wallets } = useWallets()

  useEffect(() => {
    if (!isConfigured) {
      const timer = setTimeout(() => {
        setStatus("unauthenticated")
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isConfigured])

  /**
   * Handles authentication and user management.
   * This hook provides functionality to manage authentication state,
   * user profiles and wallet connections.
   */
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
        return;
      }
      try {
        const data = await response.json();
        
        // If the user already has a steamId, update the local profile
        if (data.user && data.user.steamId) {
          setProfile(prevProfile => {
            if (!prevProfile) return null;
            const updatedProfile = {
              ...prevProfile,
              steamId: data.user.steamId,
              tradeLink: data.user.tradeLink || prevProfile.tradeLink,
              admin: data.user.admin ?? false, // Toujours mettre à jour admin
            };
            
            // Ajouter les informations du profil Steam si disponibles
            if (data.user.profile) {
              if (data.user.profile.steamName) {
                updatedProfile.username = data.user.profile.steamName;
              }
              if (data.user.profile.steamAvatar) {
                updatedProfile.avatar = data.user.profile.steamAvatar;
              }
            }
            console.log('Profil updated:', updatedProfile);
            
            return updatedProfile;
          });
        }
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
      }
    } catch (error) {
      console.error('Error call API register user in database:', error);
    }
  };
  
  // Function to reload user data from the API
  const reloadUserData = async () => {
    if (!user) return;
    try {
      const response = await fetch('http://localhost:3333/api/user/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Privy-Id': user.id
        }
      });
      if (!response.ok) {
        console.error('Error fetching user data:', await response.text());
        return;
      }
      
      const data = await response.json();
      if (data.user) {
        setProfile(prevProfile => {
          if (!prevProfile) return null;
          
          const updatedProfile = {
            ...prevProfile,
            steamId: data.user.steamId,
            tradeLink: data.user.tradeLink,
            admin: data.user.admin ?? false, // Toujours mettre à jour admin
          };
          if (data.user.profile) {
            if (data.user.profile.steamName) {
              updatedProfile.username = data.user.profile.steamName;
            }
            if (data.user.profile.steamAvatar) {
              updatedProfile.avatar = data.user.profile.steamAvatar;
            }
          }
          
          console.log('Loaded profil from API:', updatedProfile);
          return updatedProfile;
        });
      }
    } catch (error) {
      console.error('Error reloading user data:', error);
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

    // Récupère la valeur admin depuis le localStorage si elle existe (optionnel)
    let adminFromDb = false;
    if (user && typeof window !== "undefined") {
      const adminStr = window.localStorage.getItem("admin");
      if (adminStr === "true") adminFromDb = true;
    }

    // User is authenticated, build profile
    const userProfile: UserProfile = {
      id: user?.id || "",
      email: user?.email?.address,
      wallet: wallets?.[0]?.address,
      steamId: undefined,
      username: undefined,
      admin: adminFromDb || false,
    }

    setProfile(userProfile)
    setStatus("authenticated")

    // Register user in database and retrieve steamId if available
    if (user && !isRegisteringRef.current) {
      isRegisteringRef.current = true;
      
      if (wallets && wallets.length > 0 && wallets[0]?.address) {
        registerUserInDatabase(user.id, wallets[0].address)
          .then(() => {
            reloadUserData();
          })
          .finally(() => {
            isRegisteringRef.current = false;
          });
      } else if (typeof window !== 'undefined' && (!wallets || wallets.length === 0)) {
        // Only reload user data if we don't have wallets yet
        reloadUserData()
          .finally(() => {
            isRegisteringRef.current = false;
          });
      } else {
        isRegisteringRef.current = false;
      }
    }
  }, [ready, authenticated, user, wallets])

  // Function to update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!authenticated || !user) return false

    try {
      if (data.steamId) {
        localStorage.setItem("steamID", data.steamId)
      }

      setProfile((prev) => (prev ? { ...prev, ...data } : null))
      return true
    } catch (error) {
      console.error("Error updating profile:", error)
      return false
    }
  }

  // Function to update the user profile with a steamID
  const updateSteamId = async (steamId: string, tradeLink: string = '', steamName: string = '', steamAvatar: string = ''): Promise<boolean> => {
    if (!user) return false;

    try {
      // Register in the USER API
      try {
        const response = await fetch('http://localhost:3333/api/user/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Privy-Id': user.id
          },
          body: JSON.stringify({
            steamId,
            tradeLink,
            profile: {
              ...(steamName ? { steamName } : {}),
              ...(steamAvatar ? { steamAvatar } : {})
            }
          }),
        })

        if (!response.ok) {
          console.error('Error updating Steam ID in API:', await response.text())
          return false;
        }
        try {
          const data = await response.json();
          if (!data.user || !data.user.steamId) {
            console.error('Steam ID not found in API response');
            return false;
          }
          if (tradeLink && (!data.user.tradeLink || data.user.tradeLink !== tradeLink)) {
            console.error('Trade link not properly saved in API response');
            return false;
          }
          
          // Update local profile
          if (profile) {
            setProfile({
              ...profile,
              steamId: data.user.steamId,
              tradeLink: data.user.tradeLink || tradeLink,
              username: steamName || profile.username,
              avatar: steamAvatar || profile.avatar
            });
          }
          
          return true;
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          return false;
        }
      } catch (error) {
        console.error("Error updating Steam ID in API:", error)
        return false;
      }
    } catch (error) {
      console.error("Error updating Steam ID:", error)
      return false;
    }
  }

  if (!isConfigured) {
    return {
      status,
      profile: null,
      login: () =>
        alert("Authentication is not configured. Please add NEXT_PUBLIC_PRIVY_APP_ID to your environment variables."),
      logout: () => {},
      connectWallet: () => {},
      updateProfile: () => Promise.resolve(false),
      isLoading: status === "loading",
      isAuthenticated: false,
    }
    
  }

  // Function to logout and clean Steam data
  const handleLogout = () => {
    logout();
    setStatus("unauthenticated");
    setProfile(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('steam_connected');
      url.searchParams.delete('steam_id');
      url.searchParams.delete('steam_name');
      url.searchParams.delete('steam_avatar');
      window.history.replaceState({}, '', url.toString());
    }
  };

  return {
    status,
    profile,
    login,
    logout: handleLogout,
    connectWallet,
    updateProfile,
    updateSteamId,
    reloadUserData,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}
