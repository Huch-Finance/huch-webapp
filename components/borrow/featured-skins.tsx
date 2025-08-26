"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getTotalTVL, getTopCardsByPrice } from "@/lib/cscards"

interface TokenizedSkin {
  id: string;
  name: string;
  price: number;
  image: string;
  totalQuantity: number;
  availableQuantity: number;
  pricePerItem: number;
  wear?: string;
  float?: number;
}

interface FeaturedSkinsProps {
  tokenizedSkins: TokenizedSkin[];
  onSkinSelect: (skin: TokenizedSkin) => void;
  onBrowseAll: () => void;
  isLoading?: boolean;
}

export function FeaturedSkins({ tokenizedSkins, onSkinSelect, onBrowseAll, isLoading = false }: FeaturedSkinsProps) {
  // Calculate TVL (Total Value Locked) of all skins using utility function
  const totalTVL = getTotalTVL();

  // Get top 4 best skins by price
  const topSkins = [...tokenizedSkins]
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Header with TVL */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold font-poppins text-white mb-3">Featured Skins</h2>
        <p className="text-[#a1a1c5] text-lg mb-4">Premium CS2 skins ready for purchase with HUCH tokens</p>
        
        {/* TVL Display */}
        <div className="bg-gradient-to-r from-[#6366f1]/20 to-[#7f8fff]/20 backdrop-blur-sm border border-[#6366f1]/30 rounded-2xl px-6 py-4 inline-block">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full animate-pulse"></div>
            <span className="text-[#a1a1c5] text-sm font-medium">Huch Vault TVL:</span>
            <span className="text-white text-xl font-bold">${totalTVL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Featured Skins Grid - Top 4 in single row */}
      <div className="flex justify-center gap-4 mb-8">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div 
              key={`skeleton-${index}`}
              className="flex flex-col items-center"
            >
              {/* Skeleton Card - Full image placeholder */}
              <div 
                className="relative w-[180px] h-[252px] bg-gray-600 rounded-2xl animate-pulse"
                style={{
                  aspectRatio: '750/1050'
                }}
              ></div>
              
              {/* Button Skeleton */}
              <div className="mt-3 w-28 h-8 bg-gradient-to-r from-gray-600/20 to-gray-600/20 backdrop-blur-sm border border-gray-600/30 rounded-2xl animate-pulse"></div>
            </div>
          ))
        ) : (
          topSkins.map((skin, index) => (
          <div 
            key={index}
            className="flex flex-col items-center"
          >
            {/* NFT Card Image - Full card is the image */}
            <div 
              className="relative w-[180px] h-[252px] cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-[#6366f1]/25 group"
              onClick={() => onSkinSelect(skin)}
              style={{
                aspectRatio: '750/1050'
              }}
            >
              <Image
                src={skin.image}
                alt={skin.name}
                fill
                className="object-cover rounded-2xl group-hover:brightness-110 transition-all duration-300"
                style={{ objectFit: 'cover' }}
              />
            </div>
            
            {/* Purchase Button - Below card - TVL style */}
            <div 
              className="mt-3 bg-gradient-to-r from-[#6366f1]/20 to-[#7f8fff]/20 backdrop-blur-sm border border-[#6366f1]/30 rounded-2xl px-4 py-2 cursor-pointer hover:from-[#6366f1]/30 hover:to-[#7f8fff]/30 hover:border-[#6366f1]/50 transition-all duration-200"
              onClick={() => onSkinSelect(skin)}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-[#6366f1] to-[#7f8fff] rounded-full"></div>
                <span className="text-white text-sm font-medium">Purchase Now</span>
              </div>
            </div>
          </div>
        )))}
      </div>
      
      {/* Browse All Button - TVL style */}
      <div className="text-center">
        <div 
          className="bg-gradient-to-r from-[#6366f1]/20 to-[#7f8fff]/20 backdrop-blur-sm border border-[#6366f1]/30 rounded-2xl px-8 py-4 cursor-pointer hover:from-[#6366f1]/30 hover:to-[#7f8fff]/30 hover:border-[#6366f1]/50 transition-all duration-300 inline-block hover:scale-105"
          onClick={onBrowseAll}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-r from-[#6366f1] to-[#7f8fff] rounded-full"></div>
            <span className="text-white text-xl font-bold">Browse All Skins</span>
          </div>
        </div>
      </div>
    </div>
  )
}