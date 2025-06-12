"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { SteamItem } from "@/hooks/use-steam-inventory"
import { useAuth } from "@/hooks/use-auth"
import { useLoanApi } from "@/hooks/use-loan-api"

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
  const router = useRouter()
  const { profile, ensureSolanaWallet } = useAuth();
  const { createLoan, isLoading: isLoanLoading, error: loanError } = useLoanApi();

  const handleOpenChange = (newOpenState: boolean) => {
    if (!newOpenState) {
      setTimeout(() => {
        setProcessingStep(0);
        setIsProcessing(false);
        setTransactionComplete(false);
        setTransactionError(null);
        setTransactionMessage(null);
      }, 300);
    }
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
  
  // No longer needed since backend handles the entire flow
  
  // Function to handle the borrowing process
  const handleBorrow = async () => {
    if (!selectedSkin) {
      setTransactionError("No skin selected");
      return;
    }
    const selectedSkinData = displaySkins.find(skin => skin.id === selectedSkin);
    if (!selectedSkinData) {
      setTransactionError("Selected skin not found");
      return;
    }
    
    if (!profile?.wallet) {
      setTransactionError("Please connect your wallet to receive USDC");
      return;
    }
    
    try {
      setIsProcessing(true);
      setTransactionError(null);
      setProcessingStep(1);
      
      console.log("Starting borrow process with amount:", loanAmount);
      console.log("Current profile wallet:", profile?.wallet);
      
      // S'assurer qu'on a un wallet Solana
      let solanaAddress = await ensureSolanaWallet();
      console.log("Solana address from ensureSolanaWallet:", solanaAddress);
      console.log("Current profile wallet:", profile?.wallet);
      
      // Si ensureSolanaWallet n'a pas retourné d'adresse, vérifier si profile.wallet est déjà une adresse Solana
      if (!solanaAddress && profile?.wallet && !profile.wallet.startsWith('0x')) {
        // Le wallet dans le profil pourrait déjà être une adresse Solana
        solanaAddress = profile.wallet;
        console.log("Using profile wallet as Solana address:", solanaAddress);
      }
      
      // Si on n'a toujours pas de wallet Solana, erreur
      if (!solanaAddress) {
        if (profile?.wallet?.startsWith('0x')) {
          setTransactionError("Please connect a Solana wallet to receive USDC tokens. You currently have an Ethereum wallet connected.");
        } else {
          setTransactionError("Please connect a Solana wallet to receive USDC tokens");
        }
        setIsProcessing(false);
        return;
      }
      
      // Use the borrow endpoint that handles both Steam trade AND SPL token transfer
      // The backend will wait for trade acceptance before sending tokens
      const loanResponse = await createLoan({
        items: [selectedSkinData],
        amount: Math.round(loanAmount), // Round amount to avoid BigInt issues
        duration: loanDuration,
        skinId: selectedSkinData.id,
        value: selectedSkinData.basePrice
      });
      
      if (loanResponse && loanResponse.success) {
        // Trade créé avec succès - rediriger vers la page trade-process
        const skinInfo = selectedSkinData ? extractSkinInfo(selectedSkinData.market_hash_name) : null;
        
        console.log("Loan response received:", loanResponse);
        console.log("TradeId:", loanResponse.tradeId, "TradeUrl:", loanResponse.tradeUrl);
        
        // Construire les paramètres d'URL
        const params = new URLSearchParams({
          tradeId: loanResponse.tradeId || '',
          tradeUrl: loanResponse.tradeUrl || '',
          amount: loanAmount.toString(),
          skinName: skinInfo?.name || '',
          skinImage: selectedSkinData?.imageUrl || ''
        });
        
        console.log("Redirecting to trade process page with:", params.toString());
        console.log("Full URL:", `/trade-process?${params.toString()}`);
        
        // Fermer le modal et rediriger
        setIsProcessing(false);
        onOpenChange(false);
        onConfirm();
        
        // Rediriger vers la page trade-process
        router.push(`/trade-process?${params.toString()}`);
      } else {
        // Si échec mais qu'on a une URL de trade, l'ouvrir quand même
        if (loanResponse?.tradeUrl) {
          console.log("Opening trade URL (failed case):", loanResponse.tradeUrl);
          window.open(loanResponse.tradeUrl, '_blank');
        }
        
        setTransactionError(loanError || loanResponse?.message || "Failed to process borrow request");
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("Error during the borrowing process:", error);
      setTransactionError(error.message || "An error occurred. Please try again.");
      setIsProcessing(false);
    }
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
            {/* Skin details */}
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
            
            {/* Loan details */}
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
                <span className="text-sm font-medium">2.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Due date</span>
                <span className="text-sm font-medium">{new Date(Date.now() + loanDuration * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#2a3548] mt-2">
                <span className="text-sm font-medium">Total to repay</span>
                <span className="text-sm font-medium">${(loanAmount * (1 + 0.025 * loanDuration / 7)).toFixed(2)} USDC</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Processing steps */}
        {isProcessing && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
              <p className="text-sm font-medium">
                {processingStep === 1 && "Creating Steam trade and waiting for your acceptance..."}
                {processingStep === 2 && "Waiting for trade confirmation..."}
                {processingStep === 3 && "Transferring USDC..."}
                {processingStep === 4 && "Finalizing loan..."}
              </p>
              
              {processingStep === 1 && (
                <p className="text-xs text-gray-400 mt-2 text-center max-w-sm">
                  Please accept the Steam trade offer that will appear in your Steam client. Your USDC will be sent automatically once the trade is confirmed.
                </p>
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
        
        {/* Success message */}
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
                <span className="text-sm font-medium">${(loanAmount * (1 + 0.025 * loanDuration / 7)).toFixed(2)} USDC</span>
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
              <div className="text-center">
                <p className="text-sm text-red-400 mb-2">
                  {transactionError}
                </p>
                {transactionError.includes("wallet") && (
                  <p className="text-xs text-gray-400">
                    Make sure you have connected a Solana wallet to receive USDC
                  </p>
                )}
              </div>
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
          {/* Use a conditional approach to display only one set of buttons */}
          {(() => {
            // Error state (highest priority)
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
            
            // Success state
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
            
            // Processing state - Any step
            if (isProcessing) {
              return <div className="h-10"></div>; // Space reserved to maintain footer height
            }
            
            // Initial state - Loan confirmation (default)
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

    </>
  )
}
