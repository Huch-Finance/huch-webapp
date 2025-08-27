"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Wallet, ShoppingCart, Tag } from "lucide-react";
import Image from "next/image";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Connection, PublicKey } from "@solana/web3.js";
import { getUSDCBalance } from "@/lib/solana-utils";
import { getSolanaConnection } from "@/lib/solana-connection";

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

// Mock data for owned skins - same as profile page
const mockOwnedItems: OwnedSkinItem[] = [
  {
    id: '1a',
    skinName: 'AWP | Dragon Lore',
    skinImage: '/awp.webp',
    purchasePrice: 2500,
    currentPrice: 2750,
    purchaseDate: '2024-01-14',
    profitLoss: 250,
    profitLossPercentage: 10,
    wear: 'Factory New',
    float: 0.0234
  },
  {
    id: '1b',
    skinName: 'AWP | Dragon Lore',
    skinImage: '/awp.webp',
    purchasePrice: 2500,
    currentPrice: 2750,
    purchaseDate: '2024-01-19',
    profitLoss: 250,
    profitLossPercentage: 10,
    wear: 'Factory New',
    float: 0.0234
  },
  {
    id: '2a',
    skinName: 'Butterfly Knife | Fade',
    skinImage: '/btknife.png',
    purchasePrice: 1800,
    currentPrice: 1700,
    purchaseDate: '2024-01-19',
    profitLoss: -100,
    profitLossPercentage: -5.56,
    wear: 'Minimal Wear',
    float: 0.1267
  },
  {
    id: '2b',
    skinName: 'Butterfly Knife | Fade',
    skinImage: '/btknife.png',
    purchasePrice: 1800,
    currentPrice: 1700,
    purchaseDate: '2024-01-20',
    profitLoss: -100,
    profitLossPercentage: -5.56,
    wear: 'Minimal Wear',
    float: 0.1267
  },
  {
    id: '2c',
    skinName: 'Butterfly Knife | Fade',
    skinImage: '/btknife.png',
    purchasePrice: 1800,
    currentPrice: 1700,
    purchaseDate: '2024-01-21',
    profitLoss: -100,
    profitLossPercentage: -5.56,
    wear: 'Minimal Wear',
    float: 0.1267
  },
  {
    id: '3a',
    skinName: 'AK-47 | Redline',
    skinImage: '/ak47-redline.png',
    purchasePrice: 120,
    currentPrice: 150,
    purchaseDate: '2024-01-31',
    profitLoss: 30,
    profitLossPercentage: 25,
    wear: 'Field-Tested',
    float: 0.2834
  },
  {
    id: '3b',
    skinName: 'AK-47 | Redline',
    skinImage: '/ak47-redline.png',
    purchasePrice: 120,
    currentPrice: 150,
    purchaseDate: '2024-02-01',
    profitLoss: 30,
    profitLossPercentage: 25,
    wear: 'Field-Tested',
    float: 0.2834
  },
  {
    id: '3c',
    skinName: 'AK-47 | Redline',
    skinImage: '/ak47-redline.png',
    purchasePrice: 120,
    currentPrice: 150,
    purchaseDate: '2024-02-02',
    profitLoss: 30,
    profitLossPercentage: 25,
    wear: 'Field-Tested',
    float: 0.2834
  },
  {
    id: '3d',
    skinName: 'AK-47 | Redline',
    skinImage: '/ak47-redline.png',
    purchasePrice: 120,
    currentPrice: 150,
    purchaseDate: '2024-02-02',
    profitLoss: 30,
    profitLossPercentage: 25,
    wear: 'Field-Tested',
    float: 0.2834
  },
  {
    id: '3e',
    skinName: 'AK-47 | Redline',
    skinImage: '/ak47-redline.png',
    purchasePrice: 120,
    currentPrice: 150,
    purchaseDate: '2024-02-02',
    profitLoss: 30,
    profitLossPercentage: 25,
    wear: 'Field-Tested',
    float: 0.2834
  },
  {
    id: '4a',
    skinName: 'M4A4 | Howl',
    skinImage: '/M4A4.png',
    purchasePrice: 3200,
    currentPrice: 3500,
    purchaseDate: '2024-02-04',
    profitLoss: 300,
    profitLossPercentage: 9.375,
    wear: 'Well-Worn',
    float: 0.4125
  }
];

// Mock data for recent transactions
const mockData = {
  pnl: {
    "24h": { value: 1250.75, percentage: 1.42 },
    "week": { value: -890.30, percentage: -0.98 },
    "month": { value: 4320.80, percentage: 5.06 }
  },
  recentPurchases: [
    { id: 1, name: "AK-47 | Redline", price: 125.50, date: "2024-01-15", image: "/ak47-redline.png" },
    { id: 2, name: "AWP | Dragon Lore", price: 2500.00, date: "2024-01-14", image: "/awp.webp" },
    { id: 3, name: "Karambit | Fade", price: 1850.75, date: "2024-01-13", image: "/karambit.webp" }
  ],
  recentSales: [
    { id: 1, name: "M4A4 | Howl", price: 3200.00, date: "2024-01-12", image: "/M4A4.png" },
    { id: 2, name: "Butterfly Knife", price: 890.25, date: "2024-01-11", image: "/btknife.png" }
  ],
  skinRankings: [
    { id: 1, name: "AWP | Dragon Lore", value: 2500.00, change: 2.5, image: "/awp.webp" },
    { id: 2, name: "Karambit | Fade", value: 1850.75, change: -1.2, image: "/karambit.webp" },
    { id: 3, name: "AK-47 | Redline", value: 125.50, change: 0.8, image: "/ak47-redline.png" }
  ]
};

export default function Home() {
  const [pnlPeriod, setPnlPeriod] = useState<"24h" | "week" | "month">("24h");
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [ownedItems, setOwnedItems] = useState<OwnedSkinItem[]>([]);
  const { wallets } = useSolanaWallets();
  
  const currentPnl = mockData.pnl[pnlPeriod];

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
          "https://api.devnet.solana.com",
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
    setOwnedItems(mockOwnedItems);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* USDC Balance */}
          <Card className="bg-gradient-to-br from-[#1a1b3a]/80 to-[#2d1b69]/80 border-[#6366f1]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#a1a1c5]">USDC Balance</CardTitle>
              <Wallet className="h-4 w-4 text-[#6366f1]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${usdcBalance.toFixed(2)}</div>
              <p className="text-xs text-[#a1a1c5] mt-1">Available for trading</p>
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

          {/* P&L */}
          <Card className="bg-gradient-to-br from-[#1a1b3a]/80 to-[#2d1b69]/80 border-[#6366f1]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#a1a1c5]">P&L ({pnlPeriod})</CardTitle>
              {currentPnl.value >= 0 ? (
                <TrendingUp className="h-4 w-4 text-[#10b981]" />
              ) : (
                <TrendingDown className="h-4 w-4 text-[#ef4444]" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                 getTotalProfitLoss() >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
               }`}>
                 {getTotalProfitLoss() >= 0 ? '+' : ''}${getTotalProfitLoss().toFixed(2)}
               </div>
               <div className="flex items-center gap-2 mt-1">
                 <Badge variant={getTotalProfitLoss() >= 0 ? "default" : "destructive"} className="text-xs">
                   {getTotalProfitLoss() >= 0 ? '+' : ''}{getTotalProfitLossPercentage().toFixed(2)}%
                 </Badge>
                <div className="flex gap-1">
                  {(['24h', 'week', 'month'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={pnlPeriod === period ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPnlPeriod(period)}
                      className="h-6 px-2 text-xs"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
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
                  {mockData.recentPurchases.map((purchase) => (
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
                  ))}
                </TabsContent>
                <TabsContent value="sales" className="space-y-3 mt-4">
                  {mockData.recentSales.map((sale) => (
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
                  ))}
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

        {/* Market Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-[#1a1b3a]/80 to-[#2d1b69]/80 border-[#6366f1]/20">
            <CardHeader>
              <CardTitle className="text-white">Portfolio Value Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-[#6366f1]/30 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-[#6366f1] mx-auto mb-2" />
                  <p className="text-[#a1a1c5]">Portfolio value chart will be implemented here</p>
                  <p className="text-[#a1a1c5] text-sm">Showing historical performance of your skin portfolio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
