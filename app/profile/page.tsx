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
} from "@privy-io/react-auth/solana";
import { LoadingOverlay } from "@/components/loading/loading-overlay";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getUSDCBalance } from "@/lib/solana-utils";

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
  
  // Cache pour éviter les appels répétés
  const [enrichmentCache, setEnrichmentCache] = useState<Map<string, any>>(new Map());
  
  
  const { profile, isAuthenticated, isLoading, ensureSolanaWallet, reloadUserData } = useAuth();
  const { wallets } = useSolanaWallets();
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
          
          if (borrowDetails) {
            // Utiliser les données blockchain réelles (directement formatées par le backend)
            startTime = borrowDetails.startTime;
            duration = borrowDetails.duration;
            amountRepaid = borrowDetails.amountRepaid; // Raw value in smallest units
            totalRepaid = borrowDetails.amountRepaidReadable; // Converted to readable
            remainingAmount = borrowDetails.remainingAmount; // Already calculated
            
            console.log(`💎 Loan ${loan.id} blockchain data:`, {
              amountBorrowedReadable: borrowDetails.amountBorrowedReadable,
              amountRepaidReadable: borrowDetails.amountRepaidReadable,
              remainingAmount: borrowDetails.remainingAmount
            });
          } else {
            // Fallback sur les données estimées
            startTime = Math.floor(new Date(loan.createdAt).getTime() / 1000);
            duration = 30 * 24 * 60 * 60; // 30 jours en secondes (valeur par défaut)
            remainingAmount = loan.amount; // Assume nothing repaid if no blockchain data
            
            console.log(`⚠️ Loan ${loan.id} using fallback data (no blockchain state found)`);
          }
          
          const timeInfo = calculateTimeRemaining(startTime, duration);

          return {
            ...loan,
            startTime,
            duration,
            amountRepaid,
            totalRepaid,
            remainingAmount,
            ...timeInfo
          } as BorrowWithTimeInfo;
        } catch (error) {
          console.error('Error enriching loan with time data:', error);
          // Fallback en cas d'erreur
          const createdTime = Math.floor(new Date(loan.createdAt).getTime() / 1000);
          const duration = 30 * 24 * 60 * 60;
          const timeInfo = calculateTimeRemaining(createdTime, duration);
          
          // Fallback: no blockchain data available, assume nothing repaid
          const totalRepaid = 0;
          const remainingAmount = loan.amount;

          return {
            ...loan,
            startTime: createdTime,
            duration,
            totalRepaid,
            remainingAmount,
            ...timeInfo
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
          const connection = new Connection(
            "https://api.devnet.solana.com",
            "confirmed",
          );
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
      }
    };

    fetchLoans();
  }, [profile?.id, wallets]);

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
        toast.success('🎉 Repayment sent to blockchain!');
        
        setIsRepayOpen(false);
        setRepayAmount("");
        setSelectedLoan(null);
        
        // Force refresh blockchain data (clear cache and refetch)
        setTimeout(async () => {
          console.log('🔄 Refreshing blockchain data after repayment...');
          setEnrichmentCache(new Map()); // Clear cache to force fresh blockchain data
          
          const userLoans = await getUserLoans();
          if (userLoans) {
            console.log('📦 Fetched loans from server:', userLoans.length);
            const enrichedLoans = await enrichLoansWithTimeData(userLoans);
            console.log('⚡ Enriched loans with fresh blockchain data:', enrichedLoans.map(l => ({
              id: l.id,
              amount: l.amount,
              totalRepaid: l.totalRepaid,
              remainingAmount: l.remainingAmount,
              amountRepaid: l.amountRepaid
            })));
            setLoans(enrichedLoans);
          }
        }, 3000); // Wait a bit longer for blockchain confirmation
        
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
    if (loan.status === 'fully_repaid') {
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
      <div className="min-h-screen flex flex-col bg-[#111] text-white">
        <main className="flex-1 flex flex-col items-center justify-center">
          <LoadingOverlay
            isLoading={isLoading}
            message="Loading your profile..."
            opacity={0.7}
          />
          <Card className="bg-[#1E1E1E] border-[#2A2A2A] p-8 flex flex-col items-center">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-2">
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
    <div className="min-h-screen flex flex-col text-white">
      <main className="flex-1 container mx-auto px-4 py-12">
        <LoadingOverlay
          isLoading={isLoading}
          message="Loading your profile..."
          opacity={0.7}
        />
        
        <div className="max-w-4xl mx-auto">
        <div className="text-left mb-8">
          <h1 className="text-3xl font-bold text-[#E1E1F5] font-poppins">
            Dashboard
          </h1>
        </div>

        {/* Profile Header */}
        <Card className="relative bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md rounded-lg overflow-hidden mb-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-5 opacity-[.05]"
            style={{
              backgroundImage: "url('/grainbg.avif')",
              backgroundRepeat: "repeat",
            }}
          />
          
          {!isLoading && !profile?.steamId && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg p-4">
              <AlertTriangle size={32} className="text-yellow-500 mb-2" />
              <h3 className="text-lg font-medium text-white mb-1 text-center">
                Steam Account Required
              </h3>
              <p className="text-sm text-gray-300 text-center mb-4">
                Connect your Steam account to access all features.
              </p>
              <div className="scale-110">
                <SteamAuthButton />
              </div>
            </div>
          )}

          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src={profile?.avatar || "/avatars/logo-black.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover bg-black"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {profile?.username || "Anonymous"}
                  </h2>
                  <p className="text-gray-400 text-sm">Member since 2024</p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{splBalance.toFixed(2)}</div>
                  <div className="text-gray-400 text-sm">USDC Balance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{loans.filter(l => l.status === 'active').length}</div>
                  <div className="text-gray-400 text-sm">Active Loans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    ${loans.filter(l => l.status === 'active').reduce((sum, loan) => sum + loan.amount, 0).toFixed(2)}
                  </div>
                  <div className="text-gray-400 text-sm">Total Borrowed</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                onClick={() => setIsDepositOpen(true)}
              >
                <ArrowDownLeft size={16} />
                Deposit
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white hover:border-white flex items-center gap-2"
                onClick={() => setIsWithdrawOpen(true)}
              >
                <ArrowUpRight size={16} />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

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
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign size={20} />
              Active Loans
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {loanLoading ? (
              <div className="text-center py-8 text-gray-400">Loading loans...</div>
            ) : loans.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No active loans found
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <Card key={loan.id} className="bg-[#18181b] border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {loan.trade?.items?.[0] && (
                            <img 
                              src={loan.trade.items[0].iconUrl} 
                              alt={loan.trade.items[0].marketHashName}
                              className="w-16 h-16 object-contain rounded"
                            />
                          )}
                          <div className="flex flex-col gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-white">
                                  ${loan.amount.toFixed(2)} USDC
                                </div>
                                {loan.totalRepaid !== undefined && loan.totalRepaid > 0 && (
                                  <div className="text-xs text-green-400">
                                    ({(loan.totalRepaid / loan.amount * 100).toFixed(1)}% repaid)
                                  </div>
                                )}
                              </div>
                              {/* Show remaining amount */}
                              {loan.remainingAmount !== undefined && (
                                <div className="text-sm">
                                  <span className="text-gray-400">Remaining: </span>
                                  <span className={loan.remainingAmount > 0 ? "text-red-400 font-medium" : "text-green-400 font-medium"}>
                                    ${loan.remainingAmount.toFixed(2)} USDC
                                  </span>
                                </div>
                              )}
                              {loan.trade?.items?.[0] && (
                                <div className="text-sm text-gray-300 max-w-[300px] truncate">
                                  {loan.trade.items[0].marketHashName}
                                </div>
                              )}
                              <div className="text-sm text-gray-400">
                                ID: {loan.borrowId.slice(0, 8)}...
                              </div>
                              {loan.totalRepaid !== undefined && loan.totalRepaid > 0 && (
                                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                  <div 
                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.min(100, loan.totalRepaid / loan.amount * 100)}%`
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <div className={`px-2 py-1 rounded text-xs border ${getStatusColor(loan)} w-fit`}>
                                {loan.isExpired && loan.status === 'active' ? 'EXPIRED' : 
                                 loan.status === 'fully_repaid' ? 'FULLY REPAID' : 
                                 loan.status.toUpperCase()}
                              </div>
                              {loan.status === 'active' && (
                                <div className={`px-2 py-1 rounded text-xs ${getTimeColor(loan)} bg-gray-800/50 w-fit flex items-center gap-1`}>
                                  {loan.isExpired ? (
                                    <AlertTriangleIcon size={12} />
                                  ) : loan.daysRemaining !== undefined && loan.daysRemaining <= 1 ? (
                                    <AlertTriangleIcon size={12} />
                                  ) : (
                                    <Clock size={12} />
                                  )}
                                  {formatTimeRemaining(loan)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Created</div>
                            <div className="text-sm text-white">
                              {new Date(loan.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Blockchain Data</div>
                            <div className="text-xs text-blue-400">
                              Repaid: ${loan.amountRepaid ? (loan.amountRepaid / 1000000).toFixed(2) : '0.00'}
                            </div>
                            <div className="text-xs text-blue-400">
                              Remaining: ${loan.remainingAmount?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Trade</div>
                            <div className={`text-sm ${loan.tradeStatus === 'accepted' ? 'text-green-400' : 'text-yellow-400'}`}>
                              {loan.tradeStatus || 'pending'}
                            </div>
                          </div>
                          
                          {loan.status === 'active' && loan.remainingAmount && loan.remainingAmount > 0.01 && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => {
                                setSelectedLoan(loan);
                                setIsRepayOpen(true);
                              }}
                            >
                              Repay
                            </Button>
                          )}
                          
                          {loan.status === 'fully_repaid' && (
                            <div className="text-sm text-blue-400 font-medium">
                              ✅ Fully Repaid
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deposit Modal */}
        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
          <DialogContent className="sm:max-w-md bg-[#1E1E1E] border-[#2A2A2A]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Deposit SOL</DialogTitle>
              <DialogDescription className="text-gray-400">
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
                  <div className="text-sm text-gray-400 text-center space-y-2">
                    <p>Network: Solana Devnet</p>
                    <div className="bg-[#23232a] p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Solana Address:</p>
                      <p className="text-sm text-white font-mono break-all">
                        {wallets[0].address}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-8 text-xs"
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
          <DialogContent className="sm:max-w-md bg-[#1E1E1E] border-[#2A2A2A]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Withdraw SOL</DialogTitle>
              <DialogDescription className="text-gray-400">
                Withdraw functionality coming soon.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Repay Modal */}
        <Dialog open={isRepayOpen} onOpenChange={setIsRepayOpen}>
          <DialogContent className="sm:max-w-md bg-[#1E1E1E] border-[#2A2A2A]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Repay Loan</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter the amount you want to repay for this loan.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              {selectedLoan && (
                <>
                  <div className="p-3 bg-[#23232a] rounded-lg">
                    <div className="text-sm text-gray-400">Loan Amount</div>
                    <div className="text-lg font-bold text-white">
                      ${selectedLoan.amount.toFixed(2)} USDC
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {selectedLoan.id}
                    </div>
                    {selectedLoan.remainingAmount !== undefined && (
                      <div className="text-sm text-blue-400 mt-1">
                        Remaining: ${selectedLoan.remainingAmount.toFixed(2)} USDC
                      </div>
                    )}
                  </div>
                  
                  {/* Debug info */}
                  <div className="p-2 bg-gray-800 rounded text-xs text-gray-300">
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
                  className="w-full p-3 pr-16 rounded-lg bg-[#23232a] text-white border border-[#2A2A2A] focus:outline-none"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  disabled={loanLoading}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-2 text-xs border-gray-500 text-gray-300 hover:text-white hover:border-white"
                  onClick={handleSetMaxRepayAmount}
                  disabled={loanLoading}
                >
                  MAX
                </Button>
              </div>
              
              {/* Debug button */}
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white hover:border-white"
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
                className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white font-bold w-full mt-2"
                onClick={handleRepayLoan}
                disabled={loanLoading || !repayAmount}
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