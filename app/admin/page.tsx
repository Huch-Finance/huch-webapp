"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const { profile } = useAuth();
  const router = useRouter();

  const [vaultValue, setVaultValue] = useState<number | null>(null);
  const [vaultName, setVaultName] = useState<string>("");
  const [vaultTokenAccount, setVaultTokenAccount] = useState<string | null>(null);
  const [vaultDecimals, setVaultDecimals] = useState<number>(6);
  const [depositAmount, setDepositAmount] = useState("");
  const [sourceTokenAccount, setSourceTokenAccount] = useState("");
  const [initializer, setInitializer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showConfirmInit, setShowConfirmInit] = useState(false);
  const [showDoubleConfirmInit, setShowDoubleConfirmInit] = useState(false);

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

  if (profile === undefined || !profile?.admin) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center">
          <div>Chargement...</div>
        </main>
      </div>
    );
  }

  const handleInitializeVault = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:3333/solana/initialize-vault", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "2eme vault par pitie fetch frr",
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
      const amountInBaseUnits = Math.floor(Number(depositAmount) * Math.pow(10, Number(vaultDecimals)));
      const res = await fetch("http://localhost:3333/solana/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Mode</h1>
        <div className="w-full max-w-2xl flex flex-col gap-8">
          {/* Vault Value Card */}
          <Card>
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

          {/* Deposit Card */}
          <Card>
            <CardHeader>
              <CardTitle>Déposer dans le Vault</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2 items-center">
              <Input
                type="number"
                placeholder="Montant"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={loading}
                className="w-full sm:w-auto"
              />
              <Input
                type="text"
                placeholder="Source Token Account"
                value={sourceTokenAccount}
                onChange={(e) => setSourceTokenAccount(e.target.value)}
                disabled={loading}
                className="w-full sm:w-auto"
              />
              <Button
                onClick={handleDeposit}
                disabled={loading || !depositAmount || !sourceTokenAccount}
                className="w-full sm:w-auto"
              >
                Déposer
              </Button>
            </CardContent>
          </Card>

          {/* Initializer Card */}
          <Card>
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
                  <span className="text-sm text-red-600">Première confirmation requise</span>
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
                  <span className="text-sm text-red-600">Seconde confirmation requise</span>
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
                <div className="mt-4 break-all">
                  Adresse de l'initializer : <b>{initializer}</b>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message */}
          {message && (
            <Card>
              <CardContent>
                <div className="p-2 bg-yellow-100 border border-yellow-400 rounded text-center text-black">
                  {message}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}