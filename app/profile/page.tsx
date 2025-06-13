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
} from "lucide-react";
import { SteamAuthButton } from "@/components/auth/steam-auth-button";
import { Footer } from "@/components/organism/footer";
import { useAuth } from "@/hooks/use-auth";
import { useLoanApi } from "@/hooks/use-loan-api";
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
  status: 'pending' | 'active' | 'liquidated';
  tradeId: string;
  tradeStatus: string;
  createdAt: string;
  updatedAt: string;
  trade?: TradeData | null;
}

export default function Profile() {
  const [solBalance, setSolBalance] = useState<number>(0);
  const [splBalance, setSplBalance] = useState<number>(0);
  const [loans, setLoans] = useState<BorrowRecord[]>([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isRepayOpen, setIsRepayOpen] = useState(false);
  const [repayAmount, setRepayAmount] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<BorrowRecord | null>(null);
  
  const { profile, isAuthenticated, isLoading } = useAuth();
  const { wallets } = useSolanaWallets();
  const { getUserLoans, repayPartialLoan, isLoading: loanLoading } = useLoanApi();

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
      const walletAddress = "3HEwVsb9yARN3zazKDCjp4Fr2qkE5ZHNHUrKrmWAAVgb";
      const mintAddress = "4KNxmZizMom4v1HjwjnFqYa55LFyUBshHCAKs1UGvSSj";
      try {
        const connection = new Connection(
          "https://api.devnet.solana.com",
          "confirmed",
        );
        const accounts = await connection.getParsedTokenAccountsByOwner(
          new PublicKey(walletAddress),
          { programId: TOKEN_PROGRAM_ID },
        );
        const tokenAccount = accounts.value.find(
          (acc: any) => acc.account.data.parsed.info.mint === mintAddress,
        );
        if (tokenAccount) {
          const amount = tokenAccount.account.data.parsed.info.tokenAmount;
          setSplBalance(Number(amount.uiAmount));
        } else {
          setSplBalance(0);
        }
      } catch (error) {
        console.error("Error fetching SPL token balance:", error);
        setSplBalance(0);
      }
    };

    fetchSplBalance();
    const interval = setInterval(fetchSplBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLoans = async () => {
      if (profile?.id) {
        const userLoans = await getUserLoans();
        if (userLoans) {
          setLoans(userLoans);
        }
      }
    };

    fetchLoans();
  }, [profile?.id]);

  const handleRepayLoan = async () => {
    if (!selectedLoan || !repayAmount) return;

    const result = await repayPartialLoan(Number(repayAmount));
    if (result?.success) {
      toast.success("Loan repaid successfully!");
      setIsRepayOpen(false);
      setRepayAmount("");
      setSelectedLoan(null);
      // Refresh loans
      const userLoans = await getUserLoans();
      if (userLoans) {
        setLoans(userLoans);
      }
    } else {
      toast.error("Failed to repay loan");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400";
      case "liquidated":
        return "bg-red-500/20 text-red-400 border-red-400";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400";
    }
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
                              <div className="font-medium text-white">
                                ${loan.amount.toFixed(2)} USDC
                              </div>
                              {loan.trade?.items?.[0] && (
                                <div className="text-sm text-gray-300 max-w-[300px] truncate">
                                  {loan.trade.items[0].marketHashName}
                                </div>
                              )}
                              <div className="text-sm text-gray-400">
                                ID: {loan.borrowId.slice(0, 8)}...
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs border ${getStatusColor(loan.status)} w-fit`}>
                              {loan.status.toUpperCase()}
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
                            <div className="text-sm text-gray-400">Trade</div>
                            <div className={`text-sm ${loan.tradeStatus === 'accepted' ? 'text-green-400' : 'text-yellow-400'}`}>
                              {loan.tradeStatus || 'pending'}
                            </div>
                          </div>
                          
                          {loan.status === 'active' && (
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
                  <div className="text-sm text-gray-400 text-center">
                    <p>Network: Solana Devnet</p>
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
                <div className="p-3 bg-[#23232a] rounded-lg">
                  <div className="text-sm text-gray-400">Loan Amount</div>
                  <div className="text-lg font-bold text-white">
                    ${selectedLoan.amount.toFixed(2)} USDC
                  </div>
                </div>
              )}
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount to repay (USDC)"
                className="w-full p-3 rounded-lg bg-[#23232a] text-white border border-[#2A2A2A] focus:outline-none"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                disabled={loanLoading}
              />
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