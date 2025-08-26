"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

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

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold font-poppins text-white mb-3">Featured Skins</h2>
        <p className="text-[#a1a1c5] text-lg">Premium CS2 skins ready for purchase with HUCH tokens</p>
      </div>

      {/* Featured Skins Grid - Modern 4-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div 
              key={`skeleton-${index}`}
              className="group bg-gradient-to-br from-[#0F0F2A] to-[#1a1a3a] rounded-2xl border border-[#6366f1]/20 overflow-hidden animate-pulse"
            >
              {/* Overlay grain */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 opacity-[.03] rounded-2xl"
                style={{
                  backgroundImage: "url('/grainbg.avif')",
                  backgroundRepeat: "repeat"
                }}
              />
              
              {/* Skeleton Image Container */}
              <div className="relative h-48 bg-gradient-to-br from-[#1a1a2e]/50 to-[#16213e]/50 flex items-center justify-center p-6 rounded-t-2xl overflow-hidden">
                <div className="w-32 h-20 bg-gray-600 rounded-lg"></div>
                {/* Price Badge Skeleton */}
                <div className="absolute top-4 right-4 bg-gray-600 w-20 h-6 rounded-full"></div>
              </div>
              
              {/* Skeleton Info */}
              <div className="p-5 space-y-3 relative z-20">
                <div className="h-6 bg-gray-600 rounded w-3/4"></div>
                
                {/* Details Grid Skeleton */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-[#161e2e]/50 rounded-lg border border-[#6366f1]/10">
                    <div className="h-3 bg-gray-600 rounded w-12"></div>
                    <div className="h-3 bg-gray-600 rounded w-16"></div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[#161e2e]/50 rounded-lg border border-[#6366f1]/10">
                    <div className="h-3 bg-gray-600 rounded w-10"></div>
                    <div className="h-3 bg-gray-600 rounded w-14"></div>
                  </div>
                </div>
                
                {/* Button Skeleton */}
                <div className="w-full h-10 bg-gray-600 rounded-xl mt-4"></div>
              </div>
            </div>
          ))
        ) : (
          tokenizedSkins.slice(0, 4).map((skin, index) => (
          <div 
            key={index}
            className="group bg-gradient-to-br from-[#0F0F2A] to-[#1a1a3a] rounded-2xl border border-[#6366f1]/20 hover:border-[#6366f1]/60 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-[#6366f1]/25 overflow-hidden"
            onClick={() => onSkinSelect(skin)}
          >
            {/* Overlay grain */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 opacity-[.03] rounded-2xl"
              style={{
                backgroundImage: "url('/grainbg.avif')",
                backgroundRepeat: "repeat"
              }}
            />
            
            {/* Skin Image Container */}
            <div className="relative h-48 bg-gradient-to-br from-[#1a1a2e]/50 to-[#16213e]/50 flex items-center justify-center p-6 rounded-t-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <Image
                src={skin.image}
                alt={skin.name}
                width={200}
                height={120}
                className="object-contain group-hover:scale-110 transition-transform duration-500 relative z-10"
              />
              
              {/* Price Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-[#6366f1] to-[#7f8fff] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                ${skin.price.toFixed(2)}
              </div>
            </div>
            
            {/* Skin Info */}
            <div className="p-5 space-y-3 relative z-20">
              <h3 className="font-bold text-white text-lg leading-tight">{skin.name}</h3>
              
              {/* Details Grid */}
              <div className="space-y-2 text-sm">
                {skin.wear && (
                  <div className="flex justify-between items-center p-2 bg-[#161e2e]/50 rounded-lg border border-[#6366f1]/10">
                    <span className="text-[#a1a1c5]">Wear</span>
                    <span className="text-white font-medium">{skin.wear}</span>
                  </div>
                )}
                {skin.float !== undefined && (
                  <div className="flex justify-between items-center p-2 bg-[#161e2e]/50 rounded-lg border border-[#6366f1]/10">
                    <span className="text-[#a1a1c5]">Float</span>
                    <span className="text-white font-medium">{skin.float.toFixed(4)}</span>
                  </div>
                )}
              </div>
              
              {/* Purchase Button */}
              <Button
                className="w-full bg-gradient-to-r from-[#6366f1] to-[#7f8fff] hover:from-[#5855eb] hover:to-[#6d28d9] text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onSkinSelect(skin);
                }}
              >
                Purchase Now
              </Button>
            </div>
          </div>
        )))}
      </div>
      
      {/* Browse All Button */}
      <div className="text-center">
        <Button
          className="bg-gradient-to-r from-[#6366f1] to-[#7f8fff] hover:from-[#5855eb] hover:to-[#6d28d9] text-white font-bold border-none transition-all duration-300 px-12 py-4 text-xl rounded-2xl shadow-2xl hover:shadow-[#6366f1]/50 hover:scale-105 transform relative overflow-hidden group"
          onClick={onBrowseAll}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          <span className="relative z-10">Browse All Skins</span>
        </Button>
      </div>
    </div>
  )
}