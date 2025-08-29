import { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { getSolanaConnection } from "@/lib/solana-connection";
import { useSolanaWallets } from "@privy-io/react-auth/solana";

const HUCH_TOKEN_MINT = "B8zW7B8T7ntCiiRYw18jrFu9MBqMZVk9pP7nYyT5iBLV";
const HUCH_DECIMALS = 9; // Most SPL tokens use 9 decimals

export function useHuchToken() {
  const [balance, setBalance] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { wallets } = useSolanaWallets();
  const activeWallet = wallets.find(w => w.walletClientType === 'privy');

  // Fetch Huch token balance
  const fetchBalance = async () => {
    if (!activeWallet?.address) {
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const connection = getSolanaConnection();
      const walletPubkey = new PublicKey(activeWallet.address);
      const mintPubkey = new PublicKey(HUCH_TOKEN_MINT);
      
      // Get the associated token account
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintPubkey,
        walletPubkey
      );

      try {
        const tokenAccount = await getAccount(connection, associatedTokenAddress);
        const rawBalance = Number(tokenAccount.amount);
        const actualBalance = rawBalance / Math.pow(10, HUCH_DECIMALS);
        setBalance(actualBalance);
      } catch (err) {
        // Token account doesn't exist, balance is 0
        console.log("No Huch token account found for wallet");
        setBalance(0);
      }
    } catch (err) {
      console.error("Error fetching Huch balance:", err);
      setError("Failed to fetch Huch balance");
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Huch token price (you can integrate with a price API like Jupiter or Birdeye)
  const fetchPrice = async () => {
    try {
      // For now, we'll use a mock price or you can integrate with Jupiter Price API
      // Example Jupiter price API: https://price.jup.ag/v4/price?ids=HUCH_TOKEN_MINT
      
      // Mock price for now - replace with actual API call
      setPrice(0.0001); // $0.0001 per HUCH token
      
      // Uncomment and use this for actual price fetching:
      /*
      const response = await fetch(`https://price.jup.ag/v4/price?ids=${HUCH_TOKEN_MINT}`);
      const data = await response.json();
      if (data.data && data.data[HUCH_TOKEN_MINT]) {
        setPrice(data.data[HUCH_TOKEN_MINT].price || 0);
      }
      */
    } catch (err) {
      console.error("Error fetching Huch price:", err);
      setPrice(0);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchPrice();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBalance();
      fetchPrice();
    }, 30000);

    return () => clearInterval(interval);
  }, [activeWallet?.address]);

  const totalValue = balance * price;

  return {
    balance,
    price,
    totalValue,
    loading,
    error,
    refresh: () => {
      fetchBalance();
      fetchPrice();
    }
  };
}