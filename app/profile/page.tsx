"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Clock,
  Wallet,
  AlertTriangle as AlertTriangleIcon,
} from "lucide-react";
import { SteamAuthButton } from "@/components/auth/steam-auth-button";
import { Footer } from "@/components/organism/footer";
import { useAuth } from "@/hooks/use-auth";
import { useLoanApi } from "@/hooks/use-loan-api";
import { useSPLTransactions } from "@/hooks/use-spl-transactions";
import {
  useSolanaWallets,
  usePrivyWagmi,
} from "@privy-io/react-auth/solana";
import { usePrivyWagmi as usePrivyWagmiEth } from "@privy-io/react-auth";
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
import { LoanSummary } from "@/components/loan/loan-summary";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getUSDCBalance } from "@/lib/solana-utils";
import { getSolanaConnection } from "@/lib/solana-connection";

interface TradeItem {
  assetId: string;
  marketHashName: string;
  iconUrl: string;
  value: number;
}

interface TradeData {
  id: string;
  items: TradeItem[];
  totalValue: number;
  status: string;
  createdAt: string;
  completedAt?: string;
  escrowEndDate?: string;
  escrowDays?: number;
  comment?: string;
}

interface BorrowRecord {
  id: string;
  userId: string;
  walletAddress: string;
  borrowId: string;
  vaultAddress: string;
  amount: number;
  tokenMint: string;
  status: 'pending' | 'active' | 'liquidated' | 'fully_repaid';
  tradeId: string;
  tradeStatus: string;
  createdAt: string;
  updatedAt: string;
  trade?: TradeData | null;
  // Nouvelles propriétés pour les données blockchain
  startTime?: number;
  duration?: number;
  amountRepaid?: number;
}

interface BorrowWithTimeInfo extends BorrowRecord {
  timeRemaining?: number;
  isExpired?: boolean;
  daysRemaining?: number;
  hoursRemaining?: number;
  totalRepaid?: number;
  remainingAmount?: number;
  totalToRepay?: number;
  interestRate?: number;
}

export default function Profile() {
  const [solBalance, setSolBalance] = useState<number>(0);
  const [splBalance, setSplBalance] = useState<number>(0);
  const [loans, setLoans] = useState<BorrowWithTimeInfo[]>([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isRepayOpen, setIsRepayOpen] = useState(false);
  const [repayAmount, setRepayAmount] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<BorrowWithTimeInfo | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [loanFilter, setLoanFilter] = useState<'all' | 'active' | 'fully_repaid' | 'liquidated' | 'pending'>('all');
  const [initialLoansLoaded, setInitialLoansLoaded] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  
  // Cache pour éviter les appels répétés
  const [enrichmentCache, setEnrichmentCache] = useState<Map<string, any>>(new Map());
  
  
  const { profile, isAuthenticated, isLoading, ensureSolanaWallet, reloadUserData } = useAuth();
  const { wallets } = useSolanaWallets();
  const { wallets: allWallets } = useWallets();
  const { getUserLoans, getBorrowDetails, getBorrowBlockchainState, repayPartialLoan, isLoading: loanLoading } = useLoanApi();
  const { testUSDCTransfer, isLoading: splLoading } = useSPLTransactions();

  // Fonction utilitaire pour calculer le temps restant
  const calculateTimeRemaining = (startTime: number, duration: number): {
    timeRemaining: number;
    isExpired: boolean;
    daysRemaining: number;
    hoursRemaining: number;
  } => {
    const now = Math.floor(Date.now() / 1000); // timestamp unix en secondes
    const endTime = startTime + duration;
    const timeRemaining = Math.max(0, endTime - now);
    const isExpired = timeRemaining <= 0;
    
    const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60));
    const hoursRemaining = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
    
    return {
      timeRemaining,
      isExpired,
      daysRemaining,
      hoursRemaining
    };
  };

  // Fonction pour calculer le taux d'intérêt (même logique que dans borrow-confirmation-modal)
  const getInterestRate = (duration: number) => {
    const minDuration = 7;
    const maxDuration = 35;
    const minRate = 25;
    const maxRate = 32;
    
    const rate = minRate + (maxRate - minRate) * (duration - minDuration) / (maxDuration - minDuration);
    return Math.round(rate * 10) / 10; // Round to 1 decimal
  };

  // Fonction pour enrichir les emprunts avec les données blockchain
  const enrichLoansWithTimeData = async (loans: BorrowRecord[]): Promise<BorrowWithTimeInfo[]> => {
    if (!wallets?.[0]?.address) return loans as BorrowWithTimeInfo[];

    const enrichedLoans = await Promise.all(
      loans.map(async (loan) => {
        try {
          // Vérifier le cache d'abord
          let borrowDetails = enrichmentCache.get(loan.id);
          
          if (!borrowDetails) {
            // Récupérer les données blockchain directement avec le nouvel endpoint
            borrowDetails = await getBorrowBlockchainState(loan.id);
            
            // Mettre en cache pour éviter les appels répétés
            if (borrowDetails) {
              setEnrichmentCache(prev => new Map(prev.set(loan.id, borrowDetails)));
            }
          }
          
          let startTime: number;
          let duration: number;
          let amountRepaid: number = 0;
          let totalRepaid: number = 0;
          let remainingAmount: number = 0;
          let totalToRepayCalculated: number;
          let interestRate: number;
          
          if (borrowDetails) {
            // Utiliser les données blockchain réelles (directement formatées par le backend)
            startTime = borrowDetails.startTime;
            // Convert duration from days to seconds (blockchain stores in days)
            duration = borrowDetails.duration * 24 * 60 * 60;
            amountRepaid = borrowDetails.amountRepaid; // Raw value in smallest units
            totalRepaid = borrowDetails.amountRepaidReadable; // Converted to readable
            
            // Calculate total amount to repay (loan + interest)
            const durationInDays = borrowDetails.duration;
            interestRate = getInterestRate(durationInDays);
            totalToRepayCalculated = loan.amount * (1 + interestRate / 100);
            
            // Calculate remaining amount based on total to repay, not just loan amount
            remainingAmount = Math.max(0, totalToRepayCalculated - totalRepaid);
            
            console.log(`Loan ${loan.id} blockchain data:`, {
              amountBorrowedReadable: borrowDetails.amountBorrowedReadable,
              amountRepaidReadable: borrowDetails.amountRepaidReadable,
              totalToRepay: totalToRepayCalculated,
              remainingAmount: remainingAmount,
              interestRate: interestRate,
              startTime: borrowDetails.startTime,
              durationDays: borrowDetails.duration,
              durationSeconds: duration,
              currentTime: Math.floor(Date.now() / 1000)
            });
          } else {
            // Fallback sur les données estimées
            startTime = Math.floor(new Date(loan.createdAt).getTime() / 1000);
            duration = 30 * 24 * 60 * 60; // 30 jours en secondes (valeur par défaut)
            
            // Calculate total to repay with interest
            const durationInDays = 30; // Default duration
            interestRate = getInterestRate(durationInDays);
            totalToRepayCalculated = loan.amount * (1 + interestRate / 100);
            remainingAmount = totalToRepayCalculated; // Assume nothing repaid if no blockchain data
            
            console.log(`Loan ${loan.id} using fallback data (no blockchain state found)`);
          }
          
          const timeInfo = calculateTimeRemaining(startTime, duration);
          
          // Si le prêt est actif et créé récemment (moins de 24h), ne pas le marquer comme expiré
          const isRecentlyCreated = (Date.now() - new Date(loan.createdAt).getTime()) < 24 * 60 * 60 * 1000;
          const adjustedTimeInfo = isRecentlyCreated && loan.status === 'active' 
            ? { ...timeInfo, isExpired: false }
            : timeInfo;

          return {
            ...loan,
            startTime,
            duration,
            amountRepaid,
            totalRepaid,
            remainingAmount,
            totalToRepay: totalToRepayCalculated,
            interestRate,
            ...adjustedTimeInfo
          } as BorrowWithTimeInfo;
        } catch (error) {
          console.error('Error enriching loan with time data:', error);
          // Fallback en cas d'erreur
          const createdTime = Math.floor(new Date(loan.createdAt).getTime() / 1000);
          const fallbackDuration = 30 * 24 * 60 * 60;
          const timeInfo = calculateTimeRemaining(createdTime, fallbackDuration);
          
          // Si le prêt est actif et créé récemment (moins de 24h), ne pas le marquer comme expiré
          const isRecentlyCreated = (Date.now() - new Date(loan.createdAt).getTime()) < 24 * 60 * 60 * 1000;
          const adjustedTimeInfo = isRecentlyCreated && loan.status === 'active' 
            ? { ...timeInfo, isExpired: false }
            : timeInfo;
          
          // Fallback: calculate total to repay with interest
          const durationInDays = 30; // Default duration
          const fallbackInterestRate = getInterestRate(durationInDays);
          const fallbackTotalToRepay = loan.amount * (1 + fallbackInterestRate / 100);
          const fallbackTotalRepaid = 0;
          const fallbackRemainingAmount = fallbackTotalToRepay;

          return {
            ...loan,
            startTime: createdTime,
            duration: fallbackDuration,
            totalRepaid: fallbackTotalRepaid,
            remainingAmount: fallbackRemainingAmount,
            totalToRepay: fallbackTotalToRepay,
            interestRate: fallbackInterestRate,
            ...adjustedTimeInfo
          } as BorrowWithTimeInfo;
        }
      })
    );

    return enrichedLoans;
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallets?.[0]?.address) {
        try {
          const connection = getSolanaConnection();
          const publicKey = new PublicKey(wallets[0].address);
          const balance = await connection.getBalance(publicKey);
          setSolBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [wallets]);

  useEffect(() => {
    const fetchSplBalance = async () => {
      if (!wallets?.[0]?.address) {
        setSplBalance(0);
        return;
      }

      try {
        const connection = new Connection(
          "https://api.devnet.solana.com",
          "confirmed",
        );
        
        // Utiliser la fonction utilitaire pour récupérer le solde USDC
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

  useEffect(() => {
    const fetchLoans = async () => {
      if (profile?.id) {
        const userLoans = await getUserLoans();
        if (userLoans) {
          // Enrichir les emprunts avec les données temporelles
          const enrichedLoans = await enrichLoansWithTimeData(userLoans);
          setLoans(enrichedLoans);
        }
        setInitialLoansLoaded(true);
      }
    };

    fetchLoans();
  }, [profile?.id, wallets]);

  // Monitor when user data is fully loaded
  useEffect(() => {
    if (isAuthenticated && !isLoading && profile?.id) {
      // Add a small delay to ensure all data is loaded from localStorage and API
      const timer = setTimeout(() => {
        setUserDataLoaded(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setUserDataLoaded(false);
    }
  }, [isAuthenticated, isLoading, profile?.id]);

  // Mettre à jour les temps restants toutes les minutes
  useEffect(() => {
    const updateTimeRemaining = () => {
      setLoans(prevLoans => 
        prevLoans.map(loan => {
          if (loan.startTime && loan.duration) {
            const timeInfo = calculateTimeRemaining(loan.startTime, loan.duration);
            return { ...loan, ...timeInfo };
          }
          return loan;
        })
      );
    };

    const interval = setInterval(updateTimeRemaining, 60000); // Mise à jour toutes les minutes
    return () => clearInterval(interval);
  }, [loans.length]);

  // Fonction pour formater l'affichage du temps restant
  const formatTimeRemaining = (loan: BorrowWithTimeInfo): string => {
    if (loan.isExpired) {
      return "Expired";
    }
    
    if (loan.daysRemaining !== undefined && loan.hoursRemaining !== undefined) {
      if (loan.daysRemaining > 0) {
        return `${loan.daysRemaining}d ${loan.hoursRemaining}h remaining`;
      } else if (loan.hoursRemaining > 0) {
        return `${loan.hoursRemaining}h remaining`;
      } else {
        return "< 1h remaining";
      }
    }
    
    return "Unknown";
  };

  const handleRepayLoan = async () => {
    if (!selectedLoan || !repayAmount) {
      console.log('Missing selectedLoan or repayAmount:', { selectedLoan: !!selectedLoan, repayAmount });
      return;
    }

    console.log('Starting handleRepayLoan:', { 
      loanId: selectedLoan.id, 
      amount: repayAmount,
      selectedLoan 
    });

    const repayAmountNum = Number(repayAmount);
    
    if (isNaN(repayAmountNum) || repayAmountNum <= 0) {
      console.error('Invalid repay amount:', repayAmount);
      toast.error('Please enter a valid amount');
      return;
    }

    // Calculate remaining amount and validate repayment doesn't exceed it
    const remainingAmount = selectedLoan.remainingAmount || selectedLoan.amount;
    if (repayAmountNum > remainingAmount) {
      toast.error(`Cannot repay more than remaining amount: $${remainingAmount.toFixed(2)} USDC`);
      return;
    }

    try {
      console.log('Calling repayPartialLoan...');
      const result = await repayPartialLoan(repayAmountNum, selectedLoan.id);
      console.log('repayPartialLoan result:', result);
      
      if (result?.success) {
        console.log('Repayment successful:', result);
        toast.success(`Loan repaid successfully! ${result.signature ? `Tx: ${result.signature.slice(0, 8)}...` : ''}`);
        
        // Just close the modal and clear form - blockchain data will be fetched fresh
        toast.success('Repayment sent to blockchain!');
        
        setIsRepayOpen(false);
        setRepayAmount("");
        setSelectedLoan(null);
        
        // Force refresh blockchain data immediately and periodically
        const refreshLoanData = async () => {
          console.log('Refreshing blockchain data after repayment...');
          setEnrichmentCache(new Map()); // Clear cache to force fresh blockchain data
          
          const userLoans = await getUserLoans();
          if (userLoans) {
            console.log('Fetched loans from server:', userLoans.length);
            const enrichedLoans = await enrichLoansWithTimeData(userLoans);
            console.log('Enriched loans with fresh blockchain data:', enrichedLoans.map(l => ({
              id: l.id,
              amount: l.amount,
              totalRepaid: l.totalRepaid,
              remainingAmount: l.remainingAmount,
              amountRepaid: l.amountRepaid
            })));
            setLoans(enrichedLoans);
          }
        };

        // Refresh immediately
        await refreshLoanData();
        
        // Refresh again after 5 seconds for blockchain confirmation
        setTimeout(async () => {
          await refreshLoanData();
        }, 5000);
        
        // Refresh one more time after 15 seconds to ensure all data is updated
        setTimeout(async () => {
          await refreshLoanData();
        }, 15000);
        
      } else {
        console.error('Repayment failed:', result);
        toast.error(`Failed to repay loan: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in handleRepayLoan:', error);
      toast.error(`Error repaying loan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Function to set max repayment amount
  const handleSetMaxRepayAmount = () => {
    if (selectedLoan) {
      const maxAmount = selectedLoan.remainingAmount || selectedLoan.amount;
      setRepayAmount(maxAmount.toFixed(2));
    }
  };

  // Function to handle withdraw
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
      // Test connection first to prevent WebSocket errors
      const connection = getSolanaConnection();
      await connection.getSlot(); // Quick connection test
      
      // For now, use a simple USDC transfer
      const result = await testUSDCTransfer(amount, withdrawAddress);
      
      if (result.success) {
        toast.success(`Successfully withdrawn ${amount} USDC!`);
        setIsWithdrawOpen(false);
        setWithdrawAmount("");
        setWithdrawAddress("");
      } else {
        const errorMsg = result.error || "Unknown error";
        console.error("Withdraw failed:", errorMsg);
        
        // Handle specific WebSocket errors
        if (errorMsg.includes('ws error') || errorMsg.includes('websocket')) {
          toast.error("Network connection issue. Please try again.");
        } else if (errorMsg.includes('insufficient funds')) {
          toast.error("Insufficient balance for transaction.");
        } else {
          toast.error(`Withdraw failed: ${errorMsg}`);
        }
      }
    } catch (error: any) {
      console.error("Withdraw error:", error);
      
      // Handle different types of errors
      if (error.message?.includes('ws error') || error.message?.includes('websocket')) {
        toast.error("Network connection issue. Please check your internet and try again.");
      } else if (error.message?.includes('Solana RPC failed')) {
        toast.error("Solana network issue. Please try again in a moment.");
      } else {
        toast.error(`Withdraw failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Function to set max withdraw amount
  const handleSetMaxWithdrawAmount = () => {
    setWithdrawAmount(splBalance.toFixed(2));
  };

  // Force update wallet to Solana
  const handleForceUpdateWallet = async () => {
    if (!wallets?.[0]?.address) {
      toast.error("No Solana wallet found");
      return;
    }

    try {
      const response = await fetch('http://localhost:3333/api/auth/privy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: profile?.id,
          wallet: wallets[0].address, // Force Solana wallet
          email: profile?.email,
        }),
      });

      if (response.ok) {
        toast.success("Wallet updated to Solana!");
        await reloadUserData();
      } else {
        toast.error("Failed to update wallet");
      }
    } catch (error) {
      toast.error("Error updating wallet");
    }
  };

  const getStatusColor = (loan: BorrowWithTimeInfo) => {
    if (loan.status === 'fully_repaid' || (loan.remainingAmount !== undefined && loan.remainingAmount <= 0.01)) {
      return "bg-blue-500/20 text-blue-400 border-blue-400";
    }
    
    if (loan.isExpired && loan.status === 'active') {
      return "bg-red-500/20 text-red-400 border-red-400";
    }
    
    if (loan.status === 'active' && loan.daysRemaining !== undefined && loan.daysRemaining <= 3) {
      return "bg-orange-500/20 text-orange-400 border-orange-400";
    }
    
    switch (loan.status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400";
      case "liquidated":
        return "bg-red-500/20 text-red-400 border-red-400";
      case "fully_repaid":
        return "bg-blue-500/20 text-blue-400 border-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400";
    }
  };

  const getTimeColor = (loan: BorrowWithTimeInfo) => {
    if (loan.isExpired) {
      return "text-red-400";
    }
    if (loan.daysRemaining !== undefined && loan.daysRemaining <= 3) {
      return "text-orange-400";
    }
    if (loan.daysRemaining !== undefined && loan.daysRemaining <= 7) {
      return "text-yellow-400";
    }
    return "text-green-400";
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
            Dashboard
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
          
          {isAuthenticated && !isLoading && !profile?.steamId && userDataLoaded && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg p-4">
              <AlertTriangle size={32} className="text-yellow-500 mb-2" />
              <h3 className="text-lg font-medium text-white mb-1 text-center font-poppins">
                Steam Account Required
              </h3>
              <p className="text-sm text-gray-300 text-center mb-4 font-poppins">
                Connect your Steam account to access all features.
              </p>
              <div className="scale-110">
                <SteamAuthButton />
              </div>
            </div>
          )}

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
                    {profile?.username || "Anonymous"}
                  </h2>
                  <p className="text-gray-400 text-sm font-poppins">Member since 2024</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 lg:flex">
                <div className="text-center font-poppins">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-poppins">${splBalance.toFixed(2)}</div>
                  <div className="text-gray-400 text-xs sm:text-sm whitespace-nowrap font-poppins">USDC Balance</div>
                </div>
                <div className="text-center font-poppins">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-poppins">{loans.filter(l => l.status === 'active').length}</div>
                  <div className="text-gray-400 text-xs sm:text-sm whitespace-nowrap font-poppins">Active Loans</div>
                </div>
                <div className="text-center font-poppins">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-poppins">
                    ${loans.filter(l => l.status === 'active').reduce((sum, loan) => sum + loan.amount, 0).toFixed(2)}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm whitespace-nowrap font-poppins">Total Borrowed</div>
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
            </div>
          </CardContent>
        </Card>

        {/* Pending Trade Section */}
        {loans.some(loan => loan.tradeStatus === 'pending' || loan.tradeStatus === 'created' || loan.tradeStatus === 'in_escrow' || loan.tradeStatus === 'escrow_pending') && (
          <Card className="relative bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md rounded-lg overflow-hidden mb-4 sm:mb-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-5 opacity-[.05]"
              style={{
                backgroundImage: "url('/grainbg.avif')",
                backgroundRepeat: "repeat",
              }}
            />
            
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2 font-poppins">
                <AlertTriangle className="text-yellow-500" size={20} />
                Pending Trades & Escrow
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {loans.filter(loan => loan.tradeStatus === 'pending' || loan.tradeStatus === 'created' || loan.tradeStatus === 'in_escrow' || loan.tradeStatus === 'escrow_pending').map((loan) => (
                  <Card 
                    key={loan.id} 
                    className={`bg-[#18181b] border-yellow-600/50 transition-colors ${
                      loan.tradeStatus === 'in_escrow' || loan.tradeStatus === 'escrow_pending' || loan.tradeStatus === 'expired' || loan.tradeStatus === 'canceled' || loan.tradeStatus === 'declined'
                        ? 'opacity-75' 
                        : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          {loan.trade?.items?.[0] && (
                            <img
                              src={loan.trade.items[0].iconUrl}
                              alt={loan.trade.items[0].marketHashName}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-contain flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium font-poppins">
                              ${loan.amount.toFixed(2)} USDC Loan
                            </p>
                            {loan.trade?.items?.[0] && (
                              <p className="text-sm text-gray-400 truncate font-poppins">
                                {loan.trade.items[0].marketHashName}
                              </p>
                            )}
                            {loan.tradeStatus === 'in_escrow' ? (
                              <div className="space-y-1">
                                <p className="text-xs text-orange-500 font-medium font-poppins">
                                  TRADE IN LOCKDOWN (15 DAYS)
                                </p>
                                <p className="text-xs text-gray-400 font-poppins">
                                  Items are secured by Steam escrow system
                                </p>
                                <p className="text-xs text-gray-500 font-poppins">
                                  This trade cannot be modified during lockdown period
                                </p>
                              </div>
                            ) : loan.tradeStatus === 'escrow_pending' ? (
                              <div className="space-y-1">
                                <p className="text-xs text-blue-500 font-medium font-poppins">
                                  ESCROW ACCEPTED - WAITING FOR STEAM
                                </p>
                                <p className="text-xs text-gray-400 font-poppins">
                                  Loan will activate when items are transferred
                                </p>
                                {loan.trade?.escrowEndDate && (
                                  <p className="text-xs text-gray-500 font-poppins">
                                    Expected: {new Date(loan.trade.escrowEndDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-yellow-500 mt-1 font-poppins">
                                Please accept the Steam trade to activate your loan
                              </p>
                            )}
                          </div>
                        </div>
                        {loan.tradeStatus === 'in_escrow' ? (
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-sm text-orange-400 font-medium flex items-center gap-1 font-poppins">
                              LOCKED
                            </div>
                            <div className="text-xs text-gray-500 font-poppins">
                              15-day Steam escrow
                            </div>
                          </div>
                        ) : loan.tradeStatus === 'escrow_pending' ? (
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-sm text-blue-400 font-medium flex items-center gap-1 font-poppins">
                              <Clock size={16} />
                              WAITING
                            </div>
                            <div className="text-xs text-gray-500 font-poppins">
                              Steam transfer pending
                            </div>
                          </div>
                        ) : (
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto font-poppins"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open Steam trade page
                              window.open('https://steamcommunity.com/my/tradeoffers/', '_blank');
                            }}
                          >
                            Go to Steam Trades
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Loans Section */}
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
              <CardTitle className="text-xl font-bold text-white font-poppins">
                Loans
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All', count: loans.length },
                  { key: 'active', label: 'Active', count: loans.filter(l => l.status === 'active' && !(l.remainingAmount !== undefined && l.remainingAmount <= 0.01)).length },
                  { key: 'fully_repaid', label: 'Repaid', count: loans.filter(l => l.status === 'fully_repaid' || (l.remainingAmount !== undefined && l.remainingAmount <= 0.01)).length },
                  { key: 'liquidated', label: 'Liquidated', count: loans.filter(l => l.status === 'liquidated').length },
                  { key: 'pending', label: 'Pending', count: loans.filter(l => l.status === 'pending').length },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    className={`relative px-3 py-1.5 rounded-lg text-sm font-medium border backdrop-blur-md transition-all duration-300 hover:scale-105 font-poppins ${
                      loanFilter === filter.key
                        ? 'bg-white/15 border-white/30 text-white shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setLoanFilter(filter.key as any)}
                  >
                    <span className="relative z-10">{filter.label}</span>
                    {filter.count > 0 && (
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-poppins ${
                        loanFilter === filter.key
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {filter.count}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {loanLoading || (!initialLoansLoaded && profile?.id) ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-gray-400 font-poppins">Loading loans...</div>
              </div>
            ) : loans.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No loans found
              </div>
            ) : (
              <div className="space-y-6">
                <LoanSummary 
                  loans={loans.filter((loan) => {
                    if (loanFilter === 'all') return true;
                    if (loanFilter === 'active') return loan.status === 'active' && !(loan.remainingAmount !== undefined && loan.remainingAmount <= 0.01);
                    if (loanFilter === 'fully_repaid') return loan.status === 'fully_repaid' || (loan.remainingAmount !== undefined && loan.remainingAmount <= 0.01);
                    if (loanFilter === 'liquidated') return loan.status === 'liquidated';
                    if (loanFilter === 'pending') return loan.status === 'pending';
                    return false;
                  })}
                  onRepayClick={(loan) => {
                    setSelectedLoan(loan);
                    setIsRepayOpen(true);
                  }}
                  getStatusColor={getStatusColor}
                  getTimeColor={getTimeColor}
                  formatTimeRemaining={formatTimeRemaining}
                />
                {loans.filter((loan) => {
                  if (loanFilter === 'all') return true;
                  if (loanFilter === 'active') return loan.status === 'active' && !(loan.remainingAmount !== undefined && loan.remainingAmount <= 0.01);
                  if (loanFilter === 'fully_repaid') return loan.status === 'fully_repaid' || (loan.remainingAmount !== undefined && loan.remainingAmount <= 0.01);
                  if (loanFilter === 'liquidated') return loan.status === 'liquidated';
                  if (loanFilter === 'pending') return loan.status === 'pending';
                  return false;
                }).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No {loanFilter === 'all' ? 'loans' : loanFilter.replace('_', ' ')} found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deposit Modal */}
        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
          <DialogContent className="sm:max-w-md bg-blue-950/20 backdrop-blur-md border-blue-400/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-poppins">Deposit SOL</DialogTitle>
              <DialogDescription className="text-gray-400 font-poppins">
                Send SOL to your wallet address. Use Solana Devnet network.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4 py-4">
              {wallets?.[0]?.address && (
                <>
                  <Card className="bg-white p-2 rounded-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallets[0].address}`}
                      alt="Wallet QR Code"
                      className="w-48 h-48"
                    />
                  </Card>
                  <div className="text-sm text-gray-400 text-center space-y-2 font-poppins">
                    <p>Network: Solana Devnet</p>
                    <div className="bg-blue-950/30 backdrop-blur-sm border border-blue-400/20 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 font-poppins">Solana Address:</p>
                      <p className="text-sm text-white font-poppins break-all">
                        {wallets[0].address}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-8 text-xs font-poppins"
                        onClick={() => {
                          navigator.clipboard.writeText(wallets[0].address);
                          toast.success("Address copied to clipboard!");
                        }}
                      >
                        Copy Address
                      </Button>
                    </div>
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
                Withdraw your USDC to any Solana address.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="p-3 bg-blue-950/30 backdrop-blur-sm border border-blue-400/20 rounded-lg">
                <div className="text-sm text-gray-400 font-poppins">Available Balance</div>
                <div className="text-lg font-bold text-white font-poppins">
                  ${splBalance.toFixed(2)} USDC
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={splBalance}
                  placeholder="Amount to withdraw (USDC)"
                  className="w-full p-3 pr-16 rounded-lg bg-blue-950/30 backdrop-blur-sm text-white border border-blue-400/20 focus:border-blue-400/40 focus:outline-none font-poppins"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={withdrawLoading}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-2 text-xs border-gray-500 text-gray-300 hover:text-white hover:border-white font-poppins"
                  onClick={handleSetMaxWithdrawAmount}
                  disabled={withdrawLoading}
                >
                  MAX
                </Button>
              </div>

              <input
                type="text"
                placeholder="Destination Solana address"
                className="w-full p-3 rounded-lg bg-blue-950/30 backdrop-blur-sm text-white border border-blue-400/20 focus:border-blue-400/40 focus:outline-none font-poppins"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
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

        {/* Repay Modal */}
        <Dialog open={isRepayOpen} onOpenChange={setIsRepayOpen}>
          <DialogContent className="sm:max-w-md bg-blue-950/20 backdrop-blur-md border-blue-400/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-poppins">Repay Loan</DialogTitle>
              <DialogDescription className="text-gray-400 font-poppins">
                Enter the amount you want to repay for this loan.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              {selectedLoan && (
                <>
                  {selectedLoan.isExpired && (
                    <div className="p-3 bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-lg flex items-center gap-3">
                      <AlertTriangleIcon className="text-red-400 w-5 h-5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-red-400 font-poppins">
                          This loan has expired
                        </div>
                        <div className="text-xs text-red-400/80 font-poppins">
                          Expired loans cannot be repaid and may be subject to liquidation.
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-3 bg-blue-950/30 backdrop-blur-sm border border-blue-400/20 rounded-lg">
                    <div className="text-sm text-gray-400 font-poppins">Loan Details</div>
                    <div className="text-lg font-bold text-white font-poppins">
                      ${selectedLoan.amount.toFixed(2)} USDC
                      {selectedLoan.interestRate !== undefined && (
                        <span className="text-sm text-gray-400 font-normal ml-2 font-poppins">
                          ({selectedLoan.interestRate}% interest)
                        </span>
                      )}
                    </div>
                    {selectedLoan.totalToRepay !== undefined && (
                      <div className="text-sm text-yellow-400 mt-1 font-poppins">
                        Total to repay: ${selectedLoan.totalToRepay.toFixed(2)} USDC
                      </div>
                    )}
                    {selectedLoan.remainingAmount !== undefined && (
                      <div className="text-sm text-blue-400 mt-1 font-poppins">
                        Remaining: ${selectedLoan.remainingAmount.toFixed(2)} USDC
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1 font-poppins">
                      ID: {selectedLoan.id}
                    </div>
                  </div>
                  
                  {/* Debug info */}
                  <div className="p-2 bg-blue-950/30 backdrop-blur-sm border border-blue-400/20 rounded text-xs text-gray-300 font-poppins">
                    <div>Debug: Wallet connected: {wallets?.[0]?.address ? 'Yes' : 'No'}</div>
                    <div>SPL Loading: {splLoading ? 'Yes' : 'No'}</div>
                    <div>Loan Loading: {loanLoading ? 'Yes' : 'No'}</div>
                  </div>
                </>
              )}
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={selectedLoan?.remainingAmount || selectedLoan?.amount}
                  placeholder="Amount to repay (USDC)"
                  className="w-full p-3 pr-16 rounded-lg bg-blue-950/30 backdrop-blur-sm text-white border border-blue-400/20 focus:border-blue-400/40 focus:outline-none font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  disabled={loanLoading || selectedLoan?.isExpired}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-2 text-xs border-gray-500 text-gray-300 hover:text-white hover:border-white font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSetMaxRepayAmount}
                  disabled={loanLoading || selectedLoan?.isExpired}
                >
                  MAX
                </Button>
              </div>
              
              {/* Debug button */}
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white hover:border-white font-poppins"
                onClick={() => {
                  console.log('Debug repay state:', {
                    selectedLoan,
                    repayAmount,
                    wallets: wallets?.[0]?.address,
                    loanLoading,
                    splLoading
                  });
                  toast.info('Check console for debug info');
                }}
              >
                Debug Info
              </Button>
              
              <Button
                className="bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-md border border-blue-400/30 hover:border-blue-400/50 text-white font-bold w-full mt-2 transition-all duration-300 font-poppins disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600/20"
                onClick={handleRepayLoan}
                disabled={loanLoading || !repayAmount || selectedLoan?.isExpired}
              >
                {loanLoading ? "Processing..." : "Repay Loan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}