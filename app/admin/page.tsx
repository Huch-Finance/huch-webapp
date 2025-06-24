"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/organism/footer";


export default function AdminPage() {
  const { profile } = useAuth();
  const router = useRouter();

  const [vaultValue, setVaultValue] = useState<number | null>(null);
  const [vaultName, setVaultName] = useState<string>("");
  const [vaultTokenAccount, setVaultTokenAccount] = useState<string | null>(
    null,
  );
  const [vaultDecimals, setVaultDecimals] = useState<number>(6);
  const [depositAmount, setDepositAmount] = useState("");
  const [sourceTokenAccount, setSourceTokenAccount] = useState("");
  const [initializer, setInitializer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showConfirmInit, setShowConfirmInit] = useState(false);
  const [showDoubleConfirmInit, setShowDoubleConfirmInit] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDestination, setWithdrawDestination] = useState("");
  const [priceRefreshLoading, setPriceRefreshLoading] = useState(false);
  const [borrowDebugId, setBorrowDebugId] = useState("");
  const [borrowDebugLoading, setBorrowDebugLoading] = useState(false);

  useEffect(() => {
    // Redirige seulement si profile est non-null et pas admin
    // if (profile !== undefined && profile !== null && !profile.admin) {
    //   router.replace("/");
    // }
  }, [profile, router]);

  // Fetch vault value automatically on mount
  useEffect(() => {
    const fetchVault = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch("http://localhost:3333/solana/vault-info");
        const data = await res.json();
        if (data.success && data.vault) {
          const amountNumber = Number(data.vault.tokenAmount);
          const decimals = Number(data.vault.tokenDecimals);
          setVaultValue(Number(amountNumber / Math.pow(10, decimals)));
          setVaultName(data.vault.name);
          setVaultDecimals(data.vault.tokenDecimals.toString());
          setInitializer(data.vault.admin);
        } else {
          setMessage("Impossible de récupérer les infos du vault.");
        }
      } catch (e) {
        setMessage("Erreur lors de la récupération du vault.");
      }
      setLoading(false);
    };
    fetchVault();
  }, []);


  const handleInitializeVault = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:3333/solana/initialize-vault", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "3eme vault en bien",
          tokenDecimals: 6,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Vault initialisé avec succès !");
        setShowConfirmInit(false);
        setShowDoubleConfirmInit(false);
      } else {
        setMessage(data.error || "Erreur lors de l'initialisation.");
      }
    } catch (e) {
      setMessage("Erreur lors de l'initialisation.");
    }
    setLoading(false);
  };

  const handleDeposit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const amountInBaseUnits = Math.floor(
        Number(depositAmount) * Math.pow(10, Number(vaultDecimals)),
      );
      const res = await fetch("http://localhost:3333/solana/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInBaseUnits,
          sourceTokenAccount: sourceTokenAccount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Dépôt effectué avec succès !");
        setDepositAmount("");
        setSourceTokenAccount("");
      } else {
        setMessage(data.error || "Erreur lors du dépôt.");
      }
    } catch (e) {
      setMessage("Erreur lors du dépôt.");
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const amountInBaseUnits = Math.floor(
        Number(withdrawAmount) * Math.pow(10, Number(vaultDecimals)),
      );
      const res = await fetch("http://localhost:3333/solana/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInBaseUnits,
          destinationTokenAccount: withdrawDestination,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Retrait effectué avec succès !");
        setWithdrawAmount("");
        setWithdrawDestination("");
      } else {
        setMessage(data.error || "Erreur lors du retrait.");
      }
    } catch (e) {
      setMessage("Erreur lors du retrait.");
    }
    setLoading(false);
  };

  const handleRefreshPrices = async () => {
    setPriceRefreshLoading(true);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:3333/api/admin/refresh-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Privy-Id": profile?.id || "",
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
      const res = await fetch("http://localhost:3333/api/admin/debug-borrow-state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Privy-Id": profile?.id || "",
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
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-4 min-h-0">
        <h1 className="text-3xl font-bold mb-4 text-center">Admin Dashboard</h1>
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vault Value Card */}
          <Card className="bg-[#18181b] border-[#232323] text-white">
            <CardHeader>
              <CardTitle>Valeur dans le Vault</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-2 text-lg">
                {vaultValue === null ? (
                  <span className="text-gray-500">Chargement...</span>
                ) : (
                  <>
                    Vault <b>{vaultName}</b> : <b>{vaultValue}</b> USDC
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Initializer Card */}
          <Card className="bg-[#18181b] border-[#232323] text-white">
            <CardHeader>
              <CardTitle>Initialiser le Vault</CardTitle>
            </CardHeader>
            <CardContent>
              {!showConfirmInit ? (
                <Button
                  onClick={() => setShowConfirmInit(true)}
                  disabled={loading}
                  className="mb-2"
                  variant="destructive"
                >
                  Initialiser le vault
                </Button>
              ) : !showDoubleConfirmInit ? (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-red-400">
                    Première confirmation requise
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowDoubleConfirmInit(true)}
                      disabled={loading}
                      variant="destructive"
                    >
                      Confirmer
                    </Button>
                    <Button
                      onClick={() => setShowConfirmInit(false)}
                      disabled={loading}
                      variant="outline"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-red-400">
                    Seconde confirmation requise
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleInitializeVault}
                      disabled={loading}
                      variant="destructive"
                    >
                      Confirmer et Initialiser
                    </Button>
                    <Button
                      onClick={() => {
                        setShowConfirmInit(false);
                        setShowDoubleConfirmInit(false);
                      }}
                      disabled={loading}
                      variant="outline"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
              {initializer && (
                <div className="mt-4 break-all text-xs text-gray-400">
                  Adresse de l'initializer : <b>{initializer}</b>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deposit Card */}
          <Card className="bg-[#18181b] border-[#232323] text-white col-span-1">
            <CardHeader>
              <CardTitle>Déposer dans le Vault</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Montant"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={loading}
                className="bg-[#232323] border-[#232323] text-white"
              />
              <Input
                type="text"
                placeholder="Source Token Account"
                value={sourceTokenAccount}
                onChange={(e) => setSourceTokenAccount(e.target.value)}
                disabled={loading}
                className="bg-[#232323] border-[#232323] text-white"
              />
              <Button
                onClick={handleDeposit}
                disabled={loading || !depositAmount || !sourceTokenAccount}
                className="w-full"
              >
                Déposer
              </Button>
            </CardContent>
          </Card>

          {/* Withdraw Card */}
          <Card className="bg-[#18181b] border-[#232323] text-white col-span-1">
            <CardHeader>
              <CardTitle>Retirer du Vault</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Montant"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={loading}
                className="bg-[#232323] border-[#232323] text-white"
              />
              <Input
                type="text"
                placeholder="Destination Token Account"
                value={withdrawDestination}
                onChange={(e) => setWithdrawDestination(e.target.value)}
                disabled={loading}
                className="bg-[#232323] border-[#232323] text-white"
              />
              <Button
                onClick={handleWithdraw}
                disabled={loading || !withdrawAmount || !withdrawDestination}
                className="w-full"
              >
                Retirer
              </Button>
            </CardContent>
          </Card>
          {/* Price Refresh Card */}
          <Card className="bg-[#18181b] border-[#232323] text-white col-span-1">
            <CardHeader>
              <CardTitle>Rafraîchir les Prix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-400">
                  Les prix sont normalement mis à jour automatiquement toutes les 10 minutes. 
                  Utilisez ce bouton pour forcer une mise à jour immédiate des prix populaires.
                </p>
                <Button
                  onClick={handleRefreshPrices}
                  disabled={priceRefreshLoading}
                  className="w-full"
                  variant="default"
                >
                  {priceRefreshLoading ? "Rafraîchissement en cours..." : "Rafraîchir les prix maintenant"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Borrow State Debug Card */}
          <Card className="bg-[#18181b] border-[#232323] text-white col-span-1">
            <CardHeader>
              <CardTitle>Debug Borrow State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-400">
                  Vérifier l'état d'un borrow dans la blockchain. Les détails complets s'affichent dans la console du serveur backend.
                </p>
                <Input
                  type="text"
                  placeholder="Borrow ID (ex: w0oic5xHdGj8RfiSLJik)"
                  value={borrowDebugId}
                  onChange={(e) => setBorrowDebugId(e.target.value)}
                  disabled={borrowDebugLoading}
                  className="bg-[#232323] border-[#232323] text-white"
                />
                <Button
                  onClick={handleDebugBorrowState}
                  disabled={borrowDebugLoading || !borrowDebugId.trim()}
                  className="w-full"
                  variant="default"
                >
                  {borrowDebugLoading ? "Debug en cours..." : "Debug Borrow State"}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Message */}
        {message && (
          <div className="w-full max-w-4xl mt-4">
            <Card className="bg-yellow-900 border-yellow-700 text-yellow-100">
              <CardContent>
                <div className="p-2 text-center">{message}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
