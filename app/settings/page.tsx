"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomSwitch as Switch } from "@/components/ui/custom-switch"
import { Label } from "@/components/ui/label"
import { CyberpunkContainer } from "@/components/cyberpunk-container"
import {
  User,
  Shield,
  Bell,
  Wallet,
  ComputerIcon as Steam,
  Smartphone,
  ExternalLink,
  Save,
  Check,
  Info,
  Mail,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { usePrivy } from "@privy-io/react-auth"
import { Footer } from "@/components/footer"

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile")
  const [steamID, setSteamID] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { profile, updateProfile, isAuthenticated, isLoading } = useAuth()
  const { user, linkEmail, linkWallet, unlinkEmail, unlinkWallet } = usePrivy()

  useEffect(() => {
    if (profile) {
      setSteamID(profile.steamId || "")
      setUsername(profile.username || "")
      setEmail(profile.email || "")
      setWalletAddress(profile.wallet || "")
    }
  }, [profile])

  const handleSave = async () => {
    if (!isAuthenticated) return

    setIsSaving(true)
    try {
      const success = await updateProfile({
        steamId: steamID,
        username,
      })

      if (success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-b from-[#0f0f13] to-[#1a1a1f] relative z-10">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-[#5D5FEF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your settings...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-b from-[#0f0f13] to-[#1a1a1f] relative z-10">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-400 mb-6">You need to be logged in to access your account settings.</p>
            <Button onClick={() => (window.location.href = "/")} className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white">
              Return to Home
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-[#0f0f13] to-[#1a1a1f] relative z-10">
      <div className="scanlines"></div>
      <Navbar />

      <section className="pt-24 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">
            Account <span className="text-[#5D5FEF] neon-text">Settings</span>
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full bg-[#1E1E1E] p-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white">
                <User size={16} className="mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white">
                <Shield size={16} className="mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white"
                className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white"
              >
                <Bell size={16} className="mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="wallet" className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white">
                <Wallet size={16} className="mr-2" />
                Wallet
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 text-[#5D5FEF]" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details and how we can reach you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="HuchFan."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-[#2A2A2A] border-[#2A2A2A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-[#2A2A2A] border-[#2A2A2A]"
                        disabled={true}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      placeholder="Tell us about yourself"
                      className="w-full h-24 px-3 py-2 rounded-md bg-[#2A2A2A] border border-[#2A2A2A] text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#5D5FEF]"
                      defaultValue="CS2 enthusiast and skin collector since 2015."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#2A2A2A] overflow-hidden">
                        <img
                          src={profile?.avatar || "/avatars/logo-black.svg?height=100&width=100"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button variant="outline" className="border-[#2A2A2A] text-gray-300 hover:text-white">
                        Change Avatar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <CyberpunkContainer>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center">
                    <Steam className="mr-2 text-[#5D5FEF]" />
                    Steam Connection
                  </CardTitle>
                  <CardDescription>Link your Steam account to access your CS2 inventory</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="steamid">Steam ID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="steamid"
                        placeholder="Your current Steam ID : 76561198858784909 (Dornag0x)"
                        value={steamID}
                        onChange={(e) => setSteamID(e.target.value)}
                        className="bg-[#2A2A2A] border-[#2A2A2A]"
                      />
                      <Button variant="outline" className="border-[#5D5FEF] text-[#5D5FEF] hover:bg-[#5D5FEF]/20">
                        <ExternalLink size={16} className="mr-2" />
                        Verify
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 bg-[#2A2A2A]/50 rounded-lg flex items-start gap-2">
                    <Info size={16} className="text-[#5D5FEF] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-400">
                      Connecting your Steam account allows us to access your CS2 inventory for collateral. We never
                      store your Steam credentials.
                    </p>
                  </div>
                </CardContent>
              </CyberpunkContainer>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white" disabled={isSaving}>
                  {saveSuccess ? (
                    <>
                      <Check size={16} className="mr-2" />
                      Saved!
                    </>
                  ) : isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 text-[#5D5FEF]" />
                    Email Authentication
                  </CardTitle>
                  <CardDescription>Manage your email authentication methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{email || "No email connected"}</h4>
                      <p className="text-sm text-gray-400">Your primary email address</p>
                    </div>
                    {email ? (
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500/20"
                        onClick={() => unlinkEmail()}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white" onClick={() => linkEmail()}>
                        Connect Email
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
                  <CardDescription>Connect your crypto wallet for authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        {walletAddress
                          ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                          : "No wallet connected"}
                      </h4>
                      <p className="text-sm text-gray-400">Your connected wallet</p>
                    </div>
                    {walletAddress ? (
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500/20"
                        onClick={() => unlinkWallet(walletAddress)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white" onClick={() => linkWallet()}>
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="mr-2 text-[#5D5FEF]" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Authentication</h4>
                      <p className="text-sm text-gray-400">Receive a code via email when logging in</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Authenticator App</h4>
                      <p className="text-sm text-gray-400">Use an authenticator app to generate codes</p>
                    </div>
                    <Switch />
                  </div>
                  <Button variant="outline" className="border-[#2A2A2A] text-gray-300 hover:text-white">
                    Set Up Authenticator
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 text-[#5D5FEF]" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Manage how and when we contact you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Email Notifications</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="loan-updates" className="flex-1">
                          Loan Updates
                          <p className="text-sm font-normal text-gray-400">Receive updates about your active loans</p>
                        </Label>
                        <Switch id="loan-updates" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="payment-reminders" className="flex-1">
                          Payment Reminders
                          <p className="text-sm font-normal text-gray-400">Get reminders before loan due dates</p>
                        </Label>
                        <Switch id="payment-reminders" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="marketing" className="flex-1">
                          Marketing & Promotions
                          <p className="text-sm font-normal text-gray-400">
                            Receive news about special offers and events
                          </p>
                        </Label>
                        <Switch id="marketing" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Push Notifications</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-loan" className="flex-1">
                          Loan Status Changes
                          <p className="text-sm font-normal text-gray-400">
                            Get notified when your loan status changes
                          </p>
                        </Label>
                        <Switch id="push-loan" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-security" className="flex-1">
                          Security Alerts
                          <p className="text-sm font-normal text-gray-400">Receive alerts about security events</p>
                        </Label>
                        <Switch id="push-security" defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet" className="space-y-6">
              <CyberpunkContainer>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center">
                    <Wallet className="mr-2 text-[#5D5FEF]" />
                    Wallet Connection
                  </CardTitle>
                  <CardDescription>Connect your crypto wallet to receive and repay loans</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-4">
                  <div className="p-4 bg-[#2A2A2A] rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">Connected Wallet</h4>
                        <p className="text-sm text-gray-400">Your current wallet address</p>
                      </div>
                      <Badge
                        className={`${walletAddress ? "bg-green-600/20 text-green-400 border-green-600" : "bg-yellow-600/20 text-yellow-400 border-yellow-600"}`}
                      >
                        {walletAddress ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={walletAddress || "No wallet connected"}
                        className="bg-[#1E1E1E] border-[#2A2A2A] font-mono text-sm"
                        readOnly
                      />
                      {walletAddress ? (
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500/20"
                          onClick={() => unlinkWallet(walletAddress)}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white" onClick={() => linkWallet()}>
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-[#2A2A2A]/50 rounded-lg mb-4">
                    <h4 className="font-medium mb-2">Deposit Information</h4>
                    <p className="text-sm text-gray-400">
                      You can deposit funds to your wallet using any of the supported networks below. Deposits are
                      typically processed within 5-10 minutes, depending on network congestion. A minimum deposit of 10
                      USDC is required.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#5D5FEF]">
                      <Info size={14} />
                      <span>Funds will be available for borrowing immediately after confirmation.</span>
                    </div>
                  </div>

                  

                  <div className="p-3 bg-[#2A2A2A]/50 rounded-lg flex items-start gap-2">
                    <Info size={16} className="text-[#5D5FEF] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-400">
                      Your wallet is used to receive loan funds and make repayments. We support multiple networks for
                      your convenience. All transactions are secured by blockchain technology.
                    </p>
                  </div>
                </CardContent>
              </CyberpunkContainer>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </main>
  )
}
