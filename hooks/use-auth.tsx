"use client"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useEffect, useState } from "react"
import type { UserProfile, AuthStatus } from "@/lib/privy"
import { isPrivyConfigured } from "@/lib/privy"

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isConfigured, setIsConfigured] = useState(isPrivyConfigured)

  const { ready, authenticated, user, login, logout, createWallet, connectWallet } = usePrivy()
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
        return;
      }
      
      // Récupérer les données de l'utilisateur depuis la réponse
      try {
        const data = await response.json();
        
        // Si l'utilisateur a déjà un steamId, mettre à jour le profil local
        if (data.user && data.user.steamId) {
          setProfile(prevProfile => {
            if (!prevProfile) return null;
            
            // Construire le profil avec les informations Steam
            const updatedProfile = {
              ...prevProfile,
              steamId: data.user.steamId,
              // Récupérer le tradeLink s'il existe
              tradeLink: data.user.tradeLink || prevProfile.tradeLink
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
            
            // Log pour débogage
            console.log('Profil mis à jour avec les données de l\'API:', updatedProfile);
            
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

  // Fonction pour recharger les données utilisateur depuis l'API
  const reloadUserData = async () => {
    if (!user) return;
    
    try {
      // Appeler l'API pour récupérer les données utilisateur à jour
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
      
      // Mettre à jour le profil avec les données récupérées
      if (data.user) {
        setProfile(prevProfile => {
          if (!prevProfile) return null;
          
          const updatedProfile = {
            ...prevProfile,
            steamId: data.user.steamId,
            tradeLink: data.user.tradeLink
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
          
          console.log('Profil rechargé depuis l\'API:', updatedProfile);
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

    // User is authenticated, build profile
    const userProfile: UserProfile = {
      id: user?.id || "",
      email: user?.email?.address,
      wallet: wallets?.[0]?.address,
      // Nous ne récupérons plus le steamId depuis les métadonnées ou le localStorage
      // car nous le récupérerons depuis l'API dans registerUserInDatabase
      steamId: undefined,
      username: undefined,
    }

    setProfile(userProfile)
    setStatus("authenticated")

    // Register user in database and retrieve steamId if available
    if (user && wallets && wallets.length > 0 && wallets[0]?.address) {
      registerUserInDatabase(user.id, wallets[0].address)
        .then(() => {
          // Après l'enregistrement, recharger les données utilisateur pour avoir les informations les plus récentes
          reloadUserData();
        });
    }
    
    // Recharger les données utilisateur à chaque rafraîchissement de la page
    if (user && typeof window !== 'undefined') {
      reloadUserData();
    }
  }, [ready, authenticated, user, wallets])

  // Function to update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!authenticated || !user) return false

    try {
      // Update Privy metadata - utiliser l'API de Privy pour mettre à jour les métadonnées
      // Note: Nous n'utilisons plus directement user.setMetadata car cette méthode n'existe pas dans le type User
      if (data.steamId) {
        // Stocker dans le localStorage comme solution de secours
        localStorage.setItem("steamID", data.steamId)
      }

      // Update local profile
      setProfile((prev) => (prev ? { ...prev, ...data } : null))
      return true
    } catch (error) {
      console.error("Error updating profile:", error)
      return false
    }
  }

  // Fonction pour mettre à jour le profil utilisateur avec un steamID
  const updateSteamId = async (steamId: string, tradeLink: string = '', steamName: string = '', steamAvatar: string = ''): Promise<boolean> => {
    if (!user) return false;

    try {
      // Enregistrer dans l'API du USER
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
              // N'envoyer les valeurs que si elles ne sont pas vides
              ...(steamName ? { steamName } : {}),
              ...(steamAvatar ? { steamAvatar } : {})
            }
          }),
        })

        if (!response.ok) {
          console.error('Error updating Steam ID in API:', await response.text())
          return false;
        }
        
        // Vérifier que la réponse contient bien les données attendues
        try {
          const data = await response.json();
          
          // Vérifier que la réponse contient bien le steamId et le tradeLink
          if (!data.user || !data.user.steamId) {
            console.error('Steam ID not found in API response');
            return false;
          }
          
          // Vérifier le tradeLink si on en a fourni un
          if (tradeLink && (!data.user.tradeLink || data.user.tradeLink !== tradeLink)) {
            console.error('Trade link not properly saved in API response');
            return false;
          }
          
          // Mettre à jour le profil local seulement après confirmation du backend
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
      //createWallet: () => {},
      connectWallet: () => {},
      updateProfile: () => Promise.resolve(false),
      isLoading: status === "loading",
      isAuthenticated: false,
      //hasWallet: false,
    }
    
  }

  // Fonction personnalisée pour se déconnecter et nettoyer les données Steam
  const handleLogout = () => {
    // D'abord, appeler la fonction logout de Privy
    logout();
    
    // Ensuite, réinitialiser l'état local
    setStatus("unauthenticated");
    setProfile(null);
    
    // Nettoyer les paramètres d'URL liés à Steam pour éviter toute confusion
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
    logout: handleLogout, // Remplacer la fonction logout par notre version personnalisée
    connectWallet,
    updateProfile,
    updateSteamId,
    reloadUserData, // Exposer la fonction pour recharger les données utilisateur
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}
