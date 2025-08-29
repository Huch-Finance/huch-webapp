"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useHuchOracle } from "@/hooks/use-huch-oracle"

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
  onPurchase: (skin: TokenizedSkin) => void;
}

export function PurchaseDetailsModal({ skin, isOpen, onClose, onPurchase }: PurchaseDetailsModalProps) {
  const { convertUsdToHuch, formatHuchAmount } = useHuchOracle()
  const [huchPrice, setHuchPrice] = useState<number | null>(null)

  // Calculate HUCH price when modal opens
  useEffect(() => {
    if (skin && isOpen) {
      convertUsdToHuch(skin.price).then(huchAmount => {
        setHuchPrice(huchAmount || (skin.price * 10)) // Fallback to 10x conversion
      })
    }
  }, [skin, isOpen, convertUsdToHuch])

  if (!skin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] border-none p-0 overflow-hidden bg-transparent shadow-none">
        <div className="flex h-full gap-6">
          {/* Left side - Floating Card */}
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="relative w-[400px] h-[560px] cursor-pointer group overflow-hidden rounded-3xl"
              style={{
                aspectRatio: '750/1050',
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
          <div className="w-[450px] p-8 flex flex-col justify-start items-center bg-gradient-to-br from-[#1a1b3a]/60 to-[#2d1b69]/60 backdrop-blur-sm rounded-2xl border border-[#6366f1]/20 overflow-y-auto">
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

            {/* Purchase Options */}
            <div className="w-full max-w-md mb-4">
              <div className="bg-gradient-to-r from-[#10b981]/10 to-[#34d399]/10 backdrop-blur-sm border border-[#10b981]/20 rounded-2xl p-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full"></div>
                  <span className="text-white font-semibold">Instant Purchase</span>
                </div>
                <p className="text-[#a1a1c5] text-sm text-center">Buy now with HUCH tokens for immediate ownership</p>
              </div>
            </div>

            {/* Purchase Button */}
            <div className="w-full max-w-md mb-8">
              <Button
                onClick={() => onPurchase(skin)}
                className="w-full bg-gradient-to-r from-[#6366f1] to-[#7f8fff] hover:from-[#5855eb] hover:to-[#6366f1] text-white font-bold py-6 px-12 rounded-2xl text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#6366f1]/25"
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="w-4 h-4 bg-gradient-to-r from-[#f59e0b] to-[#f97316] rounded-full"></div>
                  <span>
                    Purchase for {huchPrice ? formatHuchAmount(huchPrice) : 'Loading...'} HUCH
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}