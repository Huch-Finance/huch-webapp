"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { SteamItem } from "@/hooks/use-steam-inventory"

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
  // States for the borrowing process
  const [processingStep, setProcessingStep] = useState(0) // 0: initial, 1-4: processing steps
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionComplete, setTransactionComplete] = useState(false)
  const [transactionError, setTransactionError] = useState<string | null>(null)

  // Function to simulate delay (for animations)
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Fonction pour gérer le processus d'emprunt
  const handleBorrow = async () => {
    try {
      setIsProcessing(true);
      setTransactionError(null);
      
      // Étape 1: Vérification du skin
      setProcessingStep(1);
      await delay(1500);
      
      // Étape 2: Préparation du prêt
      setProcessingStep(2);
      await delay(2000);
      
      // Étape 3: Transfert des USDC (utilisation de Privy pour la transaction Solana)
      setProcessingStep(3);
      
      // Ici, nous simulons l'appel à l'API, mais dans une implémentation réelle,
      // vous utiliseriez Privy pour gérer la transaction Solana
      await delay(2500);
      
      // Étape 4: Confirmation
      setProcessingStep(4);
      await delay(1500);
      
      // Transaction terminée avec succès
      setTransactionComplete(true);
      
    } catch (error) {
      console.error("Erreur lors du processus d'emprunt:", error);
      setTransactionError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1219] border-[#2a3548] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {transactionComplete ? "Loan successful!" : "Confirm your loan"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {transactionComplete 
              ? "Your loan has been processed successfully." 
              : "Verify the details of your loan before confirming."}
          </DialogDescription>
        </DialogHeader>
        
        {!transactionComplete && !transactionError && !isProcessing && (
          <div className="space-y-4 py-2">
            {/* Détails du skin */}
            <div className="bg-[#1f2937] rounded-lg p-3 flex items-center gap-3">
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
            <div className="bg-[#1f2937] rounded-lg p-3 space-y-2">
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
        
        {/* Étapes de traitement */}
        {isProcessing && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
              <p className="text-sm font-medium">
                {processingStep === 1 && "Verifying the skin..."}
                {processingStep === 2 && "Preparing the loan..."}
                {processingStep === 3 && "Transferring USDC..."}
                {processingStep === 4 && "Finalizing..."}
              </p>
            </div>
            
            <div className="w-full bg-[#1f2937] h-1 rounded-full overflow-hidden">
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
              <p className="text-center text-sm text-red-400">
                {transactionError}
              </p>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          {!transactionComplete && !isProcessing && (
            <>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto bg-transparent border-[#2a3548] text-white hover:bg-[#2a3548] hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                className="w-full sm:w-auto bg-[#6366f1] hover:bg-[#5355d1] text-white"
                onClick={handleBorrow}
              >
                Confirm the loan
              </Button>
            </>
          )}
          
          {transactionComplete && (
            <Button 
              className="w-full sm:w-auto bg-[#6366f1] hover:bg-[#5355d1] text-white"
              onClick={() => {
                onOpenChange(false);
                setTransactionComplete(false);
                setProcessingStep(0);
              }}
            >
              Back to home
            </Button>
          )}
          
          {transactionError && (
            <Button 
              className="w-full sm:w-auto bg-[#6366f1] hover:bg-[#5355d1] text-white"
              onClick={() => {
                setTransactionError(null);
                setProcessingStep(0);
              }}
            >
              Try again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
