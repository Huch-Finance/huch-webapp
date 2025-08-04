"use client";

import { useState, useEffect } from "react";
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
import { RefreshCw, AlertTriangle, Database, DollarSign, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Footer } from "@/components/organism/footer";
import { LiquidationControls } from "@/components/admin/liquidation-controls";

export default function AdminPage() {
  const [priceRefreshLoading, setPriceRefreshLoading] = useState(false);
  const [borrowDebugLoading, setBorrowDebugLoading] = useState(false);
  const [borrowDebugId, setBorrowDebugId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const { profile, getPrivyAccessToken } = useAuth();

  // Vault state
  const [vaultInfo, setVaultInfo] = useState<any>(null);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultError, setVaultError] = useState<string | null>(null);

  // Deposit state
  const [depositAmount, setDepositAmount] = useState("");
  const [depositSource, setDepositSource] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMsg, setDepositMsg] = useState<string | null>(null);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDest, setWithdrawDest] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  // Fetch vault info
  const fetchVaultInfo = async () => {
    setVaultLoading(true);
    setVaultError(null);
    try {
      const res = await fetch("http://localhost:3333/solana/vault-info");
      const data = await res.json();
      if (data.success) {
        setVaultInfo(data.vault);
      } else {
        setVaultError(data.error || "Erreur lors de la récupération du vault.");
      }
    } catch (e) {
      setVaultError("Erreur lors de la récupération du vault.");
    }
    setVaultLoading(false);
  };

  useEffect(() => {
    fetchVaultInfo();
  }, []);

  const handleRefreshPrices = async () => {
    setPriceRefreshLoading(true);
    setMessage(null);
    try {
      const token = await getPrivyAccessToken();
      if (!token) {
        setMessage("No access token available");
        return;
      }
      const res = await fetch("http://localhost:3333/api/admin/refresh-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
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
      const token = await getPrivyAccessToken();
      if (!token) {
        setMessage("No access token available");
        return;
      }
      const res = await fetch("http://localhost:3333/api/admin/debug-borrow-state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ borrowId: borrowDebugId }),
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

  // Deposit handler
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositLoading(true);
    setDepositMsg(null);
    try {
      const res = await fetch("http://localhost:3333/solana/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: depositAmount,
          sourceTokenAccount: depositSource,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDepositMsg("✅ Dépôt effectué avec succès");
        setDepositAmount("");
        setDepositSource("");
        fetchVaultInfo();
      } else {
        setDepositMsg(data.error || "Erreur lors du dépôt.");
      }
    } catch (e) {
      setDepositMsg("Erreur lors du dépôt.");
    }
    setDepositLoading(false);
  };

  // Withdraw handler
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawLoading(true);
    setWithdrawMsg(null);
    try {
      const res = await fetch("http://localhost:3333/solana/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: withdrawAmount,
          destinationTokenAccount: withdrawDest,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWithdrawMsg("✅ Retrait effectué avec succès");
        setWithdrawAmount("");
        setWithdrawDest("");
        fetchVaultInfo();
      } else {
        setWithdrawMsg(data.error || "Erreur lors du retrait.");
      }
    } catch (e) {
      setWithdrawMsg("Erreur lors du retrait.");
    }
    setWithdrawLoading(false);
  };

  if (profile === undefined || !profile?.admin) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-950 text-white">
        <main className="flex-1 flex items-center justify-center">
          <div>Chargement...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-gray-400">Manage system operations and monitor blockchain state</p>
          </div>

          {/* Vault Info */}
          <Card className="border border-neutral-800 bg-neutral-900 w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 text-[#5D5FEF]" />
                Vault Balance
              </CardTitle>
              <CardDescription>Solde actuel du vault</CardDescription>
            </CardHeader>
            <CardContent>
              {vaultLoading ? (
                <div>Chargement...</div>
              ) : vaultError ? (
                <div className="text-red-400">{vaultError}</div>
              ) : vaultInfo ? (
                <div className="text-2xl font-bold">
                  {vaultInfo.readableAmount} USDC
                  <span className="ml-2 text-xs text-gray-400">(décimales: {vaultInfo.tokenDecimals})</span>
                </div>
              ) : (
                <div>Pas d'information sur le vault.</div>
              )}
            </CardContent>
          </Card>

          {/* Deposit Form */}
          <Card className="border border-neutral-800 bg-neutral-900 w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowDownCircle className="mr-2 text-green-400" />
                Dépôt dans le vault
              </CardTitle>
              <CardDescription>Déposer des tokens dans le vault</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <Label htmlFor="depositAmount">Montant</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder="Montant à déposer"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="depositSource">Source Token Account</Label>
                  <Input
                    id="depositSource"
                    value={depositSource}
                    onChange={e => setDepositSource(e.target.value)}
                    placeholder="Adresse du token account source"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={depositLoading || !depositAmount || !depositSource}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {depositLoading ? "Dépôt en cours..." : "Déposer"}
                </Button>
                {depositMsg && (
                  <div className={`mt-2 text-sm ${depositMsg.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{depositMsg}</div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Withdraw Form */}
          <Card className="border border-neutral-800 bg-neutral-900 w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowUpCircle className="mr-2 text-yellow-400" />
                Retrait du vault
              </CardTitle>
              <CardDescription>Retirer des tokens du vault</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <Label htmlFor="withdrawAmount">Montant</Label>
                  <Input
                    id="withdrawAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="Montant à retirer"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="withdrawDest">Destination Token Account</Label>
                  <Input
                    id="withdrawDest"
                    value={withdrawDest}
                    onChange={e => setWithdrawDest(e.target.value)}
                    placeholder="Adresse du token account de destination"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={withdrawLoading || !withdrawAmount || !withdrawDest}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  {withdrawLoading ? "Retrait en cours..." : "Retirer"}
                </Button>
                {withdrawMsg && (
                  <div className={`mt-2 text-sm ${withdrawMsg.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{withdrawMsg}</div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Message global */}
          {message && (
            <Card className="border border-neutral-800 bg-neutral-900 w-full">
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

          {/* Admin actions (refresh, debug, liquidation) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Card className="border border-neutral-800 bg-neutral-900">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="mr-2 text-[#5D5FEF]" />
                  Refresh Prices
                </CardTitle>
                <CardDescription>Update all skin prices from Steam market</CardDescription>
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

            <Card className="border border-neutral-800 bg-neutral-900">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 text-[#5D5FEF]" />
                  Debug Borrow State
                </CardTitle>
                <CardDescription>Debug blockchain state for a specific borrow</CardDescription>
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
      </main>
      <Footer />
    </div>
  );
}
