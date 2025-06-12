"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/organism/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Clock, CreditCard, Gift, History, Trophy, Wallet, Settings, Copy, Check, AlertTriangle } from "lucide-react"
import { SteamAuthButton } from "@/components/auth/steam-auth-button"
import Link from "next/link"
import { Footer } from "@/components/organism/footer"
import { useAuth } from "@/hooks/use-auth"
import { useSolanaWallets, useSendTransaction } from '@privy-io/react-auth/solana';
import { LoadingOverlay } from "@/components/loading/loading-overlay"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"

export default function Profile() {
  const [activeTab, setActiveTab] = useState("wallet")
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [solBalance, setSolBalance] = useState<number>(0)
  const [splBalance, setSplBalance] = useState<number>(0)
  const { profile, isAuthenticated, isLoading } = useAuth()
  const { wallets } = useSolanaWallets()
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [withdrawAddress, setWithdrawAddress] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const { sendTransaction } = useSendTransaction();

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallets?.[0]?.address) {
        try {
          const connection = new Connection("https://api.devnet.solana.com", "confirmed")
          const publicKey = new PublicKey(wallets[0].address)
          const balance = await connection.getBalance(publicKey)
          setSolBalance(balance / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error("Error fetching balance:", error)
        }
      }
    }

    fetchBalance()
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [wallets])

  useEffect(() => {
    const fetchSplBalance = async () => {
      const walletAddress = "3HEwVsb9yARN3zazKDCjp4Fr2qkE5ZHNHUrKrmWAAVgb"
      const mintAddress = "4KNxmZizMom4v1HjwjnFqYa55LFyUBshHCAKs1UGvSSj"
      try {
        const connection = new Connection("https://api.devnet.solana.com", "confirmed")
        const accounts = await connection.getParsedTokenAccountsByOwner(
          new PublicKey(walletAddress),
          { programId: TOKEN_PROGRAM_ID }
        )
        const tokenAccount = accounts.value.find(
          (acc: any) => acc.account.data.parsed.info.mint === mintAddress
        )
        if (tokenAccount) {
          const amount = tokenAccount.account.data.parsed.info.tokenAmount
          setSplBalance(Number(amount.uiAmount))
        } else {
          setSplBalance(0)
        }
      } catch (error) {
        console.error("Error fetching SPL token balance:", error)
        setSplBalance(0)
      }
    }

    fetchSplBalance()
    const interval = setInterval(fetchSplBalance, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleCopyAddress = () => {
    if (wallets?.[0]?.address) {
      navigator.clipboard.writeText(wallets[0].address)
      setIsCopied(true)
      toast.success("Address copied to clipboard")
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#5D5FEF]/20 text-[#5D5FEF] border-[#5D5FEF]"
      case "repaid":
        return "bg-green-500/20 text-green-500 border-green-500"
      case "overdue":
        return "bg-red-500/20 text-red-500 border-red-500"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400"
    }
  }

  // Withdraw handler
  const handleWithdraw = async () => {
    if (!wallets?.[0]?.address || !withdrawAddress || !withdrawAmount) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsWithdrawing(true);
    try {
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const fromPubkey = new PublicKey(wallets[0].address);
      const toPubkey = new PublicKey(withdrawAddress);
      const lamports = Math.floor(Number(withdrawAmount) * LAMPORTS_PER_SOL);

      // Create the transaction
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      );

      // Fetch the recent blockhash and set it in the transaction
      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      tx.feePayer = fromPubkey;

      // Send the transaction
      const receipt = await sendTransaction({ transaction: tx, connection });
      await connection.confirmTransaction(receipt.signature, "confirmed");

      toast.success("Withdrawal successful!");
      setIsWithdrawOpen(false);
      setWithdrawAddress("");
      setWithdrawAmount("");
    } catch (e) {
      toast.error("Withdrawal failed: " + (e instanceof Error ? e.message : e));
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#111] text-white">
        <main className="flex-1 flex flex-col items-center justify-center">
          <LoadingOverlay 
            isLoading={isLoading} 
            message="Loading your profile..."
            opacity={0.7}
          />
          <Card className="bg-[#1E1E1E] border-[#2A2A2A] p-8 flex flex-col items-center">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-2">Please connect your wallet</CardTitle>
              <CardDescription className="text-gray-400 mb-4">You need to connect your wallet to view your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white">
                <Wallet className="mr-2" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
<<<<<<< HEAD
      <main className="flex-1 flex flex-col items-center justify-center">
        <LoadingOverlay 
          isLoading={isLoading} 
          message="Loading your profile..."
          opacity={0.7}
        />
        <section className="flex flex-1 items-center justify-center w-full">
          <div className="container mx-auto max-w-4xl flex flex-col items-center justify-center">
            <div className="flex flex-col md:flex-row gap-10 mt-[50px] mb-4 items-stretch justify-center w-full max-w-3xl mx-auto">
              {/* Profile Card */}
              <Card className="relative flex-1 bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md rounded-lg overflow-hidden flex flex-col min-h-[520px]">
                {/* Overlay grain */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 opacity-[.05]"
                  style={{
                    backgroundImage: "url('/grainbg.avif')",
                    backgroundRepeat: "repeat"
                  }}
                />
                {!profile?.steamId && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg p-4">
                    <AlertTriangle size={32} className="text-yellow-500 mb-2" />
                    <h3 className="text-lg font-medium text-white mb-1 text-center">Steam Account Required</h3>
                    <p className="text-sm text-gray-300 text-center mb-4">Connect your Steam account to access all features.</p>
                    <div className="scale-110">
                      <SteamAuthButton />
                    </div>
                  </div>
                )}
                <CardHeader className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-full bg-muted overflow-hidden mb-2">
                    <img src={profile?.avatar || "/avatars/logo-black.svg"} alt="Profile" className="w-full h-full object-cover bg-black" />
                  </div>
                  <CardTitle className="text-xl font-bold">{profile?.username || "Anonymous"}</CardTitle>
                  <div className="flex items-center gap-1 mb-2">
                    <Award className="text-amber-600" />
                    <span className="text-amber-600">New User</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-muted rounded-lg p-3 flex justify-between mb-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Rank</div>
                      <div className="font-bold">#-</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Points</div>
                      <div className="font-bold text-[#5D5FEF]">0</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Loans</div>
                      <div className="font-bold">0</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link href="/settings">
                      <Button variant="outline" className="w-full border-[#2A2A2A] text-gray-300 hover:text-white">
                        <Settings size={16} className="mr-2" />
                        Account Settings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs Card */}
              <Card className="relative flex-1 bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md rounded-lg overflow-hidden flex flex-col min-h-[520px]">
                {/* Overlay grain */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 opacity-[.05]"
                  style={{
                    backgroundImage: "url('/grainbg.avif')",
                    backgroundRepeat: "repeat"
                  }}
                />
                <Tabs defaultValue="wallet" value={activeTab} onValueChange={setActiveTab}>
                  <CardHeader className="pb-0">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger
                        value="wallet"
                        className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white"
                      >
                        <Wallet size={16} className="mr-2" />
                        Wallet
                      </TabsTrigger>
                      <TabsTrigger
                        value="history"
                        className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white"
                      >
                        <History size={16} className="mr-2" />
                        History
                      </TabsTrigger>
                      <TabsTrigger
                        value="badges"
                        className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white"
                      >
                        <Gift size={16} className="mr-2" />
                        Badges
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <TabsContent value="wallet" className="mt-0 animate-appear">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Carte SPL Token */}
                          <Card className="border-muted bg-[#23232a]">
                            <CardHeader className="pb-2">
                              <div className="flex items-center gap-2">
                                <img
                                  src="/usdc-logo.png" // Place l'image dans public/usdc-logo.png
                                  alt="USDC"
                                  className="w-5 h-5 rounded-full"
                                />
                                <span className="font-medium">USDC</span>
                                <span className="ml-auto text-xs text-gray-400">4KNx...vSSj</span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{splBalance.toFixed(2)} USDC</div>
                            </CardContent>
                          </Card>
                          {/* Carte Huch Coin */}
                          <Card className="border-muted bg-[#23232a]">
                            <CardHeader className="pb-2">
                              <div className="flex items-center gap-2">
                                <img
                                  src="/huch-coin.png" // Place l'image dans public/huch-coin.png
                                  alt="Huch Coin"
                                  className="w-7 h-7 rounded-full"
                                />
                                <span className="font-medium">Huch Point</span>
                                <span className="ml-auto text-xs text-gray-400">POINT</span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">0 POINT</div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="flex flex-col gap-3">
                          <Button 
                            className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white font-bold"
                            onClick={() => setIsDepositOpen(true)}
                          >
                            <Wallet className="mr-2" />
                            Deposit SOL
                          </Button>
                          <Button
                            variant="outline"
                            className="border-muted text-gray-400 hover:text-white hover:border-white"
                            onClick={() => setIsWithdrawOpen(true)}
                          >
                            <CreditCard className="mr-2" />
                            Withdraw SOL
                          </Button>
                        </div>

                        <Card className="p-0 bg-[#18181b] border border-muted">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="text-[#5D5FEF]" />
                              <span className="font-medium">Connected Wallet</span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {wallets?.[0] ? (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Address:</span>
                                  <span className="font-mono text-sm">
                                    {`${wallets[0].address.substring(0, 6)}...${wallets[0].address.substring(
                                      wallets[0].address.length - 4
                                    )}`}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Network:</span>
                                  <span className="font-bold">Solana Devnet</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-400">No wallet connected</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-0 animate-appear">
                      <Card className="bg-[#18181b] border border-muted">
                        <CardContent>
                          <div className="text-center py-8">
                            <p className="text-gray-400">No transaction history</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="badges" className="mt-0 animate-appear">
                      <Card className="bg-[#18181b] border border-muted">
                        <CardContent>
                          <div className="flex items-center justify-center py-8">
                            <p className="text-gray-400">No badges earned</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>
          </div>
=======
      <main className="flex-1 flex flex-col items-center justify-center w-full px-2 sm:px-0">
        <LoadingOverlay
          isLoading={isLoading}
          message="Loading your profile..."
          opacity={0.7}
        />
        <section className="w-full max-w-2xl mx-auto flex flex-col gap-6 mt-8 mb-8">
          {/* Profile Card */}
          <Card className="relative bg-[#0F0F2A]/70 border-[#FFFFFF] border-opacity-10 shadow-md rounded-lg overflow-hidden flex flex-col items-center p-6 pb-2 sm:pb-2">
            {/* Overlay grain */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 opacity-[.05]"
              style={{
                backgroundImage: "url('/grainbg.avif')",
                backgroundRepeat: "repeat",
              }}
            />

            {/* Settings icon: top-right of card on desktop (sidebar visible) */}
            <Link
              href="/settings"
              className="hidden lg:block"
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label="Account Settings"
                className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-transparent"
                style={{ width: 52, height: 52 }}
              >
                <Settings size={32} />
              </Button>
            </Link>

            {/* Profile picture with settings icon: top-right of picture on mobile (sidebar hidden) */}
            <div className="relative w-24 h-24 mb-2 mt-2">
              <img
                src={profile?.avatar || "/avatars/logo-black.svg"}
                alt="Profile"
                className="w-full h-full object-cover bg-black rounded-full"
              />
              <Link
                href="/settings"
                className="block lg:hidden"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Account Settings"
                  className="absolute -top-3 -right-5 z-20 text-gray-400 hover:text-white bg-transparent p-1"
                  // -top-3 moves it a bit higher, -right-5 moves it further right, and size below is increased
                  style={{ width: 40, height: 40 }}
                >
                  <Settings size={24} />
                </Button>
              </Link>
            </div>
            <CardTitle className="text-lg sm:text-xl font-bold text-center">
              {profile?.username || "Anonymous"}
            </CardTitle>
            <div className="flex items-center gap-1 mb-2">
              <Award className="text-amber-600" />
              <span className="text-amber-600 text-sm sm:text-base">New User</span>
            </div>
            {/* Responsive stats row: smaller but still horizontal */}
            <div className="w-full flex flex-row justify-between gap-2 bg-transparent rounded-lg px-2 mb-2 sm:p-3 sm:mb-4">
              <div className="text-center flex-1 min-w-0">
                <div className="text-xs sm:text-base text-gray-400 truncate">
                  Rank
                </div>
                <div className="font-bold text-lg sm:text-2xl">#-</div>
              </div>
              <div className="text-center flex-1 min-w-0">
                <div className="text-xs sm:text-base text-gray-400 truncate">
                  Points
                </div>
                <div className="font-bold text-lg sm:text-2xl text-[#5D5FEF]">
                  0
                </div>
              </div>
              <div className="text-center flex-1 min-w-0">
                <div className="text-xs sm:text-base text-gray-400 truncate">
                  Loans
                </div>
                <div className="font-bold text-lg sm:text-2xl">0</div>
              </div>
            </div>
            {/* Steam warning overlay (unchanged) */}
            {!profile?.steamId && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg p-4">
                <AlertTriangle size={32} className="text-yellow-500 mb-2" />
                <h3 className="text-lg font-medium text-white mb-1 text-center">
                  Steam Account Required
                </h3>
                <p className="text-sm text-gray-300 text-center mb-4">
                  Connect your Steam account to access all features.
                </p>
                <div className="scale-110">
                  <SteamAuthButton />
                </div>
              </div>
            )}
          </Card>

          {/* Tabs Card */}
          <Card className="relative bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md rounded-lg overflow-hidden flex flex-col w-full">
            {/* Overlay grain */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 opacity-[.05]"
              style={{
                backgroundImage: "url('/grainbg.avif')",
                backgroundRepeat: "repeat",
              }}
            />
            <Tabs
              defaultValue="wallet"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <CardHeader className="pb-0">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger
                    value="wallet"
                    className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white"
                  >
                    <Wallet size={16} className="mr-2" />
                    Wallet
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white"
                  >
                    <History size={16} className="mr-2" />
                    History
                  </TabsTrigger>
                  <TabsTrigger
                    value="badges"
                    className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white"
                  >
                    <Gift size={16} className="mr-2" />
                    Badges
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="wallet" className="mt-0 animate-appear">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* SPL Token Card */}
                      <Card className="border-muted bg-[#23232a]">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <img
                              src="/usdc-logo.png"
                              alt="USDC"
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="font-medium">USDC</span>
                            <span className="ml-auto text-xs text-gray-400">
                              4KNx...vSSj
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {splBalance.toFixed(2)} USDC
                          </div>
                        </CardContent>
                      </Card>
                      {/* Huch Coin Card */}
                      <Card className="border-muted bg-[#23232a]">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <img
                              src="/huch-coin.png"
                              alt="Huch Coin"
                              className="w-7 h-7 rounded-full"
                            />
                            <span className="font-medium">Huch Point</span>
                            <span className="ml-auto text-xs text-gray-400">
                              POINT
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">0 POINT</div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white font-bold"
                        onClick={() => setIsDepositOpen(true)}
                      >
                        <Wallet className="mr-2" />
                        Deposit SOL
                      </Button>
                      <Button
                        variant="outline"
                        className="border-muted text-gray-400 hover:text-white hover:border-white"
                        onClick={() => setIsWithdrawOpen(true)}
                      >
                        <CreditCard className="mr-2" />
                        Withdraw SOL
                      </Button>
                    </div>
                    <Card className="p-0 bg-[#18181b] border border-muted">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="text-[#5D5FEF]" />
                          <span className="font-medium">Connected Wallet</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {wallets?.[0] ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Address:</span>
                              <span className="font-mono text-sm">
                                {`${wallets[0].address.substring(0, 6)}...${wallets[0].address.substring(
                                  wallets[0].address.length - 4,
                                )}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Network:</span>
                              <span className="font-bold">Solana Devnet</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400">No wallet connected</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="mt-0 animate-appear">
                  <Card className="bg-[#18181b] border border-muted">
                    <CardContent>
                      <div className="text-center py-8">
                        <p className="text-gray-400">No transaction history</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="badges" className="mt-0 animate-appear">
                  <Card className="bg-[#18181b] border border-muted">
                    <CardContent>
                      <div className="flex items-center justify-center py-8">
                        <p className="text-gray-400">No badges earned</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
>>>>>>> b7ba232 (woip: profile page)
        </section>

        {/* Deposit Modal */}
        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
          <DialogContent className="sm:max-w-md bg-[#1E1E1E] border-[#2A2A2A]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Deposit SOL</DialogTitle>
              <DialogDescription className="text-gray-400">
                Send SOL to your wallet address below. Make sure to use the Solana Devnet network.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4 py-4">
              {wallets?.[0]?.address && (
                <>
                  <Card className="bg-white p-2 rounded-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallets[0].address}`}
                      alt="Wallet QR Code"
                      className="w-48 h-48"
                    />
                  </Card>
                  <Card className="w-full bg-[#23232a] border border-[#2A2A2A] p-0">
                    <CardContent className="flex items-center gap-2 p-3">
                      <code className="text-sm text-gray-300 flex-1 overflow-hidden text-ellipsis">
                        {wallets[0].address}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-white"
                        onClick={handleCopyAddress}
                      >
                        {isCopied ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </CardContent>
                  </Card>
                  <div className="text-sm text-gray-400 text-center">
                    <p>Minimum deposit: 0.1 SOL</p>
                    <p className="mt-1">Network: Solana Devnet</p>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Withdraw Modal */}
        <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
          <DialogContent className="sm:max-w-md bg-[#1E1E1E] border-[#2A2A2A]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Withdraw SOL</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter the destination address and amount to send SOL on Solana Devnet.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <input
                type="text"
                placeholder="Destination address"
                className="w-full p-3 rounded-lg bg-[#23232a] text-white border border-[#2A2A2A] focus:outline-none"
                value={withdrawAddress}
                onChange={e => setWithdrawAddress(e.target.value)}
                disabled={isWithdrawing}
              />
              <input
                type="number"
                min="0"
                step="0.0001"
                placeholder="Amount (SOL)"
                className="w-full p-3 rounded-lg bg-[#23232a] text-white border border-[#2A2A2A] focus:outline-none"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                disabled={isWithdrawing}
              />
              <Button
                className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white font-bold w-full mt-2"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? "Sending..." : "Send SOL"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  )
}
