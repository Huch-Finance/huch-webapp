"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface TokenizedSkin {
  id: string;
  name: string;
  price: number;
  image: string;
  totalQuantity: number;
  availableQuantity: number;
  pricePerItem: number;
}

interface PurchaseDetailsProps {
  selectedSkin: TokenizedSkin | null;
  onPurchase: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseDetails({ 
  selectedSkin, 
  onPurchase, 
  isOpen,
  onClose
}: PurchaseDetailsProps) {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)

  if (!isOpen || !selectedSkin) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#0F0F2A] border border-[#6366f1]/30 rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Overlay grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-[.05] rounded-2xl"
          style={{
            backgroundImage: "url('/grainbg.avif')",
            backgroundRepeat: "repeat"
          }}
        />
        
        {/* Header */}
        <div className="relative z-20 bg-gradient-to-r from-[#6366f1]/20 to-[#7f8fff]/20 border-b border-[#6366f1]/30 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-poppins text-white mb-1">Purchase Details</h2>
              <p className="text-[#a1a1c5] text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-[#6366f1] rounded-full"></span>
                Buy premium CS2 skin
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#a1a1c5] hover:text-white transition-colors p-2 hover:bg-[#6366f1]/20 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col relative z-20 space-y-6">
          {selectedSkin && (
            <>
              {/* Selected Skin Display */}
              <div className="w-full">
                <div className="text-center bg-gradient-to-br from-[#1a1a3a] to-[#0f0f2a] rounded-xl p-4 border border-[#6366f1]/20">
                  <h3 className="text-lg font-bold text-white mb-1">{selectedSkin.name}</h3>
                  <p className="text-sm text-[#a1a1c5] flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Selected for purchase
                  </p>
                </div>
              </div>
              
              {/* Cost Breakdown */}
              <div className="w-full bg-gradient-to-br from-[#1a1a3a] to-[#0f0f2a] rounded-xl p-5 border border-[#6366f1]/20">
                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  Price Breakdown
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#a1a1c5] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                      Item Price
                    </span>
                    <span className="text-white font-semibold">${selectedSkin.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#a1a1c5] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                      Platform Fee (2%)
                    </span>
                    <span className="text-white font-semibold">${(selectedSkin.price * 0.02).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#6366f1]/30 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-lg flex items-center gap-2">
                        Total
                      </span>
                      <span className="text-white font-bold text-xl bg-gradient-to-r from-[#6366f1] to-[#7f8fff] bg-clip-text text-transparent">
                        ${(selectedSkin.price * 1.02).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* How it works - isolated from parent */}
              <div className="w-full text-center">
                <button
                  className="text-[10px] text-[#a1a1c5] underline hover:text-[#6366f1] transition"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setHowItWorksOpen(!howItWorksOpen)
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                  }}
                  type="button"
                >
                  How does purchasing work?
                </button>
                {howItWorksOpen && (
                  <div 
                    className="mt-2 text-[10px] text-[#a1a1c5] bg-[#161e2e] rounded-md p-2 mb-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Purchase premium CS2 skins directly. Buy the quantity you want at the listed price.
                  </div>
                )}
              </div>
              
              {/* Purchase button */}
              <Button
                className="w-full bg-gradient-to-r from-[#6366f1] to-[#7f8fff] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base"
                onClick={onPurchase}
              >
                Buy Item (${(selectedSkin.price * 1.02).toFixed(2)})
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}