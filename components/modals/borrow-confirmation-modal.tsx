"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { SteamItem } from "@/hooks/use-steam-inventory"
import { useTradeApi } from "@/hooks/use-trade-api"
import { TradeStatus, TradeStatusGroups, TradeStatusUtils, isTradeAccepted, isTradeTerminated, isTradePending, isTradeProblematic, isTradeRequiringAction } from "@/lib/trade-states"
import { BorrowCancelModal } from "@/components/borrow/borrow-cancel-modal"

interface BorrowConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSkin: string | null
  displaySkins: SteamItem[]
  loanAmount: number
  loanDuration: number
  extractSkinInfo: (marketHashName: string) => { name: string; wear: string }
  onConfirm: () => void
}

export function BorrowConfirmationModal({
  open,
  onOpenChange,
  selectedSkin,
  displaySkins,
  loanAmount,
  loanDuration,
  extractSkinInfo,
  onConfirm
}: BorrowConfirmationModalProps) {
  // Fonction pour calculer le taux d'intérêt
  const getInterestRate = (duration: number) => {
    const minDuration = 7
    const maxDuration = 35
    const minRate = 25
    const maxRate = 32
    
    const rate = minRate + (maxRate - minRate) * (duration - minDuration) / (maxDuration - minDuration)
    return Math.round(rate * 10) / 10
  }
  // Référence pour gérer les changements d'ouverture/fermeture du modal
  const handleOpenChange = (newOpenState: boolean) => {
    // Si le modal se ferme, réinitialiser les états
    if (!newOpenState) {
      // Délai court pour éviter un flash visuel pendant la fermeture
      setTimeout(() => {
        setProcessingStep(0);
        setIsProcessing(false);
        setTransactionComplete(false);
        setTransactionError(null);
        setTransactionMessage(null);
        setTradeOffer(null);
      }, 300);
    }
    
    // Appeler le gestionnaire d'origine
    onOpenChange(newOpenState);
  };
  // States for the borrowing process
  const [processingStep, setProcessingStep] = useState(0) // 0: initial, 1-4: processing steps
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionComplete, setTransactionComplete] = useState(false)
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const [transactionMessage, setTransactionMessage] = useState<{
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
  } | null>(null)
  
  // État pour gérer l'affichage du modal d'annulation
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Function to simulate delay (for animations)
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Utiliser le hook pour les appels API de trading
  const { createTrade, checkTradeStatus, cancelTrade, isLoading: isApiLoading, error: apiError, currentTradeId } = useTradeApi();
  
  // État pour stocker les détails de l'offre de trade
  const [tradeOffer, setTradeOffer] = useState<{
    tradeId: string;
    tradeOfferId: string;
    tradeOfferUrl: string;
  } | null>(null);
  
  // Vérifier périodiquement le statut du trade
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (tradeOffer && isProcessing && processingStep === 2) {
      interval = setInterval(async () => {
        const status = await checkTradeStatus(tradeOffer.tradeId);
        
        if (status) {
          // Vérifier si le trade est accepté (succès) ou en escrow (considéré comme accepté pour notre cas d'usage)
          if (isTradeAccepted(status.trade.status, status.offerDetails.state) || 
              status.trade.status === TradeStatus.IN_ESCROW || 
              status.offerDetails.state === TradeStatus.IN_ESCROW) {
            // Trade accepté, passer à l'étape suivante
            setProcessingStep(3);
            clearInterval(interval);
            
            // Simuler le transfert USDC et la finalisation
            setTimeout(() => {
              setProcessingStep(4);
              setTimeout(() => {
                setTransactionComplete(true);
                setIsProcessing(false);
                onConfirm(); // Informer le composant parent que le prêt est confirmé
              }, 1500);
            }, 2000);
          } else if (isTradeTerminated(status.trade.status, status.offerDetails.state)) {
            // Trade terminé sans échange (annulé, refusé, expiré, etc.)
            const statusMessage = TradeStatusUtils.getStatusMessage(status.trade.status || status.offerDetails.state);
            setTransactionError(`The trade offer was ${statusMessage.toLowerCase()}.`);
            setIsProcessing(false);
            clearInterval(interval);
          } else if (isTradeProblematic(status.trade.status, status.offerDetails.state)) {
            // Trade avec un problème (invalid, error, etc.)
            const statusMessage = TradeStatusUtils.getStatusMessage(status.trade.status || status.offerDetails.state);
            setTransactionError(`There was a problem with the trade: ${statusMessage}.`);
            setIsProcessing(false);
            clearInterval(interval);
          } else if (isTradeRequiringAction(status.trade.status, status.offerDetails.state)) {
            // Trade nécessitant une action (countered)
            setTransactionError(TradeStatusUtils.getStatusMessage(TradeStatus.COUNTERED) + ". Please cancel and try again.");
            setIsProcessing(false);
            clearInterval(interval);
          }
          // Sinon, continuer à vérifier (statut "sent" ou "pending")
        }
      }, 5000); // Vérifier toutes les 5 secondes
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tradeOffer, isProcessing, processingStep]);
  
  // Fonction pour gérer le processus d'emprunt
  const handleBorrow = async () => {
    if (!selectedSkin) {
      setTransactionError("No skin selected");
      return;
    }
    
    try {
      setIsProcessing(true);
      setTransactionError(null);
      
      // Étape 1: Vérification du skin et création de l'offre de trade
      setProcessingStep(1);
      
      const selectedSkinData = displaySkins.find(skin => skin.id === selectedSkin);
      if (!selectedSkinData) {
        throw new Error("Selected skin not found");
      }
      
      // Créer l'offre de trade
      const tradeResponse = await createTrade(
        selectedSkinData.id,
        `Loan collateral for ${loanAmount.toFixed(2)} USDC`
      );
      
      if (!tradeResponse) {
        throw new Error("Failed to create trade offer");
      }
      
      // Stocker les détails de l'offre
      setTradeOffer({
        tradeId: tradeResponse.tradeId,
        tradeOfferId: tradeResponse.tradeOffer.offerId,
        tradeOfferUrl: tradeResponse.tradeOffer.url
      });
      
      // Étape 2: Attente de l'acceptation du trade
      setProcessingStep(2);
      
      // La vérification périodique est gérée par l'useEffect ci-dessus
      
    } catch (error: any) {
      console.error("Erreur lors du processus d'emprunt:", error);
      setTransactionError(error.message || "An error occurred. Please try again.");
      setIsProcessing(false);
    }
  };
  
  // Fonction pour annuler le trade
  const handleCancelTrade = async () => {
    if (tradeOffer) {
      try {
        setIsProcessing(true);
        
        const result = await cancelTrade(tradeOffer.tradeId);
        
        if (result && result.success) {
          // Réinitialiser les états du modal de confirmation
          setTransactionError(null);
          setTransactionComplete(false);
          setIsProcessing(false);
          setProcessingStep(0);
          
          // Afficher le modal d'annulation et fermer le modal de confirmation
          setShowCancelModal(true);
          onOpenChange(false);
        } else {
          // Afficher un message d'erreur
          setTransactionError(result?.message || 'Failed to cancel the trade offer.');
          setIsProcessing(false);
        }
      } catch (error: any) {
        console.error('Error canceling trade:', error);
        setTransactionError(error.message || 'An error occurred while canceling the trade.');
        setIsProcessing(false);
      }
    }
  };
  
  // Fonction pour fermer le modal d'annulation
  const handleCancelModalClose = () => {
    setShowCancelModal(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px] bg-[#0f1420] border border-[#1f2937]">
          <DialogHeader>
            <DialogTitle className="text-center">{transactionComplete ? "Loan Confirmed" : "Confirm Loan"}</DialogTitle>
            <DialogDescription className="text-center">
              {transactionComplete ? "Your loan has been processed successfully" : "Review and confirm your loan details"}
            </DialogDescription>
          </DialogHeader>
        
        {!transactionComplete && !transactionError && !isProcessing && (
          <div className="space-y-4">
            {/* Détails du skin */}
            <div className="bg-[#1f2937] border border-[#1f2937] rounded-lg p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-md overflow-hidden relative">
                <Image 
                  src={displaySkins.find(skin => skin.id === selectedSkin)?.imageUrl || ''}
                  alt={displaySkins.find(skin => skin.id === selectedSkin)?.market_hash_name || ''}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium">
                  {selectedSkin && extractSkinInfo(displaySkins.find(skin => skin.id === selectedSkin)?.market_hash_name || '').name}
                </h4>
                <p className="text-xs text-gray-400">
                  {selectedSkin && extractSkinInfo(displaySkins.find(skin => skin.id === selectedSkin)?.market_hash_name || '').wear}
                </p>
              </div>
            </div>
            
            {/* Détails du prêt */}
            <div className="bg-[#1f2937] border border-[#1f2937] rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Loan amount</span>
                <span className="text-sm font-medium">${loanAmount.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Duration</span>
                <span className="text-sm font-medium">{loanDuration} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Interest</span>
                <span className="text-sm font-medium">{getInterestRate(loanDuration)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Due date</span>
                <span className="text-sm font-medium">{new Date(Date.now() + loanDuration * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#2a3548] mt-2">
                <span className="text-sm font-medium">Total to repay</span>
                <span className="text-sm font-medium">${(loanAmount * (1 + getInterestRate(loanDuration) / 100)).toFixed(2)} USDC</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Étapes de traitement */}
        {isProcessing && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
              <p className="text-sm font-medium">
                {processingStep === 1 && "Creating trade offer..."}
                {processingStep === 2 && "Waiting for trade confirmation..."}
                {processingStep === 3 && "Transferring USDC..."}
                {processingStep === 4 && "Finalizing loan..."}
              </p>
              
              {/* Afficher le lien vers l'offre de trade si disponible et à l'étape 2 */}
              {processingStep === 2 && tradeOffer && (
                <a 
                  href={tradeOffer.tradeOfferUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#6366f1] hover:underline mt-1"
                >
                  Open trade offer <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            
            <div className="w-full bg-[#1f2937] border border-[#1f2937] h-1 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#6366f1] to-[#22d3ee] transition-all duration-300" 
                style={{ width: `${(processingStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Message de succès */}
        {transactionComplete && (
          <div className="py-6 space-y-4">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-center text-sm text-gray-400">
                Your loan of <span className="text-white font-medium">${loanAmount.toFixed(2)} USDC</span> has been sent to your wallet. You can now use these funds as you wish.
              </p>
            </div>
            
            <div className="bg-[#1f2937] rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Due date</span>
                <span className="text-sm font-medium">{new Date(Date.now() + loanDuration * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Amount to repay</span>
                <span className="text-sm font-medium">${(loanAmount * (1 + getInterestRate(loanDuration) / 100)).toFixed(2)} USDC</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {transactionError && (
          <div className="py-6 space-y-4">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-center text-sm text-red-400">
                {transactionError}
              </p>
            </div>
          </div>
        )}
        
        {/* Transaction message (success, info, etc.) */}
        {transactionMessage && (
          <div className="py-6 space-y-4">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                transactionMessage.type === 'success' ? 'bg-green-500/20' : 
                transactionMessage.type === 'warning' ? 'bg-amber-500/20' : 
                transactionMessage.type === 'error' ? 'bg-red-500/20' : 'bg-blue-500/20'
              }`}>
                {transactionMessage.type === 'success' && <Check className="h-8 w-8 text-green-500" />}
                {transactionMessage.type === 'warning' && <AlertCircle className="h-8 w-8 text-amber-500" />}
                {transactionMessage.type === 'error' && <AlertCircle className="h-8 w-8 text-red-500" />}
                {transactionMessage.type === 'info' && <AlertCircle className="h-8 w-8 text-blue-500" />}
              </div>
              <div className="text-center">
                <h3 className="text-base font-medium mb-1">{transactionMessage.title}</h3>
                <p className="text-sm text-gray-400">{transactionMessage.message}</p>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          {/* Utiliser une approche conditionnelle pour n'afficher qu'un seul ensemble de boutons */}
          {(() => {
            // État d'erreur (priorité la plus haute)
            if (transactionError) {
              return (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => onOpenChange(false)} 
                    className="border-[#2a3548] text-gray-400 hover:bg-[#1f2937] hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      setTransactionError(null);
                      handleBorrow();
                    }} 
                    className="bg-gradient-to-r from-[#6366f1] to-[#22d3ee] hover:from-[#4f46e5] hover:to-[#0ea5e9]"
                  >
                    Try Again
                  </Button>
                </>
              );
            }
            
            // État de succès
            if (transactionComplete) {
              return (
                <Button 
                  onClick={() => onOpenChange(false)} 
                  className="bg-gradient-to-r from-[#6366f1] to-[#22d3ee] hover:from-[#4f46e5] hover:to-[#0ea5e9]"
                >
                  Close
                </Button>
              );
            }
            
            // État de traitement - Attente de confirmation du trade
            if (isProcessing && processingStep === 2) {
              return (
                <Button 
                  variant="outline" 
                  onClick={handleCancelTrade} 
                  className="border-[#2a3548] text-gray-400 hover:bg-[#1f2937] hover:text-white"
                >
                  Cancel Trade
                </Button>
              );
            }
            
            // État de traitement - Autres étapes
            if (isProcessing) {
              return <div className="h-10"></div>; // Espace réservé pour maintenir la hauteur du footer
            }
            
            // État initial - Confirmation du prêt (par défaut)
            return (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)} 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-border-[#2a3548] text-gray-400 hover:bg-[#1f2937] hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBorrow} 
                  className="bg-gradient-to-r from-[#6366f1] to-[#22d3ee] hover:from-[#4f46e5] hover:to-[#0ea5e9]"
                >
                  Confirm Loan
                </Button>
              </>
            );
          })()}
        </DialogFooter>
        </DialogContent>
      </Dialog>

      
      
      {/* Modal d'annulation */}
      <BorrowCancelModal 
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        item={displaySkins.find(skin => skin.market_hash_name === selectedSkin) || null}
        onClose={handleCancelModalClose}
      />
    </>
  )
}
