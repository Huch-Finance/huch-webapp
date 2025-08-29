"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useHuchOracle } from "@/hooks/use-huch-oracle"
import { useMetaplexPurchase } from "@/hooks/use-metaplex-purchase"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface TokenizedSkin {
  id: string;
  name: string;
  price: number;
  image: string;
  wear?: string;
  float?: number;
}

interface PurchaseDetailsModalProps {
  skin: TokenizedSkin | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (skin: TokenizedSkin) => void; // Made optional since we handle it internally now
}

export function PurchaseDetailsModal({ skin, isOpen, onClose }: PurchaseDetailsModalProps) {
  const { convertUsdToHuch, formatHuchAmount } = useHuchOracle()
  const { 
    purchaseNFT, 
    isLoading: isPurchasing, 
    error: purchaseError,
    validatePurchase,
    huchBalance,
    clearError
  } = useMetaplexPurchase()
  
  const [huchPrice, setHuchPrice] = useState<number | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false)
  const [transactionInfo, setTransactionInfo] = useState<any>(null)

  // Calculate HUCH price when modal opens
  useEffect(() => {
    if (skin && isOpen) {
      convertUsdToHuch(skin.price).then(huchAmount => {
        setHuchPrice(huchAmount || (skin.price * 10)) // Fallback to 10x conversion
      })
    }
  }, [skin, isOpen, convertUsdToHuch])

  // Validate purchase when modal opens or price changes
  useEffect(() => {
    if (skin && isOpen && huchPrice) {
      validatePurchase({
        nftMint: skin.id,
        maxPriceInHuch: huchPrice
      }).then(validation => {
        setValidationErrors(validation.errors)
        setValidationWarnings(validation.warnings)
      })
    }
  }, [skin, isOpen, huchPrice, validatePurchase])

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setValidationErrors([])
      setValidationWarnings([])
      setPurchaseSuccess(false)
      setTransactionInfo(null)
      clearError()
    }
  }, [isOpen, clearError])

  const handlePurchase = async () => {
    if (!skin || !huchPrice) return

    try {
      const result = await purchaseNFT({
        nftMint: skin.id,
        maxPriceInHuch: huchPrice
      })

      if (result.success) {
        setPurchaseSuccess(true)
        setTransactionInfo(result)
        
        // Handle different types of transactions
        if (result.requiresSignature) {
          console.log('Transaction requires signature - user needs to confirm in wallet')
          // Don't auto-close - let user see the transaction info
        } else if (result.message?.includes('Mock')) {
          console.log('Mock transaction completed')
          // Auto-close after showing mock completion
          setTimeout(() => {
            onClose()
          }, 3000)
        } else {
          console.log('Real transaction completed')
          // Auto-close after showing real transaction completion
          setTimeout(() => {
            onClose()
            // Refresh page to show updated balance and inventory
            window.location.reload()
          }, 4000)
        }
      }
    } catch (error) {
      console.error('Purchase failed:', error)
    }
  }

  if (!skin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] border-none p-0 overflow-hidden bg-transparent shadow-none">
        <div className="flex h-full gap-4 lg:gap-6">
          {/* Left side - Floating Card */}
          <div className="flex-1 flex items-center justify-center min-w-0">
            <div 
              className="relative w-full max-w-[400px] aspect-[3/4] cursor-pointer group overflow-hidden rounded-3xl"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'all 0.4s ease'
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 8;
                const rotateY = (centerX - x) / 8;
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.08)`;
                e.currentTarget.style.boxShadow = '0 35px 80px -15px rgba(99, 102, 241, 0.4)';
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 8;
                const rotateY = (centerX - x) / 8;
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.08)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(99, 102, 241, 0.25)';
              }}
            >
              <Image
                src={skin.image || "/cscards.png"}
                alt={skin.name}
                fill
                className="object-contain rounded-3xl group-hover:brightness-115 transition-all duration-400"
                style={{ objectFit: 'contain' }}
                unoptimized={true}
              />
              {/* Enhanced Shine overlay */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-600 pointer-events-none group-hover:animate-shine"
                style={{
                  background: 'linear-gradient(45deg, transparent 20%, rgba(255, 255, 255, 0.5) 50%, transparent 80%)',
                  transform: 'translateX(-100%)'
                }}
              />
              {/* Additional glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-400 pointer-events-none rounded-3xl bg-gradient-to-r from-[#6366f1]/20 via-transparent to-[#7f8fff]/20" />
            </div>
          </div>

          {/* Right side - Purchase Details */}
          <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl min-w-0 flex flex-col bg-gradient-to-br from-[#1a1b3a]/60 to-[#2d1b69]/60 backdrop-blur-sm rounded-2xl border border-[#6366f1]/20">
            <div className="p-4 lg:p-6 xl:p-8 flex-1 overflow-y-auto custom-scrollbar">
            {/* Skin Details */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3 font-poppins">{skin.name}</h2>
              <p className="text-[#a1a1c5] text-sm mb-4">NFT Mint: {skin.id.slice(0, 12)}...</p>
              
              {/* Detailed Attributes */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {skin.wear && (
                  <div className="bg-[#6366f1]/10 border border-[#6366f1]/20 px-4 py-2 rounded-lg">
                    <p className="text-[#a1a1c5] text-xs mb-1">Condition</p>
                    <p className="text-white font-semibold">{skin.wear}</p>
                  </div>
                )}
                {skin.float && (
                  <div className="bg-[#7f8fff]/10 border border-[#7f8fff]/20 px-4 py-2 rounded-lg">
                    <p className="text-[#a1a1c5] text-xs mb-1">Float Value</p>
                    <p className="text-white font-semibold">{skin.float}</p>
                  </div>
                )}
                <div className="bg-[#10b981]/10 border border-[#10b981]/20 px-4 py-2 rounded-lg">
                  <p className="text-[#a1a1c5] text-xs mb-1">Rarity</p>
                  <p className="text-white font-semibold">{(skin as any).rarity || 'Classified'}</p>
                </div>
                <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-4 py-2 rounded-lg">
                  <p className="text-[#a1a1c5] text-xs mb-1">Collection</p>
                  <p className="text-white font-semibold">CS2 Skins</p>
                </div>
              </div>

              {/* Market Stats */}
              <div className="bg-gradient-to-r from-[#6366f1]/5 to-[#7f8fff]/5 border border-[#6366f1]/10 rounded-lg p-4 mb-6">
                <h3 className="text-white font-semibold mb-3">Market Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#a1a1c5] mb-1">Market Value</p>
                    <p className="text-white font-bold">${skin.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[#a1a1c5] mb-1">Solana Price</p>
                    <p className="text-white font-bold">{(skin.price / 100).toFixed(2)} SOL</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Information */}
            <div className="bg-gradient-to-r from-[#1f2937]/10 to-[#374151]/10 backdrop-blur-sm border border-[#374151]/20 rounded-2xl p-4 mb-4 w-full max-w-md">
              <div className="text-center">
                <p className="text-[#a1a1c5] text-sm mb-2">Your HUCH Balance</p>
                <div className="text-white text-2xl font-bold">
                  {formatHuchAmount(huchBalance)} HUCH
                </div>
                <p className="text-[#a1a1c5] text-xs mt-1">Available for purchases</p>
              </div>
            </div>

            {/* Price Information */}
            <div className="bg-gradient-to-r from-[#6366f1]/10 to-[#7f8fff]/10 backdrop-blur-sm border border-[#6366f1]/20 rounded-2xl p-4 mb-4 w-full max-w-md">
              <div className="text-center">
                <p className="text-[#a1a1c5] text-sm mb-2">Purchase Price</p>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="text-white text-3xl font-bold">
                    {huchPrice ? formatHuchAmount(huchPrice) : 'Loading...'} HUCH
                  </div>
                </div>
                <p className="text-[#a1a1c5] text-xs">≈ ${skin.price.toLocaleString()} USD</p>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-gradient-to-r from-[#ef4444]/10 to-[#dc2626]/10 backdrop-blur-sm border border-[#ef4444]/20 rounded-2xl p-4 mb-4 w-full max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 font-semibold text-sm">Purchase Issues</span>
                </div>
                {validationErrors.map((error, index) => (
                  <p key={index} className="text-red-300 text-xs mb-1">• {error}</p>
                ))}
              </div>
            )}

            {/* Validation Warnings */}
            {validationWarnings.length > 0 && (
              <div className="bg-gradient-to-r from-[#f59e0b]/10 to-[#d97706]/10 backdrop-blur-sm border border-[#f59e0b]/20 rounded-2xl p-4 mb-4 w-full max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold text-sm">Warning</span>
                </div>
                {validationWarnings.map((warning, index) => (
                  <p key={index} className="text-yellow-300 text-xs mb-1">• {warning}</p>
                ))}
              </div>
            )}

            {/* Purchase Error */}
            {purchaseError && (
              <div className="bg-gradient-to-r from-[#ef4444]/10 to-[#dc2626]/10 backdrop-blur-sm border border-[#ef4444]/20 rounded-2xl p-4 mb-4 w-full max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 font-semibold text-sm">Purchase Failed</span>
                </div>
                <p className="text-red-300 text-xs">{purchaseError}</p>
              </div>
            )}

            {/* Purchase Success */}
            {purchaseSuccess && transactionInfo && (
              <div className="bg-gradient-to-r from-[#10b981]/10 to-[#34d399]/10 backdrop-blur-sm border border-[#10b981]/20 rounded-2xl p-4 mb-4 w-full max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-semibold text-sm">
                    {transactionInfo.requiresSignature ? 'Signature Required' : 'Purchase Successful!'}
                  </span>
                </div>
                <p className="text-green-300 text-xs mb-2">
                  {transactionInfo.message || 'NFT purchased with HUCH tokens'}
                </p>
                {transactionInfo.transactionId && transactionInfo.transactionId !== 'unknown_signature' && (
                  <div className="mt-2">
                    <p className="text-green-200 text-xs">Transaction ID:</p>
                    <p className="text-green-100 text-xs font-mono break-all">
                      {transactionInfo.transactionId}
                    </p>
                  </div>
                )}
                {transactionInfo.requiresSignature && (
                  <p className="text-yellow-300 text-xs mt-2">
                    ⚠️ Check your wallet for transaction confirmation
                  </p>
                )}
                {transactionInfo.message?.includes('Mock') && (
                  <p className="text-blue-300 text-xs mt-2">
                    ℹ️ This is a demo transaction - no real tokens were transferred
                  </p>
                )}
              </div>
            )}

            {/* Purchase Options */}
            <div className="w-full max-w-md mb-4">
              <div className="bg-gradient-to-r from-[#10b981]/10 to-[#34d399]/10 backdrop-blur-sm border border-[#10b981]/20 rounded-2xl p-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full"></div>
                  <span className="text-white font-semibold">Metaplex Auction House</span>
                </div>
                <p className="text-[#a1a1c5] text-sm text-center">Secure purchase using real HUCH tokens on Solana mainnet</p>
              </div>
            </div>

            {/* Purchase Button */}
            <div className="w-full mb-6">
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing || validationErrors.length > 0 || purchaseSuccess || !huchPrice}
                className="w-full bg-gradient-to-r from-[#6366f1] to-[#7f8fff] hover:from-[#5855eb] hover:to-[#6366f1] text-white font-bold py-4 lg:py-6 px-6 lg:px-12 rounded-2xl text-lg lg:text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#6366f1]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="flex items-center justify-center gap-3 lg:gap-4">
                  {isPurchasing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : purchaseSuccess ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <div className="w-4 h-4 bg-gradient-to-r from-[#f59e0b] to-[#f97316] rounded-full"></div>
                  )}
                  <span className="text-sm lg:text-base xl:text-lg">
                    {isPurchasing ? 'Processing...' : 
                     purchaseSuccess ? 'Purchase Complete!' :
                     `Purchase for ${huchPrice ? formatHuchAmount(huchPrice) : 'Loading...'} HUCH`}
                  </span>
                </div>
              </Button>
            </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}