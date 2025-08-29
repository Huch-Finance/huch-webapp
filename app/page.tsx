"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Wallet, ShoppingCart, Tag } from "lucide-react";
import Image from "next/image";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Connection, PublicKey } from "@solana/web3.js";
import { getUSDCBalance } from "@/lib/solana-utils";
import { getSolanaConnection } from "@/lib/solana-connection";
import { useHuchToken } from "@/hooks/use-huch-token";
import { Footer } from "@/components/organism/footer";

interface OwnedSkinItem {
  id: string;
  skinName: string;
  skinImage: string;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  profitLoss: number;
  profitLossPercentage: number;
  wear?: string;
  float?: number;
}

// Placeholder for owned skins data
const mockOwnedItems: OwnedSkinItem[] = [];

// Placeholder for transactions data
const mockData = {
  pnl: {
    "24h": { value: 0, percentage: 0 },
    "week": { value: 0, percentage: 0 },
    "month": { value: 0, percentage: 0 }
  },
  recentPurchases: [],
  recentSales: [],
  skinRankings: []
};

export default function Home() {
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [ownedItems, setOwnedItems] = useState<OwnedSkinItem[]>([]);
  const { wallets } = useSolanaWallets();
  const { balance: huchBalance, totalValue: huchValue } = useHuchToken();

  // Portfolio calculation functions from profile page
  const getTotalPortfolioValue = () => {
    return ownedItems.reduce((sum, item) => sum + item.currentPrice, 0);
  };

  const getTotalProfitLoss = () => {
    return ownedItems.reduce((sum, item) => sum + item.profitLoss, 0);
  };

  const getTotalProfitLossPercentage = () => {
    const totalPurchase = ownedItems.reduce((sum, item) => sum + item.purchasePrice, 0);
    const totalCurrent = ownedItems.reduce((sum, item) => sum + item.currentPrice, 0);
    if (totalPurchase === 0) return 0;
    return ((totalCurrent - totalPurchase) / totalPurchase) * 100;
  };

  // Fetch USDC balance
  useEffect(() => {
    const fetchSplBalance = async () => {
      if (!wallets?.[0]?.address) {
        setUsdcBalance(0);
        return;
      }

      try {
        const connection = new Connection(
          "https://api.mainnet-beta.solana.com",
          "confirmed",
        );
        
        const balance = await getUSDCBalance(connection, wallets[0].address);
        setUsdcBalance(balance);
      } catch (error) {
        console.error("Error fetching USDC balance:", error);
        setUsdcBalance(0);
      }
    };

    fetchSplBalance();
    const interval = setInterval(fetchSplBalance, 30000);
    return () => clearInterval(interval);
  }, [wallets]);

  // Load owned items
  useEffect(() => {
    // TODO: Fetch real data from API
    setOwnedItems([]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="max-w-7xl w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 font-poppins">Portfolio Dashboard</h1>
          <p className="text-[#a1a1c5]">Track your CS:GO skin investments and performance</p>
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* HUCH Token Balance */}
          <Card className="bg-gradient-to-br from-[#1a1b3a]/80 to-[#2d1b69]/80 border-[#6366f1]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#a1a1c5]">HUCH Token Balance</CardTitle>
              <Wallet className="h-4 w-4 text-[#6366f1]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{huchBalance.toLocaleString()} HUCH</div>
              <p className="text-xs text-[#a1a1c5] mt-1">≈ ${huchValue.toFixed(2)} USD</p>
            </CardContent>
          </Card>

          {/* Portfolio Value */}
          <Card className="bg-gradient-to-br from-[#1a1b3a]/80 to-[#2d1b69]/80 border-[#6366f1]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#a1a1c5]">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-[#10b981]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${getTotalPortfolioValue().toFixed(2)}</div>
              <p className="text-xs text-[#a1a1c5] mt-1">Total skin value</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction History and Skin Rankings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recent Transactions */}
          <Card className="bg-gradient-to-br from-[#1a1b3a]/80 to-[#2d1b69]/80 border-[#6366f1]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="purchases" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#2d1b69]/50">
                  <TabsTrigger value="purchases" className="text-white">Purchases</TabsTrigger>
                  <TabsTrigger value="sales" className="text-white">Sales</TabsTrigger>
                </TabsList>
                <TabsContent value="purchases" className="space-y-3 mt-4">
                  {mockData.recentPurchases.length === 0 ? (
                    <p className="text-[#a1a1c5] text-center py-4">No recent purchases</p>
                  ) : (
                    mockData.recentPurchases.map((purchase) => (
                    <div key={purchase.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20">
                      <Image
                        src={purchase.image}
                        alt={purchase.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{purchase.name}</p>
                        <p className="text-[#a1a1c5] text-xs">{purchase.date}</p>
                      </div>
                      <div className="text-[#10b981] font-bold">${purchase.price}</div>
                    </div>
                  ))
                  )}
                </TabsContent>
                <TabsContent value="sales" className="space-y-3 mt-4">
                  {mockData.recentSales.length === 0 ? (
                    <p className="text-[#a1a1c5] text-center py-4">No recent sales</p>
                  ) : (
                    mockData.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20">
                      <Image
                        src={sale.image}
                        alt={sale.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{sale.name}</p>
                        <p className="text-[#a1a1c5] text-xs">{sale.date}</p>
                      </div>
                      <div className="text-[#10b981] font-bold">${sale.price}</div>
                    </div>
                  ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Skin Rankings */}
          <Card className="bg-gradient-to-br from-[#1a1b3a]/80 to-[#2d1b69]/80 border-[#6366f1]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Top Skins by Value
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               {ownedItems
                 .sort((a, b) => b.currentPrice - a.currentPrice)
                 .slice(0, 5)
                 .map((skin, index) => (
                 <div key={skin.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#7f8fff]/10 border border-[#7f8fff]/20">
                   <div className="text-[#a1a1c5] font-bold text-sm w-6">#{index + 1}</div>
                   <Image
                     src={skin.skinImage}
                     alt={skin.skinName}
                     width={40}
                     height={40}
                     className="rounded object-cover"
                   />
                   <div className="flex-1">
                     <p className="text-white font-medium text-sm">{skin.skinName}</p>
                     <div className="flex items-center gap-2">
                       <span className="text-[#a1a1c5] text-xs">${skin.currentPrice}</span>
                       <Badge
                         variant={skin.profitLoss >= 0 ? "default" : "destructive"}
                         className="text-xs"
                       >
                         {skin.profitLoss >= 0 ? '+' : ''}{skin.profitLossPercentage.toFixed(1)}%
                       </Badge>
                     </div>
                   </div>
                 </div>
               ))}
            </CardContent>
          </Card>
        </motion.div>


        </div>
      </main>
      <Footer />
    </div>
  );
}
