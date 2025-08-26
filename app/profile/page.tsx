"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  Package,
} from "lucide-react";
import { Footer } from "@/components/organism/footer";
import { useAuth } from "@/hooks/use-auth";
import {
  useSolanaWallets,
} from "@privy-io/react-auth/solana";
import { useWallets } from "@privy-io/react-auth";
import { LoadingOverlay } from "@/components/loading/loading-overlay";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
} from "@solana/web3.js";
import { getUSDCBalance } from "@/lib/solana-utils";
import { getSolanaConnection } from "@/lib/solana-connection";
import Image from "next/image";

interface OwnedSkinShare {
  id: string;
  skinName: string;
  skinImage: string;
  totalShares: number;
  ownedShares: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  profitLoss: number;
  profitLossPercentage: number;
}

export default function Profile() {
  const [solBalance, setSolBalance] = useState<number>(0);
  const [splBalance, setSplBalance] = useState<number>(0);
  const [ownedShares, setOwnedShares] = useState<OwnedSkinShare[]>([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [shareFilter, setShareFilter] = useState<'all' | 'profit' | 'loss'>('all');
  
  const { profile, isAuthenticated, isLoading } = useAuth();
  const { wallets } = useSolanaWallets();
  const { wallets: allWallets } = useWallets();

  // Mock data for owned skin shares
  useEffect(() => {
    // In a real app, this would fetch from an API
    setOwnedShares([
      {
        id: '1',
        skinName: 'AWP | Dragon Lore',
        skinImage: '/awp.webp',
        totalShares: 100,
        ownedShares: 15,
        purchasePrice: 375, // 15 shares * $25
        currentPrice: 412.50, // 15 shares * $27.50
        purchaseDate: '2024-01-15',
        profitLoss: 37.50,
        profitLossPercentage: 10
      },
      {
        id: '2',
        skinName: 'Butterfly Knife | Fade',
        skinImage: '/btknife.png',
        totalShares: 100,
        ownedShares: 25,
        purchasePrice: 450, // 25 shares * $18
        currentPrice: 425, // 25 shares * $17
        purchaseDate: '2024-01-20',
        profitLoss: -25,
        profitLossPercentage: -5.56
      },
      {
        id: '3',
        skinName: 'AK-47 | Redline',
        skinImage: '/ak47-redline.png',
        totalShares: 100,
        ownedShares: 50,
        purchasePrice: 60, // 50 shares * $1.20
        currentPrice: 75, // 50 shares * $1.50
        purchaseDate: '2024-02-01',
        profitLoss: 15,
        profitLossPercentage: 25
      },
      {
        id: '4',
        skinName: 'M4A4 | Howl',
        skinImage: '/M4A4.png',
        totalShares: 100,
        ownedShares: 10,
        purchasePrice: 320, // 10 shares * $32
        currentPrice: 350, // 10 shares * $35
        purchaseDate: '2024-02-05',
        profitLoss: 30,
        profitLossPercentage: 9.375
      }
    ]);
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallets?.[0]?.address) {
        try {
          const connection = getSolanaConnection();
          const publicKey = new PublicKey(wallets[0].address);
          const balance = await connection.getBalance(publicKey);
          setSolBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [wallets]);

  useEffect(() => {
    const fetchSplBalance = async () => {
      if (!wallets?.[0]?.address) {
        setSplBalance(0);
        return;
      }

      try {
        const connection = new Connection(
          "https://api.devnet.solana.com",
          "confirmed",
        );
        
        const balance = await getUSDCBalance(connection, wallets[0].address);
        setSplBalance(balance);
      } catch (error) {
        console.error("Error fetching USDC balance:", error);
        setSplBalance(0);
      }
    };

    fetchSplBalance();
    const interval = setInterval(fetchSplBalance, 30000);
    return () => clearInterval(interval);
  }, [wallets]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawAddress) {
      toast.error("Please enter amount and address");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > splBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setWithdrawLoading(true);
    try {
      // Implement withdrawal logic here
      toast.success(`Successfully withdrawn ${amount} USDC!`);
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      setWithdrawAddress("");
    } catch (error: any) {
      console.error("Withdraw error:", error);
      toast.error(`Withdraw failed: ${error.message || 'Unknown error'}`);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleSetMaxWithdrawAmount = () => {
    setWithdrawAmount(splBalance.toFixed(2));
  };

  const getTotalPortfolioValue = () => {
    return ownedShares.reduce((sum, share) => sum + share.currentPrice, 0);
  };

  const getTotalProfitLoss = () => {
    return ownedShares.reduce((sum, share) => sum + share.profitLoss, 0);
  };

  const getTotalProfitLossPercentage = () => {
    const totalPurchase = ownedShares.reduce((sum, share) => sum + share.purchasePrice, 0);
    const totalCurrent = ownedShares.reduce((sum, share) => sum + share.currentPrice, 0);
    if (totalPurchase === 0) return 0;
    return ((totalCurrent - totalPurchase) / totalPurchase) * 100;
  };

  const filteredShares = ownedShares.filter(share => {
    if (shareFilter === 'all') return true;
    if (shareFilter === 'profit') return share.profitLoss > 0;
    if (shareFilter === 'loss') return share.profitLoss < 0;
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#111] text-white font-poppins">
        <main className="flex-1 flex flex-col items-center justify-center">
          <LoadingOverlay
            isLoading={isLoading}
            message="Loading your profile..."
            opacity={0.7}
          />
          <Card className="bg-[#1E1E1E] border-[#2A2A2A] p-8 flex flex-col items-center">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-2 font-poppins">
                Please connect your wallet
              </CardTitle>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white font-poppins">
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <LoadingOverlay
          isLoading={isLoading}
          message="Loading your profile..."
          opacity={0.7}
        />
        
        <div className="max-w-5xl mx-auto">
        <div className="text-left mb-6 sm:mb-8 font-poppins">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E1E1F5] font-poppins">
            Portfolio
          </h1>
        </div>

        {/* Profile Header */}
        <Card className="relative bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md rounded-lg overflow-hidden mb-6 sm:mb-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-5 opacity-[.05]"
            style={{
              backgroundImage: "url('/grainbg.avif')",
              backgroundRepeat: "repeat",
            }}
          />

          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={profile?.avatar || "/avatars/logo-black.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover bg-black"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white truncate font-poppins">
                    { wallets?.[0]?.address.concat().slice(0, 4) }...{ wallets?.[0]?.address.concat().slice(-4) }
                  </h2>
                  <p className="text-gray-400 text-sm font-poppins">Member since 2024</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 lg:flex">
                <div className="text-center font-poppins">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-poppins">${splBalance.toFixed(2)}</div>
                  <div className="text-gray-400 text-xs sm:text-sm whitespace-nowrap font-poppins">USDC Balance</div>
                </div>
                <div className="text-center font-poppins">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-poppins">${getTotalPortfolioValue().toFixed(2)}</div>
                  <div className="text-gray-400 text-xs sm:text-sm whitespace-nowrap font-poppins">Portfolio Value</div>
                </div>
                <div className="text-center font-poppins">
                  <div className={`text-lg sm:text-xl lg:text-2xl font-bold font-poppins ${getTotalProfitLoss() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {getTotalProfitLoss() >= 0 ? '+' : ''}{getTotalProfitLossPercentage().toFixed(2)}%
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm whitespace-nowrap font-poppins">Total P&L</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 w-full sm:w-auto font-poppins"
                onClick={() => setIsDepositOpen(true)}
              >
                <ArrowDownLeft size={16} />
                Deposit
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white hover:border-white flex items-center justify-center gap-2 w-full sm:w-auto font-poppins"
                onClick={() => setIsWithdrawOpen(true)}
              >
                <ArrowUpRight size={16} />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Owned Skin Shares Section */}
        <Card className="relative bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md rounded-lg overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-5 opacity-[.05]"
            style={{
              backgroundImage: "url('/grainbg.avif')",
              backgroundRepeat: "repeat",
            }}
          />
          
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl font-bold text-white font-poppins flex items-center gap-2">
                <Package size={20} />
                Owned Skin Shares
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All', count: ownedShares.length },
                  { key: 'profit', label: 'Profit', count: ownedShares.filter(s => s.profitLoss > 0).length },
                  { key: 'loss', label: 'Loss', count: ownedShares.filter(s => s.profitLoss < 0).length },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    className={`relative px-3 py-1.5 rounded-lg text-sm font-medium border backdrop-blur-md transition-all duration-300 hover:scale-105 font-poppins ${
                      shareFilter === filter.key
                        ? 'bg-white/15 border-white/30 text-white shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setShareFilter(filter.key as any)}
                  >
                    <span className="relative z-10">{filter.label}</span>
                    {filter.count > 0 && (
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-poppins ${
                        shareFilter === filter.key
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {filter.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredShares.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No skin shares found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredShares.map((share) => (
                  <Card key={share.id} className="bg-[#18181b] border-[#2a2a2a] overflow-hidden hover:border-[#6366f1] transition-colors">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={share.skinImage}
                            alt={share.skinName}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm truncate">{share.skinName}</h3>
                          <div className="mt-1 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Shares owned:</span>
                              <span className="text-white">{share.ownedShares}/{share.totalShares}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Purchase price:</span>
                              <span className="text-white">${share.purchasePrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Current value:</span>
                              <span className="text-white">${share.currentPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">P&L:</span>
                              <span className={share.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {share.profitLoss >= 0 ? '+' : ''}${Math.abs(share.profitLoss).toFixed(2)} ({share.profitLossPercentage >= 0 ? '+' : ''}{share.profitLossPercentage.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-1">
                            <div className="w-full bg-[#23263a] rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-[#6366f1] to-[#7f8fff] h-1.5 rounded-full"
                                style={{ width: `${(share.ownedShares / share.totalShares) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-gray-400">{((share.ownedShares / share.totalShares) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-[10px] text-gray-500">Purchased {new Date(share.purchaseDate).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-6 text-xs px-2 border-gray-600 hover:border-white">
                            Sell
                          </Button>
                          <Button size="sm" className="h-6 text-xs px-2 bg-[#6366f1] hover:bg-[#7f8fff]">
                            Buy More
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deposit Modal */}
        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
          <DialogContent className="sm:max-w-md bg-blue-950/20 backdrop-blur-md border-blue-400/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-poppins">Deposit SOL</DialogTitle>
              <DialogDescription className="text-gray-400 font-poppins">
                Send SOL to your wallet address. Use Solana Devnet network.
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
                  <div className="text-sm text-gray-400 text-center space-y-2 font-poppins">
                    <p>Network: Solana Devnet</p>
                    <div className="bg-blue-950/30 backdrop-blur-sm border border-blue-400/20 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 font-poppins">Solana Address:</p>
                      <p className="text-sm text-white font-poppins break-all">
                        {wallets[0].address}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-8 text-xs font-poppins"
                        onClick={() => {
                          navigator.clipboard.writeText(wallets[0].address);
                          toast.success("Address copied to clipboard!");
                        }}
                      >
                        Copy Address
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Withdraw Modal */}
        <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
          <DialogContent className="sm:max-w-md bg-blue-950/20 backdrop-blur-md border-blue-400/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-poppins">Withdraw USDC</DialogTitle>
              <DialogDescription className="text-gray-400 font-poppins">
                Withdraw your USDC to any Solana address.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="p-3 bg-blue-950/30 backdrop-blur-sm border border-blue-400/20 rounded-lg">
                <div className="text-sm text-gray-400 font-poppins">Available Balance</div>
                <div className="text-lg font-bold text-white font-poppins">
                  ${splBalance.toFixed(2)} USDC
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={splBalance}
                  placeholder="Amount to withdraw (USDC)"
                  className="w-full p-3 pr-16 rounded-lg bg-blue-950/30 backdrop-blur-sm text-white border border-blue-400/20 focus:border-blue-400/40 focus:outline-none font-poppins"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={withdrawLoading}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-2 text-xs border-gray-500 text-gray-300 hover:text-white hover:border-white font-poppins"
                  onClick={handleSetMaxWithdrawAmount}
                  disabled={withdrawLoading}
                >
                  MAX
                </Button>
              </div>

              <input
                type="text"
                placeholder="Destination Solana address"
                className="w-full p-3 rounded-lg bg-blue-950/30 backdrop-blur-sm text-white border border-blue-400/20 focus:border-blue-400/40 focus:outline-none font-poppins"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                disabled={withdrawLoading}
              />
              
              <Button
                className="bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-md border border-blue-400/30 hover:border-blue-400/50 text-white font-bold w-full mt-2 transition-all duration-300 font-poppins"
                onClick={handleWithdraw}
                disabled={withdrawLoading || !withdrawAmount || !withdrawAddress}
              >
                {withdrawLoading ? "Processing..." : "Withdraw USDC"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}