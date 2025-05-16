"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/organism/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Clock, CreditCard, Gift, History, Trophy, Wallet, Settings, Copy, Check } from "lucide-react"
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

export default function Profile() {
  const [activeTab, setActiveTab] = useState("wallet")
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [solBalance, setSolBalance] = useState<number>(0)
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
      <main className="min-h-screen flex flex-col bg-gradient-to-b from-[#0f0f13] to-[#1a1a1f]">
        <Navbar />
        <LoadingOverlay 
          isLoading={isLoading} 
          message="Loading your profile..."
          opacity={0.7}
        />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
            <p className="text-gray-400 mb-6">You need to connect your wallet to view your profile</p>
            <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white">
              <Wallet className="mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-[#0f0f13] to-[#1a1a1f]">
      <Navbar />
      <LoadingOverlay 
        isLoading={isLoading} 
        message="Loading your profile..."
        opacity={0.7}
      />
      <section className="pt-24 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Profile Card */}
            <Card className="border-muted bg-[#1E1E1E] md:w-1/3">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-muted overflow-hidden mb-4">
                    <img src={profile?.avatar || "/avatars/logo-black.svg"} alt="Profile" className="w-full h-full object-cover bg-black" />
                  </div>

                  <h2 className="text-xl font-bold mb-1">{profile?.username || "Anonymous"}</h2>

                  <div className="flex items-center gap-1 mb-4">
                    <Award className="text-amber-600" />
                    <span className="text-amber-600">New User</span>
                  </div>

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
                </div>
              </CardContent>
            </Card>

            {/* Tabs Card */}
            <Card className="border-muted bg-[#1E1E1E] flex-1">
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
                        <Card className="border-muted bg-[#1E1E1E]">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <CreditCard className="text-[#5D5FEF]" />
                                <span className="font-medium">USD</span>
                              </div>
                              <div className="text-xs text-gray-400">USDC</div>
                            </div>
                            <div className="text-2xl font-bold">{solBalance.toFixed(4)} USDC</div>
                          </CardContent>
                        </Card>

                        <Card className="border-muted bg-[#1E1E1E]">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Trophy className="text-[#5D5FEF]" />
                                <span className="font-medium">Huch Coins</span>
                              </div>
                              <div className="text-xs text-gray-400">Points</div>
                            </div>
                            <div className="text-2xl font-bold">0</div>
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

                      <div className="p-4 bg-muted rounded-lg border border-muted">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="text-[#5D5FEF]" />
                          <span className="font-medium">Connected Wallet</span>
                        </div>

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
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-0 animate-appear">
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <p className="text-gray-400">No transaction history</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="badges" className="mt-0 animate-appear">
                    <div className="flex items-center justify-center py-8">
                      <p className="text-gray-400">No badges earned</p>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

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
                <div className="w-48 h-48 bg-white p-2 rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallets[0].address}`}
                    alt="Wallet QR Code"
                    className="w-full h-full"
                  />
                </div>
                <div className="w-full">
                  <div className="flex items-center gap-2 bg-[#2A2A2A] p-3 rounded-lg">
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
                  </div>
                </div>
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
  )
}
