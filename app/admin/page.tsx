"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/organism/navbar";
import { Footer } from "@/components/organism/footer";
import { useAuth } from "@/hooks/use-auth";

export default function AdminPage() {
  const { profile } = useAuth();
  const router = useRouter();

  const [vaultValue, setVaultValue] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [initializer, setInitializer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Redirige seulement si profile est non-null et pas admin
    // if (profile !== undefined && profile !== null && !profile.admin) {
    //   router.replace("/");
    // }
  }, [profile, router]);

  if (profile === undefined || !profile?.admin) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center">
          <div>Chargement...</div>
        </main>
      </div>
    );
  }

  // Simulate smart contract calls (replace with real web3/ethers logic)
  const fetchVaultValue = async () => {
    setLoading(true);
    setMessage(null);
    setTimeout(() => {
      setVaultValue(123.45); // Example value
      setLoading(false);
    }, 1000);
  };

  const handleDeposit = async () => {
    setLoading(true);
    setMessage(null);
    setTimeout(() => {
      setMessage(`Déposé ${depositAmount} tokens dans le vault.`);
      setDepositAmount("");
      setLoading(false);
    }, 1000);
  };

  const fetchInitializer = async () => {
    setLoading(true);
    setMessage(null);
    setTimeout(() => {
      setInitializer("0x1234...abcd");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl mx-auto p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Mode</h1>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Valeur dans le Vault</h2>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={fetchVaultValue}
              disabled={loading}
            >
              Voir la valeur
            </button>
            {vaultValue !== null && (
              <div className="mt-2">Valeur actuelle : <b>{vaultValue}</b> USDC</div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Déposer dans le Vault</h2>
            <input
              type="number"
              className="border px-2 py-1 mr-2"
              placeholder="Montant"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={loading}
            />
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={handleDeposit}
              disabled={loading || !depositAmount}
            >
              Déposer
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Initializer</h2>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded"
              onClick={fetchInitializer}
              disabled={loading}
            >
              Voir l'initializer
            </button>
            {initializer && (
              <div className="mt-2">Adresse de l'initializer : <b>{initializer}</b></div>
            )}
          </div>

          {message && (
            <div className="mt-4 p-2 bg-yellow-100 border border-yellow-400 rounded">
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}