"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/organism/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomSwitch as Switch } from "@/components/ui/custom-switch";
import { Label } from "@/components/ui/label";
import { CyberpunkContainer } from "@/components/layout/cyberpunk-container";
import {
  User,
  Shield,
  Bell,
  Wallet,
  ComputerIcon as Steam,
  ExternalLink,
  Info,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { usePrivy, useLinkAccount } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Footer } from "@/components/organism/footer";
import { SteamAuthButton } from "@/components/auth/steam-auth-button";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [steamID, setSteamID] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { profile, updateProfile, isAuthenticated, isLoading, reloadUserData, getPrivyAccessToken } =
    useAuth();
  const { linkEmail, linkWallet, unlinkEmail, unlinkWallet, user, ready } =
    usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();

  const handleAddEmail = async () => {
    console.log("handleAddEmail function called");
    try {
      console.log("Privy ready:", ready);
      console.log("linkEmail available:", !!linkEmail);
      console.log("Current user:", user);

      console.log("Calling Privy linkEmail...");
      await linkEmail();
      console.log("linkEmail completed");

      let attempts = 0;
      const maxAttempts = 10;
      const pollInterval = 3000;

      const pollForEmailUpdate = () => {
        attempts++;
        console.log(
          `Polling for email update... (attempt ${attempts}/${maxAttempts})`,
        );

        setTimeout(async () => {
          if (user && user.id) {
            const currentEmail = user.email?.address;
            console.log("Current email after polling:", currentEmail);

            if (currentEmail) {
              console.log("Email detected, updating backend:", currentEmail);
              console.log("Email detected, updating backend:", currentEmail);
              try {
                // Get access token for secure authentication
                const token = await getPrivyAccessToken()
                if (!token) {
                  console.error("No access token available")
                  return;
                }

                const response = await fetch("http://localhost:3333/api/user", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    profile: {
                      email: currentEmail,
                    },
                  }),
                });

                if (!response.ok) {
                  console.error("Error updating email:", await response.text());
                } else {
                  const data = await response.json();
                  console.log("Email update successful:", data);
                  // Mettre à jour l'interface
                  setEmail(currentEmail);
                }

                // Recharger les données utilisateur
                if (reloadUserData) {
                  reloadUserData();
                }
                return; // Arrêter le polling une fois l'email mis à jour
              } catch (apiError) {
                console.error("Error calling API:", apiError);
              }
            }

            if (attempts < maxAttempts) {
              pollForEmailUpdate();
            } else {
              console.log("Max attempts reached, stopping polling");
            }
          }
        }, pollInterval);
      };

      pollForEmailUpdate();
    } catch (error) {
      console.error("Error in handleAddEmail:", error);
    }
  };

  const handleRemoveEmail = async () => {
    try {
      await unlinkEmail();
      setEmail("");
      if (reloadUserData) {
        reloadUserData();
      }
    } catch (error) {
      console.error("Error removing email:", error);
    }
  };

  const handleAddWallet = async () => {
    try {
      await linkWallet();
      if (reloadUserData) {
        reloadUserData();
      }
    } catch (error) {
      console.error("Error adding wallet:", error);
    }
  };

  const handleRemoveWallet = async () => {
    try {
      await unlinkWallet(walletAddress);
      setWalletAddress("");
      if (reloadUserData) {
        reloadUserData();
      }
    } catch (error) {
      console.error("Error removing wallet:", error);
    }
  };

  // Update form fields when profile changes
  useEffect(() => {
    if (profile) {
      setSteamID(profile.steamId || "");
      setUsername(profile.username || "");
      setEmail(user?.email?.address || "");
      setWalletAddress(solanaWallets[0]?.address || "");
    }
  }, [profile, user, solanaWallets]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Get access token for secure authentication
      const token = await getPrivyAccessToken()
      if (!token) {
        console.error("No access token available")
        return;
      }

      const response = await fetch("http://localhost:3333/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          profile: {
            username: username,
          },
        }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        if (reloadUserData) {
          reloadUserData();
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        console.error("Error saving profile:", await response.text());
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#111] text-white">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D5FEF] mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-[#111] text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="w-16 h-16 text-[#5D5FEF] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Paramètres</h2>
            <p className="text-gray-400 mb-6">
              Connectez-vous pour accéder à vos paramètres
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#111] text-white">
      <Navbar />
      <main className="flex-1">
        <CyberpunkContainer>
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Paramètres</h1>
              <p className="text-gray-400">
                Gérez votre profil et vos préférences
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="security">Sécurité</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 text-[#5D5FEF]" />
                      Informations du profil
                    </CardTitle>
                    <CardDescription>
                      Gérez vos informations personnelles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="username">Nom d'utilisateur</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Votre nom d'utilisateur"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="steamId">Steam ID</Label>
                      <Input
                        id="steamId"
                        value={steamID}
                        onChange={(e) => setSteamID(e.target.value)}
                        placeholder="Votre Steam ID"
                        className="mt-1"
                        disabled
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        Connectez-vous via Steam pour lier votre compte
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <SteamAuthButton />
                      <Badge
                        className={
                          hasSteamLinked
                            ? "bg-green-600/20 text-green-400 border-green-600"
                            : "bg-yellow-600/20 text-yellow-400 border-yellow-600"
                        }
                      >
                        {hasSteamLinked ? "Connecté" : "Non connecté"}
                      </Badge>
                    </div>

                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="w-full bg-[#5D5FEF] hover:bg-[#4A4CDF]"
                    >
                      {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>

                    {saveSuccess && (
                      <div className="p-3 bg-green-600/20 border border-green-600/30 rounded-lg text-center">
                        <p className="text-sm text-green-400">
                          Profil mis à jour avec succès !
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="mr-2 text-[#5D5FEF]" />
                      Email
                    </CardTitle>
                    <CardDescription>
                      Gérez votre adresse email
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {email || "Aucun email connecté"}
                        </h4>
                        <p className="text-sm text-gray-400">
                          Votre adresse email
                        </p>
                      </div>
                      {email ? (
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500/20"
                          onClick={handleRemoveEmail}
                        >
                          Supprimer
                        </Button>
                      ) : (
                        <Button
                          className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white"
                          onClick={handleAddEmail}
                        >
                          Ajouter Email
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wallet className="mr-2 text-[#5D5FEF]" />
                      Wallet Authentication
                    </CardTitle>
                    <CardDescription>
                      Connectez votre wallet crypto pour l'authentification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {walletAddress
                            ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                            : "Aucun wallet connecté"}
                        </h4>
                        <p className="text-sm text-gray-400">
                          Votre wallet connecté
                        </p>
                      </div>
                      {walletAddress ? (
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500/20"
                          onClick={() => handleRemoveWallet()}
                        >
                          Déconnecter
                        </Button>
                      ) : (
                        <Button
                          className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white"
                          onClick={() => handleAddWallet()}
                        >
                          Connecter Wallet
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 text-[#5D5FEF]" />
                      Sécurité
                    </CardTitle>
                    <CardDescription>
                      Paramètres de sécurité de votre compte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Authentification à deux facteurs</h4>
                        <p className="text-sm text-gray-400">
                          Ajoutez une couche de sécurité supplémentaire
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notifications de connexion</h4>
                        <p className="text-sm text-gray-400">
                          Recevez une notification à chaque nouvelle connexion
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2 text-[#5D5FEF]" />
                      Notifications
                    </CardTitle>
                    <CardDescription>
                      Gérez vos préférences de notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notifications par email</h4>
                        <p className="text-sm text-gray-400">
                          Recevez des notifications importantes par email
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notifications de prêt</h4>
                        <p className="text-sm text-gray-400">
                          Soyez informé des nouveaux prêts disponibles
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notifications de prix</h4>
                        <p className="text-sm text-gray-400">
                          Recevez des alertes sur les changements de prix
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wallet" className="space-y-6">
                <CyberpunkContainer>
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center">
                      <Wallet className="mr-2 text-[#5D5FEF]" />
                      Connexion Wallet
                    </CardTitle>
                    <CardDescription>
                      Connectez votre wallet crypto pour recevoir et rembourser des prêts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-4">
                    <div className="p-4 bg-[#2A2A2A] rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">Wallet Connecté</h4>
                          <p className="text-sm text-gray-400">
                            Votre adresse wallet Solana actuelle
                          </p>
                        </div>
                        <Badge
                          className={`${
                            walletAddress
                              ? "bg-green-600/20 text-green-400 border-green-600"
                              : "bg-yellow-600/20 text-yellow-400 border-yellow-600"
                          }`}
                        >
                          {walletAddress ? "Connecté" : "Non Connecté"}
                        </Badge>
                      </div>

                      {walletAddress && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Adresse:</span>
                            <span className="text-sm font-mono">
                              {walletAddress}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Réseau:</span>
                            <span className="text-sm">Solana</span>
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        {walletAddress ? (
                          <Button
                            variant="outline"
                            className="w-full border-red-500 text-red-500 hover:bg-red-500/20"
                            onClick={handleRemoveWallet}
                          >
                            Déconnecter Wallet
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-[#5D5FEF] hover:bg-[#4A4CDF]"
                            onClick={handleAddWallet}
                          >
                            Connecter Wallet
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-[#2A2A2A] rounded-lg">
                      <div className="flex items-center mb-4">
                        <Info className="w-5 h-5 text-blue-400 mr-2" />
                        <h4 className="font-medium">Pourquoi connecter un wallet ?</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Recevoir des prêts en USDC</li>
                        <li>• Rembourser vos prêts</li>
                        <li>• Participer aux événements exclusifs</li>
                        <li>• Accéder aux fonctionnalités premium</li>
                      </ul>
                    </div>
                  </CardContent>
                </CyberpunkContainer>
              </TabsContent>
            </Tabs>
          </div>
        </CyberpunkContainer>
      </main>
      <Footer />
    </div>
  );
}
