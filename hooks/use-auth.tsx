"use client"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useSolanaWallets } from "@privy-io/react-auth/solana"
import { useEffect, useState, useRef } from "react"
import type { UserProfile, AuthStatus } from "@/lib/privy"
import { isPrivyConfigured } from "@/lib/privy"

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isConfigured, setIsConfigured] = useState(isPrivyConfigured)
  const isRegisteringRef = useRef(false)
  const hasLoadedUserDataRef = useRef(false)

  const { ready, authenticated, user, login, logout, connectWallet, createWallet } = usePrivy()
  const { wallets } = useWallets()
  const solanaWallets = useSolanaWallets()
  
  // Fonction pour s'assurer qu'on a un wallet Solana
  const ensureSolanaWallet = async () => {
    if (!authenticated || !user) return null
    
    // Utiliser solanaWallets directement depuis le hook Privy
    if (solanaWallets.wallets.length > 0) {
      const solanaWallet = solanaWallets.wallets[0]
      console.log('Solana wallet already exists:', solanaWallet.address)
      return solanaWallet.address
    }
    
    // Vérifier si l'utilisateur a déjà un embedded wallet (de n'importe quel type)
    const hasEmbeddedWallet = wallets?.some(wallet => wallet.walletClientType === 'privy')
    if (hasEmbeddedWallet) {
      console.log('User already has an embedded wallet, cannot create another one')
      return null
    }
    
    console.log('No Solana wallet found, creating one...')
    try {
      await createWallet({ walletClientType: 'privy', chainType: 'solana' })
      // Note: le wallet sera disponible dans le prochain render via useSolanaWallets
      return null
    } catch (error) {
      console.error('Failed to create Solana wallet:', error)
      return null
    }
  }

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
    if (!user) {
      console.log('No user available for reloading data');
      return;
    }
    
    console.log('Starting reloadUserData for user:', user.id);
    
    try {
      const response = await fetch('http://localhost:3333/api/user', {
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
      console.log('User data received from API:', data);
      console.log('Detailed user object:', JSON.stringify(data.user, null, 2));
      
      if (data.user) {
        setProfile(prevProfile => {
          if (!prevProfile) {
            console.log('No previous profile to update');
            return null;
          }
          
          const updatedProfile = {
            ...prevProfile,
            steamId: data.user.steamId,
            tradeLink: data.user.tradeLink,
            admin: data.user.admin ?? false,
            // Preserve wallet if it exists in prevProfile but not in API response
            wallet: prevProfile.wallet || data.user.wallet,
          };
          if (data.user.profile) {
            console.log('[reloadUserData] User profile data:', data.user.profile);
            if (data.user.profile.steamName) {
              updatedProfile.username = data.user.profile.steamName;
            }
            if (data.user.profile.steamAvatar) {
              updatedProfile.avatar = data.user.profile.steamAvatar;
              console.log('[reloadUserData] Setting avatar:', data.user.profile.steamAvatar);
            }
          }
          
          console.log('Updated profile with API data:', updatedProfile);
          return updatedProfile;
        });
      } else {
        console.log('No user data in API response');
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
      hasLoadedUserDataRef.current = false;
      isRegisteringRef.current = false;
      return
    }

    // Récupère la valeur admin depuis le localStorage si elle existe (optionnel)
    let adminFromDb = false;
    if (user && typeof window !== "undefined") {
      const adminStr = window.localStorage.getItem("admin");
      if (adminStr === "true") adminFromDb = true;
    }

    // User is authenticated, build profile
    // Debug: afficher tous les wallets disponibles
    console.log('All available wallets:', wallets?.map(w => ({
      address: w.address,
      chainType: w.chainType,
      walletClientType: w.walletClientType,
      connectorType: w.connectorType
    })))
    
    // Utiliser directement solanaWallets depuis le hook Privy
    const solanaWallet = solanaWallets.wallets.length > 0 ? solanaWallets.wallets[0] : null
    console.log('Found Solana wallet:', solanaWallet)
    
    // Si pas de wallet Solana, essayer d'en créer un
    if (!solanaWallet && wallets && wallets.length > 0) {
      console.log('No Solana wallet found, will try to create one...')
      setTimeout(() => ensureSolanaWallet(), 1000)
    }
    
    const userProfile: UserProfile = {
      id: user?.id || "",
      email: user?.email?.address,
      wallet: solanaWallet?.address || wallets?.[0]?.address,
      steamId: undefined,
      username: undefined,
      admin: adminFromDb || false,
    }

    setProfile(userProfile)
    setStatus("authenticated")

    // Only load user data once per user session
    if (user && !hasLoadedUserDataRef.current && !isRegisteringRef.current) {
      console.log('Loading user data for user:', user.id);
      isRegisteringRef.current = true;
      hasLoadedUserDataRef.current = true;
      
      // If we have wallets, register and load data  
      const solanaAddr = solanaWallets.wallets.length > 0 ? solanaWallets.wallets[0].address : null
      if (wallets && wallets.length > 0 && (solanaAddr || wallets[0]?.address)) {
        console.log('Registering user with wallet');
        registerUserInDatabase(user.id, solanaAddr || wallets[0].address)
          .then(() => {
            return reloadUserData();
          })
          .finally(() => {
            isRegisteringRef.current = false;
          });
      } else {
        // Just load user data without registration
        console.log('Loading user data without wallet registration');
        reloadUserData()
          .finally(() => {
            isRegisteringRef.current = false;
          });
      }
    } else if (user && hasLoadedUserDataRef.current) {
      console.log('User data already loaded, skipping reload');
    }
  }, [ready, authenticated, user, solanaWallets.wallets])

  // Separate effect to handle wallet registration when wallets become available
  useEffect(() => {
    const solanaAddr = solanaWallets.wallets.length > 0 ? solanaWallets.wallets[0].address : null
    const walletToUse = solanaAddr || wallets?.[0]?.address
    
    if (
      ready && 
      authenticated && 
      user && 
      wallets && 
      wallets.length > 0 && 
      walletToUse && 
      !isRegisteringRef.current && 
      profile && 
      !profile.wallet
    ) {
      console.log('Wallet became available, registering user with wallet');
      isRegisteringRef.current = true;
      
      registerUserInDatabase(user.id, walletToUse)
        .then(() => {
          // Update profile with wallet
          setProfile(prev => prev ? { ...prev, wallet: walletToUse } : null);
          return reloadUserData();
        })
        .finally(() => {
          isRegisteringRef.current = false;
        });
    }
  }, [ready, authenticated, user, wallets, solanaWallets.wallets, profile?.wallet])

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
        const response = await fetch('http://localhost:3333/api/user', {
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
          console.log('updateSteamId API response:', JSON.stringify(data, null, 2));
          if (!data.user || !data.user.steamId) {
            console.error('Steam ID not found in API response');
            return false;
          }
          if (tradeLink && (!data.user.tradeLink || data.user.tradeLink !== tradeLink)) {
            console.error('Trade link not properly saved in API response. Expected:', tradeLink, 'Got:', data.user.tradeLink);
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
      ensureSolanaWallet: () => Promise.resolve(null),
      isLoading: status === "loading",
      isAuthenticated: false,
    }
    
  }

  // Function to logout and clean Steam data
  const handleLogout = () => {
    logout();
    setStatus("unauthenticated");
    setProfile(null);
    // Reset flags
    isRegisteringRef.current = false;
    hasLoadedUserDataRef.current = false;
    
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
    ensureSolanaWallet,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}
