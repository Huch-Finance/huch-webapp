"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Image as ImageIcon,
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
import { getSolanaBalanceWithFallback } from "@/lib/solana-connection";
import { useHuchOracle } from "@/hooks/use-huch-oracle";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { useNFTs } from "@/hooks/use-nfts";


export default function Profile() {
  const [solBalance, setSolBalance] = useState<number>(0);
  const [splBalance, setSplBalance] = useState<number>(0);
  const { 
    balance: huchBalance, 
    price: huchPrice,
    fetchBalance: refreshHuchBalance,
    formatHuchAmount,
    formatUsdAmount
  } = useHuchOracle();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  
  const { profile, isAuthenticated, isLoading } = useAuth();
  const { wallets } = useSolanaWallets();
  const { wallets: allWallets } = useWallets();
  const { nfts, loading: nftsLoading, error: nftsError, refetch: refetchNFTs } = useNFTs();

  // NFTs are already loaded via useNFTs hook

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallets?.[0]?.address) {
        try {
          const publicKey = new PublicKey(wallets[0].address);
          const balance = await getSolanaBalanceWithFallback(publicKey);
          
          if (balance !== null) {
            setSolBalance(balance / LAMPORTS_PER_SOL);
          } else {
            console.warn("Could not fetch SOL balance from any endpoint");
            setSolBalance(0); // Set to 0 as fallback
          }
        } catch (error) {
          console.error("Error fetching balance:", error);
          setSolBalance(0); // Set to 0 as fallback
        }
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [wallets]);

  // Refresh HUCH balance when wallet connects
  useEffect(() => {
    if (wallets?.[0]?.address && refreshHuchBalance) {
      refreshHuchBalance(wallets[0].address);
    }
  }, [wallets, refreshHuchBalance]);

  useEffect(() => {
    const fetchSplBalance = async () => {
      if (!wallets?.[0]?.address) {
        setSplBalance(0);
        return;
      }

      try {
        const connection = new Connection(
          "https://api.mainnet-beta.solana.com",
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

  // Portfolio calculations based on NFTs
  const getTotalPortfolioValue = () => {
    return nfts.reduce((sum, nft) => {
      const marketValue = nft.attributes?.find(attr => 
        attr.trait_type?.toLowerCase() === 'market value' || 
        attr.trait_type?.toLowerCase() === 'market_value'
      );
      return sum + (marketValue ? parseFloat(marketValue.value.toString()) : 0);
    }, 0);
  };

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
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Image
                      src="/logo.png"
                      alt="Huch Logo"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-poppins">
                      {huchBalance ? formatHuchAmount(huchBalance.balance) : '0.00'} HUCH
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm whitespace-nowrap font-poppins">
                    {huchBalance ? formatUsdAmount(huchBalance.usdValue) : '$0.00'}
                  </div>
                  {huchPrice && (
                    <div className="text-gray-500 text-xs font-poppins">
                      1 HUCH = ${huchPrice.priceUsd.toFixed(4)}
                    </div>
                  )}
                </div>
                <div className="text-center font-poppins">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-poppins">${getTotalPortfolioValue().toFixed(2)}</div>
                  <div className="text-gray-400 text-xs sm:text-sm whitespace-nowrap font-poppins">Portfolio Value</div>
                </div>
                <div className="text-center font-poppins">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold font-poppins text-blue-400">
                    {nfts.length}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm whitespace-nowrap font-poppins">NFTs Owned</div>
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
              <Button
                className="bg-[#6366f1] hover:bg-[#7c7ff3] text-white flex items-center justify-center gap-2 w-full sm:w-auto font-poppins transition-all"
                onClick={() => window.open('https://raydium.io/swap/?inputMint=sol&outputMint=B8zW7B8T7ntCiiRYw18jrFu9MBqMZVk9pP7nYyT5iBLV', '_blank')}
              >
                <ExternalLink size={16} />
                Buy HUCH
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CS2 Skins Collection */}
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
                  CS2 Skins Collection
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetchNFTs()}
                  disabled={nftsLoading}
                  className="font-poppins"
                >
                  {nftsLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {nftsLoading ? (
                <div className="text-center py-8 text-gray-400">
                  Loading NFTs...
                </div>
              ) : nftsError ? (
                <div className="text-center py-8 text-gray-400">
                  {nftsError}
                </div>
              ) : nfts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No NFTs found in your collection
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {nfts.map((nft) => (
                    <Card key={nft.id} className="bg-[#18181b] border-[#2a2a2a] overflow-hidden hover:border-[#6366f1] transition-colors">
                      <CardContent className="p-4">
                        <div className="aspect-square relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-lg overflow-hidden mb-3">
                          {nft.image ? (
                            <Image
                              src={nft.image}
                              alt={nft.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={48} className="text-gray-600" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-white text-sm truncate mb-1">{nft.name}</h3>
                        {nft.description && (
                          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{nft.description}</p>
                        )}
                        {nft.attributes && nft.attributes.length > 0 && (
                          <div className="space-y-1">
                            {nft.attributes.slice(0, 3).map((attr, index) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span className="text-gray-500">{attr.trait_type}:</span>
                                <span className="text-gray-300">{attr.value}</span>
                              </div>
                            ))}
                            {nft.attributes.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{nft.attributes.length - 3} more attributes
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Deposit Modal */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="sm:max-w-md bg-blue-950/20 backdrop-blur-md border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-poppins">Deposit SOL</DialogTitle>
            <DialogDescription className="text-gray-400 font-poppins">
              Send SOL to your wallet address. Use Solana Mainnet network.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {wallets?.[0]?.address && (
              <>
                <div className="w-48 h-48 bg-white p-2 rounded-lg">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallets[0].address}`}
                    alt="Wallet QR Code"
                    width={200}
                    height={200}
                    className="w-full h-full"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2 font-poppins">Your Wallet Address:</p>
                  <p className="text-xs bg-gray-800/50 p-2 rounded font-mono break-all">
                    {wallets[0].address}
                  </p>
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
              Withdraw USDC to an external Solana address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              placeholder="Amount to withdraw"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white font-poppins"
              disabled={withdrawLoading}
            />
            <Input
              type="text"
              placeholder="Recipient Solana address"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white font-poppins"
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
      <Footer />
    </div>
  );
}
