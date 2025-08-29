"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet } from "lucide-react";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Connection, PublicKey } from "@solana/web3.js";
import { getUSDCBalanceWithFallback } from "@/lib/solana-utils";
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
        const balance = await getUSDCBalanceWithFallback(wallets[0].address);
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
      <main className="flex-1 p-4 flex items-center justify-center">
        <div className="max-w-6xl w-full space-y-4">
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
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* HUCH Token Balance */}
          <Card className="bg-[#161e2e] border-[#23263a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#a1a1c5]">HUCH Token Balance</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-[#6366f1] to-[#7f8fff] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">H</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{huchBalance.toFixed(4)} HUCH</div>
              <p className="text-xs text-[#a1a1c5] mt-1">≈ ${huchValue.toFixed(2)} USD</p>
            </CardContent>
          </Card>

          {/* Portfolio Value */}
          <Card className="bg-[#161e2e] border-[#23263a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#a1a1c5]">Portfolio Value</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-[#10b981] to-[#34d399] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">₽</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${getTotalPortfolioValue().toFixed(2)}</div>
              <p className="text-xs text-[#a1a1c5] mt-1">Total skin value</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vault Ownership Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-[#161e2e] border-[#23263a]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Vault Ownership
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#a1a1c5] text-sm">Your vault ownership</span>
                <span className="text-white font-bold">{((getTotalPortfolioValue() / 10000) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#23263a] rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-[#6366f1] to-[#7f8fff] h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((getTotalPortfolioValue() / 10000) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-[#a1a1c5]">
                <span>0%</span>
                <span>100%</span>
              </div>
              <p className="text-xs text-[#a1a1c5] mt-2">
                Based on ${getTotalPortfolioValue().toFixed(2)} / $10,000 total vault value
              </p>
            </CardContent>
          </Card>
        </motion.div>


        </div>
      </main>
      <Footer />
    </div>
  );
}
