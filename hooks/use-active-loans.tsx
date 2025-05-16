import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

export type LoanStatus = 'active' | 'pending' | 'completed' | 'defaulted' | 'liquidated';

export interface Loan {
  id: string;
  skinId: string;
  skinName: string;
  skinImageUrl: string;
  loanAmount: number;
  interestRate: number;
  totalToRepay: number;
  startDate: string;
  dueDate: string;
  duration: number;
  status: LoanStatus;
  repaymentProgress?: number;
  tradeOfferId?: string;
}

export function useActiveLoans() {
  const { isAuthenticated, profile } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fonction pour récupérer les prêts actifs
  const fetchLoans = async () => {
    if (!isAuthenticated || !profile?.walletAddress) {
      setLoans([]);
      setIsLoading(false);
      setError("Vous devez être connecté pour voir vos prêts");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Pour le MVP, nous utilisons des données mockées
      // Dans une version future, cela serait remplacé par un appel API
      const mockLoans: Loan[] = [
        {
          id: "loan1",
          skinId: "1",
          skinName: "AWP | Dragon Lore",
          skinImageUrl: "/awp.webp",
          loanAmount: 975,
          interestRate: 2.5,
          totalToRepay: 999.38,
          startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 jours dans le passé
          dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 jours dans le futur
          duration: 14,
          status: 'active',
          repaymentProgress: 0
        },
        {
          id: "loan2",
          skinId: "2",
          skinName: "Karambit | Fade",
          skinImageUrl: "/karambit.webp",
          loanAmount: 520,
          interestRate: 2.5,
          totalToRepay: 533,
          startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 jours dans le passé
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 jours dans le futur
          duration: 14,
          status: 'active',
          repaymentProgress: 30
        },
        {
          id: "loan3",
          skinId: "3",
          skinName: "M4A4 | Howl",
          skinImageUrl: "/m4a4.webp",
          loanAmount: 1200,
          interestRate: 2.5,
          totalToRepay: 1230,
          startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 jour dans le passé
          dueDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(), // 29 jours dans le futur
          duration: 30,
          status: 'active',
          repaymentProgress: 0
        }
      ];

      setLoans(mockLoans);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error("Erreur lors de la récupération des prêts:", error);
      setError("Impossible de récupérer vos prêts. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les prêts lorsque l'utilisateur est authentifié
  useEffect(() => {
    if (isAuthenticated && profile?.walletAddress) {
      fetchLoans();
    } else {
      setLoans([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, profile?.walletAddress]);

  // Fonction pour rembourser un prêt (simulée pour le MVP)
  const repayLoan = async (loanId: string, amount: number) => {
    // Simuler un appel API pour le remboursement
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          setLoans(prevLoans => 
            prevLoans.map(loan => {
              if (loan.id === loanId) {
                const currentRepaid = (loan.repaymentProgress || 0) / 100 * loan.totalToRepay;
                const newRepaid = currentRepaid + amount;
                const newProgress = Math.min(100, (newRepaid / loan.totalToRepay) * 100);
                
                return {
                  ...loan,
                  repaymentProgress: newProgress,
                  status: newProgress >= 100 ? 'completed' as LoanStatus : loan.status
                };
              }
              return loan;
            })
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 1500); // Simuler un délai de réseau
    });
  };

  return {
    loans,
    isLoading,
    error,
    lastUpdated,
    refreshLoans: fetchLoans,
    repayLoan
  };
}
