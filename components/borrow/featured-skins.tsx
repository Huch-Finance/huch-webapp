"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { getTotalTVL, getTopCardsByPrice } from "@/lib/cscards"
import { PurchaseDetailsModal } from "./purchase-details-modal"

interface TokenizedSkin {
  id: string;
  name: string;
  price: number;
  image: string;
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
  // Modal state
  const [selectedSkin, setSelectedSkin] = useState<TokenizedSkin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate TVL (Total Value Locked) of all skins using utility function
  const totalTVL = getTotalTVL();

  // Get top 4 best skins by price
  const topSkins = [...tokenizedSkins]
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);

  // Handle skin selection
  const handleSkinClick = (skin: TokenizedSkin) => {
    setSelectedSkin(skin);
    setIsModalOpen(true);
  };

  // Handle purchase
  const handlePurchase = (skin: TokenizedSkin) => {
    onSkinSelect(skin);
    setIsModalOpen(false);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSkin(null);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Header with TVL */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
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
      </motion.div>

      {/* Featured Skins Grid - Top 4 in single row */}
      <motion.div 
        className="flex justify-center gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
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
            <motion.div 
              key={index}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              {/* NFT Card Image - Full card is the image */}
              <div 
                className="relative w-[180px] h-[252px] cursor-pointer group overflow-hidden rounded-2xl"
                onClick={() => handleSkinClick(skin)}
                style={{
                  aspectRatio: '750/1050',
                  transformStyle: 'preserve-3d',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = (y - centerY) / 10;
                  const rotateY = (centerX - x) / 10;
                  e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
                  e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(99, 102, 241, 0.25)';
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = (y - centerY) / 10;
                  const rotateY = (centerX - x) / 10;
                  e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Image
                  src={skin.image}
                  alt={skin.name}
                  fill
                  className="object-cover rounded-2xl group-hover:brightness-110 transition-all duration-300"
                  style={{ objectFit: 'cover' }}
                />
                {/* Shine overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:animate-shine"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                    transform: 'translateX(-100%)'
                  }}
                />
              </div>
              
              {/* Price Display */}
              <div className="mt-3 text-center">
                <div className="bg-gradient-to-r from-[#10b981]/20 to-[#34d399]/20 backdrop-blur-sm border border-[#10b981]/30 rounded-xl px-3 py-1.5 inline-block">
                  <span className="text-[#10b981] text-lg font-bold">${skin.price.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Purchase Button - Below card - TVL style */}
              <div 
                className="mt-2 bg-gradient-to-r from-[#6366f1]/20 to-[#7f8fff]/20 backdrop-blur-sm border border-[#6366f1]/30 rounded-2xl px-4 py-2 cursor-pointer hover:from-[#6366f1]/30 hover:to-[#7f8fff]/30 hover:border-[#6366f1]/50 transition-all duration-200"
                onClick={() => handleSkinClick(skin)}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[#6366f1] to-[#7f8fff] rounded-full"></div>
                  <span className="text-white text-sm font-medium">Purchase Now</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
      
      {/* Browse All Button - TVL style */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div 
          className="bg-gradient-to-r from-[#6366f1]/20 to-[#7f8fff]/20 backdrop-blur-sm border border-[#6366f1]/30 rounded-2xl px-8 py-4 cursor-pointer hover:from-[#6366f1]/30 hover:to-[#7f8fff]/30 hover:border-[#6366f1]/50 transition-all duration-300 inline-block hover:scale-105"
          onClick={onBrowseAll}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-r from-[#6366f1] to-[#7f8fff] rounded-full"></div>
            <span className="text-white text-xl font-bold">Browse All Skins</span>
          </div>
        </div>
      </motion.div>

      {/* Purchase Details Modal */}
      <PurchaseDetailsModal
        skin={selectedSkin}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onPurchase={handlePurchase}
      />
    </div>
  )
}