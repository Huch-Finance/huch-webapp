"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { CyberpunkContainer } from "@/components/layout/cyberpunk-container";
import { RefreshCw, AlertTriangle, Database, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Footer } from "@/components/organism/footer";
import { LiquidationControls } from "@/components/admin/liquidation-controls";

export default function AdminPage() {
  const [priceRefreshLoading, setPriceRefreshLoading] = useState(false);
  const [borrowDebugLoading, setBorrowDebugLoading] = useState(false);
  const [borrowDebugId, setBorrowDebugId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const { profile, getPrivyAccessToken } = useAuth();

  const handleRefreshPrices = async () => {
    setPriceRefreshLoading(true);
    setMessage(null);
    
    try {
      // Get access token for secure authentication
      const token = await getPrivyAccessToken()
      if (!token) {
        setMessage("No access token available")
        return
      }

      const res = await fetch("http://localhost:3333/api/admin/refresh-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Prix rafraîchis avec succès ! ${data.itemsUpdated} items mis à jour.`);
      } else {
        setMessage(data.error || "Erreur lors du rafraîchissement des prix.");
      }
    } catch (e) {
      setMessage("Erreur lors du rafraîchissement des prix.");
    }
    setPriceRefreshLoading(false);
  };

  const handleDebugBorrowState = async () => {
    setBorrowDebugLoading(true);
    setMessage(null);
    
    try {
      // Get access token for secure authentication
      const token = await getPrivyAccessToken()
      if (!token) {
        setMessage("No access token available")
        return
      }

      const res = await fetch("http://localhost:3333/api/admin/debug-borrow-state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ borrowId: borrowDebugId })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Debug borrow state completed for ${borrowDebugId}. Check the server console for detailed logs.`);
        setBorrowDebugId("");
      } else {
        setMessage(data.error || "Erreur lors du debug du borrow state.");
      }
    } catch (e) {
      setMessage("Erreur lors du debug du borrow state.");
    }
    setBorrowDebugLoading(false);
  };

  if (profile === undefined || !profile?.admin) {
    return (
      <div className="flex flex-col min-h-screen bg-[#111] text-white">
        <main className="flex-1 flex items-center justify-center">
          <div>Chargement...</div>
        </main>
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
              <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
              <p className="text-gray-400">
                Manage system operations and monitor blockchain state
              </p>
            </div>

            {message && (
              <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    {message.includes("✅") ? (
                      <div className="text-green-400">✓</div>
                    ) : message.includes("Erreur") ? (
                      <AlertTriangle className="text-red-400 w-5 h-5" />
                    ) : (
                      <div className="text-blue-400">ℹ</div>
                    )}
                    <span className="text-sm">{message}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RefreshCw className="mr-2 text-[#5D5FEF]" />
                    Refresh Prices
                  </CardTitle>
                  <CardDescription>
                    Update all skin prices from Steam market
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleRefreshPrices}
                    disabled={priceRefreshLoading}
                    className="w-full bg-[#5D5FEF] hover:bg-[#4A4CDF]"
                  >
                    {priceRefreshLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      "Refresh Prices"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 text-[#5D5FEF]" />
                    Debug Borrow State
                  </CardTitle>
                  <CardDescription>
                    Debug blockchain state for a specific borrow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="borrowId">Borrow ID</Label>
                    <Input
                      id="borrowId"
                      value={borrowDebugId}
                      onChange={(e) => setBorrowDebugId(e.target.value)}
                      placeholder="Enter borrow ID"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleDebugBorrowState}
                    disabled={borrowDebugLoading || !borrowDebugId}
                    className="w-full bg-[#5D5FEF] hover:bg-[#4A4CDF]"
                  >
                    {borrowDebugLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Debugging...
                      </>
                    ) : (
                      "Debug Borrow State"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <LiquidationControls />
          </div>
        </CyberpunkContainer>
      </main>
      <Footer />
    </div>
  );
}
