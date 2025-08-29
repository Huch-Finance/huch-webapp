"use client";

import { useState, useEffect } from "react";
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
import {
  User,
  Shield,
  Bell,
  Wallet,
  Steam,
  ExternalLink,
  Info,
  Mail,
  AlertTriangle,
  Settings as SettingsIcon,
  Upload,
  Copy,
  Check,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { usePrivy, useLinkAccount } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Footer } from "@/components/organism/footer";
import { SteamAuthButton } from "@/components/auth/steam-auth-button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [steamID, setSteamID] = useState("");
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [tradeLink, setTradeLink] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    priceAlerts: true,
    tradeOffers: true,
    portfolioUpdates: false,
    marketingEmails: false,
  });
  const [security, setSecurity] = useState({
    twoFactor: false,
    loginNotifications: true,
    apiAccess: false,
  });
  const [preferences, setPreferences] = useState({
    autoRefreshPrices: true,
    defaultCurrency: "USD",
    enableSounds: true,
    showFloatValues: true,
    compactView: false,
  });

  const { profile, updateProfile, isAuthenticated, isLoading, reloadUserData, getPrivyAccessToken } =
    useAuth();
  const { linkEmail, linkWallet, unlinkEmail, unlinkWallet, user, ready } =
    usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();

  // Check if Steam is linked
  const hasSteamLinked = Boolean(profile?.steamId);

  const handleCopyWalletAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Wallet address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddEmail = async () => {
    try {
      await linkEmail();
      let attempts = 0;
      const maxAttempts = 10;
      const pollInterval = 3000;

      const pollForEmailUpdate = () => {
        attempts++;
        setTimeout(async () => {
          if (user && user.id) {
            const currentEmail = user.email?.address;
            if (currentEmail) {
              try {
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

                if (response.ok) {
                  setEmail(currentEmail);
                  toast.success("Email connected successfully!");
                } else {
                  console.error("Error updating email:", await response.text());
                }

                if (reloadUserData) {
                  reloadUserData();
                }
                return;
              } catch (apiError) {
                console.error("Error calling API:", apiError);
              }
            }

            if (attempts < maxAttempts) {
              pollForEmailUpdate();
            }
          }
        }, pollInterval);
      };

      pollForEmailUpdate();
    } catch (error) {
      console.error("Error in handleAddEmail:", error);
      toast.error("Failed to connect email");
    }
  };

  const handleRemoveEmail = async () => {
    try {
      await unlinkEmail();
      setEmail("");
      toast.success("Email disconnected");
      if (reloadUserData) {
        reloadUserData();
      }
    } catch (error) {
      console.error("Error removing email:", error);
      toast.error("Failed to disconnect email");
    }
  };

  const handleAddWallet = async () => {
    try {
      await linkWallet();
      if (reloadUserData) {
        reloadUserData();
      }
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error adding wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const handleRemoveWallet = async () => {
    try {
      await unlinkWallet(walletAddress);
      setWalletAddress("");
      if (reloadUserData) {
        reloadUserData();
      }
      toast.success("Wallet disconnected");
    } catch (error) {
      console.error("Error removing wallet:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  const handleSaveTradeLink = async () => {
    setIsSaving(true);
    try {
      const token = await getPrivyAccessToken()
      if (!token) {
        toast.error("Authentication required");
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
            tradeLink: tradeLink,
          },
        }),
      });

      if (response.ok) {
        toast.success("Trade link saved successfully!");
        if (reloadUserData) {
          reloadUserData();
        }
      } else {
        toast.error("Failed to save trade link");
      }
    } catch (error) {
      console.error("Error saving trade link:", error);
      toast.error("Failed to save trade link");
    } finally {
      setIsSaving(false);
    }
  };

  // Update form fields when profile changes
  useEffect(() => {
    if (profile) {
      setSteamID(profile.steamId || "");
      setUsername(profile.username || "");
      setNickname(profile.nickname || profile.username || "");
      setTradeLink(profile.tradeLink || "");
      setEmail(user?.email?.address || "");
      setWalletAddress(solanaWallets[0]?.address || "");
    }
  }, [profile, user, solanaWallets]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const token = await getPrivyAccessToken()
      if (!token) {
        toast.error("Authentication required");
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
            nickname: nickname,
          },
        }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        toast.success("Profile updated successfully!");
        if (reloadUserData) {
          reloadUserData();
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    // In a real app, save to backend here
    toast.success("Notification preferences updated");
  };

  const handleSecurityChange = (key: string, value: boolean) => {
    setSecurity(prev => ({
      ...prev,
      [key]: value
    }));
    // In a real app, save to backend here
    toast.success("Security settings updated");
  };

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    // In a real app, save to backend here
    toast.success("Preferences updated");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0F0F2A] via-[#1a1a3a] to-[#0F0F2A] text-white">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1] mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0F0F2A] via-[#1a1a3a] to-[#0F0F2A] text-white">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="w-16 h-16 text-[#6366f1] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-[#a1a1c5] mb-6">
              Connect your wallet to access settings
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0F0F2A] via-[#1a1a3a] to-[#0F0F2A] text-white">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 font-poppins text-[#E1E1F5]">Settings</h1>
            <p className="text-[#a1a1c5] text-lg">
              Manage your profile and platform preferences
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-[#161e2e] border border-[#23263a]">
              <TabsTrigger value="profile" className="data-[state=active]:bg-[#6366f1]">Profile</TabsTrigger>
              <TabsTrigger value="steam" className="data-[state=active]:bg-[#6366f1]">Steam & Trading</TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-[#6366f1]">Security</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-[#6366f1]">Notifications</TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-[#6366f1]">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-[#161e2e] border-[#23263a]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 text-[#6366f1]" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-[#a1a1c5]">
                    Manage your personal information and display settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username" className="text-white">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your username"
                        className="mt-1 bg-[#0F0F2A] border-[#23263a] text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nickname" className="text-white">Display Name</Label>
                      <Input
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Your display name"
                        className="mt-1 bg-[#0F0F2A] border-[#23263a] text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Wallet Address</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={walletAddress ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 6)}` : "No wallet connected"}
                        disabled
                        className="flex-1 bg-[#0F0F2A] border-[#23263a] text-[#a1a1c5]"
                      />
                      {walletAddress && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyWalletAddress}
                          className="border-[#23263a] hover:bg-[#6366f1]/20"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-[#6366f1] to-[#7f8fff] hover:from-[#5855eb] hover:to-[#6d28d9]"
                  >
                    {isSaving ? "Saving..." : "Save Profile"}
                  </Button>

                  {saveSuccess && (
                    <div className="p-3 bg-green-600/20 border border-green-600/30 rounded-lg text-center">
                      <p className="text-sm text-green-400">
                        Profile updated successfully!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[#161e2e] border-[#23263a]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 text-[#6366f1]" />
                    Email
                  </CardTitle>
                  <CardDescription className="text-[#a1a1c5]">
                    Manage your email address for notifications and recovery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">
                        {email || "No email connected"}
                      </h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Your email address
                      </p>
                    </div>
                    {email ? (
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500/20"
                        onClick={handleRemoveEmail}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        className="bg-gradient-to-r from-[#6366f1] to-[#7f8fff]"
                        onClick={handleAddEmail}
                      >
                        Connect Email
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="steam" className="space-y-6">
              <Card className="bg-[#161e2e] border-[#23263a]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Steam className="mr-2 text-[#6366f1]" />
                    Steam Account
                  </CardTitle>
                  <CardDescription className="text-[#a1a1c5]">
                    Connect your Steam account to access your CS2 inventory
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="steamId" className="text-white">Steam ID</Label>
                    <Input
                      id="steamId"
                      value={steamID}
                      placeholder="Connect Steam to see your Steam ID"
                      className="mt-1 bg-[#0F0F2A] border-[#23263a] text-[#a1a1c5]"
                      disabled
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div className="flex items-center space-x-3">
                      <SteamAuthButton />
                      <div>
                        <h4 className="font-medium text-white">Steam Connection</h4>
                        <p className="text-sm text-[#a1a1c5]">Required to access your CS2 inventory</p>
                      </div>
                    </div>
                    <Badge
                      className={
                        hasSteamLinked
                          ? "bg-green-600/20 text-green-400 border-green-600"
                          : "bg-yellow-600/20 text-yellow-400 border-yellow-600"
                      }
                    >
                      {hasSteamLinked ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#161e2e] border-[#23263a]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ExternalLink className="mr-2 text-[#6366f1]" />
                    Trade Link
                  </CardTitle>
                  <CardDescription className="text-[#a1a1c5]">
                    Your Steam trade link for receiving skin transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tradeLink" className="text-white">Steam Trade Link</Label>
                    <Textarea
                      id="tradeLink"
                      value={tradeLink}
                      onChange={(e) => setTradeLink(e.target.value)}
                      placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                      className="mt-1 bg-[#0F0F2A] border-[#23263a] text-white resize-none h-20"
                    />
                    <p className="text-sm text-[#a1a1c5] mt-1">
                      Required for receiving skins and completing transactions
                    </p>
                  </div>

                  <Button
                    onClick={handleSaveTradeLink}
                    disabled={isSaving || !tradeLink.trim()}
                    className="bg-gradient-to-r from-[#6366f1] to-[#7f8fff] hover:from-[#5855eb] hover:to-[#6d28d9]"
                  >
                    {isSaving ? "Saving..." : "Save Trade Link"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="bg-[#161e2e] border-[#23263a]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 text-[#6366f1]" />
                    Security Settings
                  </CardTitle>
                  <CardDescription className="text-[#a1a1c5]">
                    Manage your account security and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div>
                      <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch 
                      checked={security.twoFactor}
                      onCheckedChange={(checked) => handleSecurityChange('twoFactor', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div>
                      <h4 className="font-medium text-white">Login Notifications</h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Get notified of new login attempts
                      </p>
                    </div>
                    <Switch 
                      checked={security.loginNotifications}
                      onCheckedChange={(checked) => handleSecurityChange('loginNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div>
                      <h4 className="font-medium text-white">API Access</h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Enable API access for third-party applications
                      </p>
                    </div>
                    <Switch 
                      checked={security.apiAccess}
                      onCheckedChange={(checked) => handleSecurityChange('apiAccess', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-[#161e2e] border-[#23263a]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 text-[#6366f1]" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-[#a1a1c5]">
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div>
                      <h4 className="font-medium text-white">Email Notifications</h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Receive important notifications via email
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div>
                      <h4 className="font-medium text-white">Price Alerts</h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Get notified when skin prices change significantly
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.priceAlerts}
                      onCheckedChange={(checked) => handleNotificationChange('priceAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div>
                      <h4 className="font-medium text-white">Trade Offers</h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Notifications for new trade offers and updates
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.tradeOffers}
                      onCheckedChange={(checked) => handleNotificationChange('tradeOffers', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div>
                      <h4 className="font-medium text-white">Portfolio Updates</h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Weekly summaries of your portfolio performance
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.portfolioUpdates}
                      onCheckedChange={(checked) => handleNotificationChange('portfolioUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div>
                      <h4 className="font-medium text-white">Marketing Emails</h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Promotional emails and platform updates
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card className="bg-[#161e2e] border-[#23263a]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <SettingsIcon className="mr-2 text-[#6366f1]" />
                    Platform Preferences
                  </CardTitle>
                  <CardDescription className="text-[#a1a1c5]">
                    Customize your platform experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div>
                      <h4 className="font-medium text-white">Auto-refresh Prices</h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Automatically update skin prices in real-time
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.autoRefreshPrices}
                      onCheckedChange={(checked) => handlePreferenceChange('autoRefreshPrices', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div>
                      <h4 className="font-medium text-white">Show Float Values</h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Display precise float values for skins
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.showFloatValues}
                      onCheckedChange={(checked) => handlePreferenceChange('showFloatValues', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div>
                      <h4 className="font-medium text-white">Enable Sounds</h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Play sound effects for notifications and actions
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.enableSounds}
                      onCheckedChange={(checked) => handlePreferenceChange('enableSounds', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div>
                      <h4 className="font-medium text-white">Compact View</h4>
                      <p className="text-sm text-[#a1a1c5]">
                        Use a more compact layout for better screen utilization
                      </p>
                    </div>
                    <Switch 
                      checked={preferences.compactView}
                      onCheckedChange={(checked) => handlePreferenceChange('compactView', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#161e2e] border-[#23263a]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="mr-2 text-[#6366f1]" />
                    Wallet Management
                  </CardTitle>
                  <CardDescription className="text-[#a1a1c5]">
                    Manage your connected wallet and crypto settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-white">Solana Wallet</h4>
                        <p className="text-sm text-[#a1a1c5]">
                          Your connected Solana wallet address
                        </p>
                      </div>
                      <Badge
                        className={`${
                          walletAddress
                            ? "bg-green-600/20 text-green-400 border-green-600"
                            : "bg-yellow-600/20 text-yellow-400 border-yellow-600"
                        }`}
                      >
                        {walletAddress ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>

                    {walletAddress && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#a1a1c5]">Address:</span>
                          <span className="text-sm font-mono text-white">
                            {walletAddress}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#a1a1c5]">Network:</span>
                          <span className="text-sm text-white">Solana Mainnet</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {walletAddress ? (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1 border-red-500 text-red-500 hover:bg-red-500/20"
                            onClick={handleRemoveWallet}
                          >
                            Disconnect Wallet
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCopyWalletAddress}
                            className="border-[#23263a] hover:bg-[#6366f1]/20"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="w-full bg-gradient-to-r from-[#6366f1] to-[#7f8fff]"
                          onClick={handleAddWallet}
                        >
                          Connect Wallet
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-[#0F0F2A] rounded-lg border border-[#23263a]">
                    <div className="flex items-center mb-3">
                      <Info className="w-5 h-5 text-blue-400 mr-2" />
                      <h4 className="font-medium text-white">Why connect a wallet?</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-[#a1a1c5]">
                      <li>• Buy and sell CS2 skins with HUCH tokens</li>
                      <li>• Manage your portfolio and track performance</li>
                      <li>• Access exclusive features and rewards</li>
                      <li>• Secure, decentralized transactions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}