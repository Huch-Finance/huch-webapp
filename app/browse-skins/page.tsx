"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Grid, List, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { PurchaseDetailsModal } from "@/components/borrow/purchase-details-modal"

interface TokenizedSkin {
  id: string;
  name: string;
  price: number;
  image: string;
  totalQuantity: number;
  availableQuantity: number;
  pricePerItem: number;
  category: string;
  rarity: string;
  condition: string;
  wear?: string;
  float?: number;
}

export default function BrowseSkinsPage() {
  const router = useRouter()
  const { profile } = useAuth()
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRarity, setSelectedRarity] = useState("all")
  const [selectedCondition, setSelectedCondition] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  // Purchase modal states
  const [selectedSkin, setSelectedSkin] = useState<TokenizedSkin | null>(null)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  
  // Mock data - replace with actual API call
  const [allSkins] = useState<TokenizedSkin[]>([
    {
      id: "1",
      name: "AWP | Dragon Lore",
      price: 2500,
      image: "/awp.webp",
      totalQuantity: 10,
      availableQuantity: 8,
      pricePerItem: 2500.00,
      category: "Sniper Rifle",
      rarity: "Covert",
      condition: "Field-Tested",
      wear: "Factory New",
      float: 0.0234
    },
    {
      id: "2",
      name: "Butterfly Knife | Fade",
      price: 1800,
      image: "/btknife.png",
      totalQuantity: 15,
      availableQuantity: 12,
      pricePerItem: 1800.00,
      category: "Knife",
      rarity: "Covert",
      condition: "Factory New",
      wear: "Minimal Wear",
      float: 0.1267
    },
    {
      id: "3",
      name: "AK-47 | Redline",
      price: 120,
      image: "/ak47-redline.png",
      totalQuantity: 25,
      availableQuantity: 18,
      pricePerItem: 120.00,
      category: "Rifle",
      rarity: "Classified",
      condition: "Field-Tested",
      wear: "Field-Tested",
      float: 0.2834
    },
    {
      id: "4",
      name: "M4A4 | Howl",
      price: 3900,
      image: "/M4A4.png",
      totalQuantity: 5,
      availableQuantity: 3,
      pricePerItem: 3900.00,
      category: "Rifle",
      rarity: "Contraband",
      condition: "Minimal Wear",
      wear: "Well-Worn",
      float: 0.4125
    },
    {
      id: "5",
      name: "Karambit | Doppler",
      price: 1200,
      image: "/karambit.webp",
      totalQuantity: 20,
      availableQuantity: 9,
      pricePerItem: 1200.00,
      category: "Knife",
      rarity: "Covert",
      condition: "Factory New",
      wear: "Factory New",
      float: 0.0098
    },
    {
      id: "6",
      name: "Sport Gloves | Pandora's Box",
      price: 800,
      image: "/gloves.webp",
      totalQuantity: 12,
      availableQuantity: 7,
      pricePerItem: 800.00,
      category: "Gloves",
      rarity: "Extraordinary",
      condition: "Well-Worn",
      wear: "Battle-Scarred",
      float: 0.7654
    }
  ])
  
  // Mock user balance data - should match profile page values
  const [usdcBalance] = useState(0.00) // This will match the profile page's splBalance
  const [portfolioValue] = useState(14850.00) // This should match total portfolio value from profile
  
  // Filter skins based on search and filters
  const filteredSkins = allSkins.filter(skin => {
    const matchesSearch = skin.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || skin.category === selectedCategory
    const matchesRarity = selectedRarity === "all" || skin.rarity === selectedRarity
    const matchesCondition = selectedCondition === "all" || skin.condition === selectedCondition
    
    return matchesSearch && matchesCategory && matchesRarity && matchesCondition
  })
  
  // Sort skins
  const sortedSkins = [...filteredSkins].sort((a, b) => {
    switch (sortBy) {
      case "price-high":
        return b.price - a.price
      case "price-low":
        return a.price - b.price
      case "float":
        return (a.float || 0) - (b.float || 0)
      default:
        return a.name.localeCompare(b.name)
    }
  })
  
  // Handle skin selection and modal
  const handleSkinSelect = (skin: TokenizedSkin) => {
    setSelectedSkin(skin)
    setIsPurchaseModalOpen(true)
  }
  
  const handlePurchase = (skin: { id: string; name: string; price: number; image: string; wear?: string; float?: number; }) => {
    // Handle purchase logic here
    console.log('Purchasing skin:', skin)
    setIsPurchaseModalOpen(false)
    setSelectedSkin(null)
  }
  
  // Convert skin to modal format
  const convertSkinForModal = (skin: TokenizedSkin | null) => {
    if (!skin) return null;
    return {
      id: skin.id,
      name: skin.name,
      price: skin.price,
      image: skin.image,
      wear: skin.wear,
      float: skin.float
    };
  }
  
  const categories = ["all", "Rifle", "Sniper Rifle", "Knife", "Gloves", "Pistol"]
  const rarities = ["all", "Consumer Grade", "Industrial Grade", "Mil-Spec", "Restricted", "Classified", "Covert", "Contraband", "Extraordinary"]
  const conditions = ["all", "Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"]
  
  return (
    <div className="min-h-screen text-white lg:ml-24">
      {/* Header */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-[#a1a1c5] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold font-poppins text-[#E1E1F5]">Browse All Skins</h1>
        </div>
        
        {/* Balance and Portfolio Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-[#161e2e] border-[#23263a] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#a1a1c5] text-sm">USDC Balance</p>
                <p className="text-2xl font-bold text-white">${usdcBalance.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#7f8fff] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">$</span>
              </div>
            </div>
          </Card>
          
          <Card className="bg-[#161e2e] border-[#23263a] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#a1a1c5] text-sm">Portfolio Value</p>
                <p className="text-2xl font-bold text-white">${portfolioValue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#34d399] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">₽</span>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Search and Filters */}
        <Card className="bg-[#161e2e] border-[#23263a] p-6 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a1a1c5] w-4 h-4" />
              <Input
                placeholder="Search skins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0F0F2A] border-[#23263a] text-white placeholder-[#a1a1c5]"
              />
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-[#0F0F2A] border-[#23263a] text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F2A] border-[#23263a]">
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-[#23263a]">
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                <SelectTrigger className="bg-[#0F0F2A] border-[#23263a] text-white">
                  <SelectValue placeholder="Rarity" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F2A] border-[#23263a]">
                  {rarities.map(rarity => (
                    <SelectItem key={rarity} value={rarity} className="text-white hover:bg-[#23263a]">
                      {rarity === "all" ? "All Rarities" : rarity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger className="bg-[#0F0F2A] border-[#23263a] text-white">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F2A] border-[#23263a]">
                  {conditions.map(condition => (
                    <SelectItem key={condition} value={condition} className="text-white hover:bg-[#23263a]">
                      {condition === "all" ? "All Conditions" : condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-[#0F0F2A] border-[#23263a] text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F2A] border-[#23263a]">
                  <SelectItem value="name" className="text-white hover:bg-[#23263a]">Name</SelectItem>
                  <SelectItem value="price-high" className="text-white hover:bg-[#23263a]">Price: High to Low</SelectItem>
                  <SelectItem value="price-low" className="text-white hover:bg-[#23263a]">Price: Low to High</SelectItem>
                  <SelectItem value="float" className="text-white hover:bg-[#23263a]">Float Value</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Mode Toggle */}
              <div className="flex gap-2 sm:col-span-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="flex-1"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex-1"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Results Count */}
        <div className="mb-4">
          <p className="text-[#a1a1c5] text-sm">
            Showing {sortedSkins.length} of {allSkins.length} skins
          </p>
        </div>
        
        {/* Skins Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {sortedSkins.map((skin) => (
              <Card key={skin.id} className="bg-[#161e2e] border-[#23263a] hover:border-[#6366f1] transition-colors cursor-pointer group" onClick={() => handleSkinSelect(skin)}>
                <div className="p-4">
                  {/* Skin Image */}
                  <div 
                    className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-lg flex items-center justify-center mb-4 relative overflow-hidden group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSkinSelect(skin);
                    }}
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
                      src="/cscards.png"
                      alt={skin.name}
                      fill
                      className="object-contain rounded-lg group-hover:brightness-110 transition-all duration-300"
                      style={{ objectFit: 'contain' }}
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
                  
                  {/* Skin Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-white text-sm mb-1">{skin.name}</h3>
                      <div className="flex gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">{skin.category}</Badge>
                        <Badge variant="outline" className="text-xs">{skin.rarity}</Badge>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[#a1a1c5] text-xs">Price</span>
                        <span className="text-white font-semibold">${skin.price.toFixed(2)}</span>
                      </div>
                      
                      {/* Wear Information */}
                      {skin.wear && (
                        <div className="flex justify-between items-center p-2 bg-[#161e2e]/50 rounded-lg border border-[#6366f1]/10">
                          <span className="text-[#a1a1c5] text-xs">Wear</span>
                          <span className="text-white font-medium text-xs">{skin.wear}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-[#6366f1] to-[#7f8fff] hover:from-[#5855eb] hover:to-[#6366f1] text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSkinSelect(skin);
                      }}
                    >
                      Buy Item
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSkins.map((skin) => (
              <Card key={skin.id} className="bg-[#161e2e] border-[#23263a] hover:border-[#6366f1] transition-colors cursor-pointer" onClick={() => handleSkinSelect(skin)}>
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Skin Image */}
                    <div 
                      className="w-20 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0 group"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSkinSelect(skin);
                      }}
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
                        src="/cscards.png"
                        alt={skin.name}
                        fill
                        className="object-contain rounded-lg group-hover:brightness-110 transition-all duration-300"
                        style={{ objectFit: 'contain' }}
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
                    
                    {/* Skin Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg mb-1">{skin.name}</h3>
                          <div className="flex gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs">{skin.category}</Badge>
                            <Badge variant="outline" className="text-xs">{skin.rarity}</Badge>
                          </div>
                          
                          {/* Wear Information */}
                          <div className="flex gap-4 mb-3">
                            {skin.wear && (
                              <div className="flex items-center gap-2">
                                <span className="text-[#a1a1c5] text-xs">Wear:</span>
                                <span className="text-white font-medium text-xs">{skin.wear}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right flex flex-col items-end gap-3">
                          <div>
                            <p className="text-white font-semibold text-lg">${skin.price.toFixed(2)}</p>
                          </div>
                          <Button 
                            className="bg-gradient-to-r from-[#6366f1] to-[#7f8fff] hover:from-[#5855eb] hover:to-[#6366f1] text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSkinSelect(skin);
                            }}
                          >
                            Buy Item
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {/* No results */}
        {sortedSkins.length === 0 && (
          <Card className="bg-[#161e2e] border-[#23263a] p-8 text-center">
            <p className="text-[#a1a1c5] text-lg mb-2">No skins found</p>
            <p className="text-[#a1a1c5] text-sm">Try adjusting your search or filters</p>
          </Card>
        )}
      </div>
      
      {/* Purchase Details Modal */}
      <PurchaseDetailsModal
        skin={convertSkinForModal(selectedSkin)}
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false)
          setSelectedSkin(null)
        }}
        onPurchase={handlePurchase}
      />
    </div>
  )
}