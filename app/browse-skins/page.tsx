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
import { useHuchToken } from "@/hooks/use-huch-token"
import { useEscrow } from "@/hooks/use-escrow"
import { useHuchOracle } from "@/hooks/use-huch-oracle"
import { Footer } from "@/components/organism/footer"

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
  collection?: string;
  wear?: string;
  float?: number;
}

export default function BrowseSkinsPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const { purchaseNFT, getUserBalance, getVaultInfo } = useEscrow()
  const { 
    price: huchPrice, 
    balance: huchBalance, 
    fetchBalance: fetchHuchBalance,
    convertUsdToHuch,
    formatHuchAmount,
    formatUsdAmount
  } = useHuchOracle()
  
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
  
  const [allSkins, setAllSkins] = useState<TokenizedSkin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Get Huch token balance
  // Real HUCH token data from oracle
  const realHuchBalance = huchBalance?.balance || 0
  const realHuchValue = huchBalance?.usdValue || 0
  const [portfolioValue] = useState(0) // TODO: Calculate from actual portfolio data
  
  // Fetch marketplace NFTs
  useEffect(() => {
    const fetchMarketplaceNFTs = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/api/marketplace/simple/browse`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(profile?.id && { 'X-Privy-Id': profile.id })
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch marketplace NFTs')
        }

        const data = await response.json()
        console.log('API Response:', data)
        console.log('Listings found:', data.listings?.length || 0)
        
        // Debug first listing structure
        if (data.listings && data.listings.length > 0) {
          console.log('First listing structure:', data.listings[0])
          console.log('First listing metadata:', data.listings[0].metadata)
          console.log('First listing attributes:', data.listings[0].metadata?.attributes)
        }
        
        // Transform the marketplace data to match our TokenizedSkin interface
        const transformedSkins: TokenizedSkin[] = data.listings.map((listing: any) => {
          const metadata = listing.metadata || {}
          const attributes = metadata.attributes || []
          
          // Extract market value from attributes
          const marketValueAttr = attributes.find((attr: any) => 
            attr.trait_type?.toLowerCase() === 'market value' || 
            attr.trait_type?.toLowerCase() === 'market_value'
          )
          const marketValue = marketValueAttr ? parseFloat(marketValueAttr.value) : listing.price || 0
          
          // Extract other attributes
          const weaponAttr = attributes.find((attr: any) => attr.trait_type?.toLowerCase() === 'weapon')
          const skinAttr = attributes.find((attr: any) => attr.trait_type?.toLowerCase() === 'skin')
          const wearAttr = attributes.find((attr: any) => attr.trait_type?.toLowerCase() === 'wear' || attr.trait_type?.toLowerCase() === 'condition')
          const floatAttr = attributes.find((attr: any) => attr.trait_type?.toLowerCase() === 'float')
          const rarityAttr = attributes.find((attr: any) => attr.trait_type?.toLowerCase() === 'rarity')
          const collectionAttr = attributes.find((attr: any) => attr.trait_type?.toLowerCase() === 'collection')
          
          // Parse name to extract weapon and skin if not in attributes
          let weapon = weaponAttr?.value || ''
          let skin = skinAttr?.value || ''
          const name = metadata.name || listing.name || 'Unknown Skin'
          
          if (!weapon || !skin) {
            const nameParts = name.split(' | ')
            if (nameParts.length === 2) {
              weapon = weapon || nameParts[0].trim()
              skin = skin || nameParts[1].trim()
            }
          }
          
          // Map weapon to category
          let category = 'Other'
          if (weapon.includes('AK-47') || weapon.includes('M4A4') || weapon.includes('M4A1')) {
            category = 'Rifle'
          } else if (weapon.includes('AWP')) {
            category = 'Sniper Rifle'
          } else if (weapon.includes('Knife') || weapon.includes('Karambit') || weapon.includes('Bayonet')) {
            category = 'Knife'
          } else if (weapon.includes('Gloves')) {
            category = 'Gloves'
          } else if (weapon.includes('Desert Eagle') || weapon.includes('Glock') || weapon.includes('USP')) {
            category = 'Pistol'
          }
          
          return {
            id: listing.nftMint || listing.id,
            name: name,
            price: marketValue,
            image: metadata.image || listing.image || '/cscards.png',
            totalQuantity: 1,
            availableQuantity: 1,
            pricePerItem: marketValue,
            category: category,
            rarity: rarityAttr?.value || 'Unknown',
            condition: wearAttr?.value || 'Unknown',
            collection: collectionAttr?.value || listing.collection || undefined,
            wear: wearAttr?.value,
            float: floatAttr ? parseFloat(floatAttr.value) : undefined,
          }
        })
        
        console.log('Transformed skins:', transformedSkins.length)
        
        // Debug collection data
        const skinsWithCollection = transformedSkins.filter(skin => skin.collection)
        console.log('Skins with collection data:', skinsWithCollection.length)
        if (skinsWithCollection.length > 0) {
          console.log('Sample skin with collection:', skinsWithCollection[0])
        }
        setAllSkins(transformedSkins)
      } catch (error) {
        console.error('Error fetching marketplace NFTs:', error)
        // Fallback to mock data if API fails
        setAllSkins([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMarketplaceNFTs()
  }, [profile?.id])
  
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

  // Handle purchase action
  const handlePurchase = async (skin: TokenizedSkin) => {
    console.log('Purchase initiated for skin:', skin)
    // The actual purchase logic is handled in the PurchaseDetailsModal
    // This function is just a callback interface
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
    <div className="min-h-screen flex flex-col text-white lg:ml-24">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-7xl px-4 py-6">
        
        {/* Portfolio Section */}
        <div className="flex justify-center mb-6">
          <Card className="bg-[#161e2e] border-[#23263a] p-4">
            <div>
              <p className="text-[#a1a1c5] text-sm">Portfolio Value</p>
              <p className="text-2xl font-bold text-white">${portfolioValue.toFixed(2)}</p>
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
            <div className="flex flex-wrap gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
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
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="flex-1 sm:flex-initial"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex-1 sm:flex-initial"
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-[#161e2e] rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Image
                src="/logo.svg"
                alt="Huch Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading marketplace...</h3>
            <p className="text-[#a1a1c5] text-center max-w-md">
              Fetching available CS2 skins from the blockchain
            </p>
          </div>
        ) : sortedSkins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6366f1] to-[#7f8fff] rounded-full flex items-center justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Huch Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No skins available</h3>
            <p className="text-[#a1a1c5] text-center max-w-md">
              No CS2 skins match your current filters. Try adjusting your search criteria or check back later for new arrivals.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {sortedSkins.map((skin, index) => (
              <Card key={skin.id} className="bg-[#161e2e] border-[#23263a] hover:border-[#6366f1] transition-colors cursor-pointer group" onClick={() => handleSkinSelect(skin)}>
                  <div 
                    className="relative w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4"
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
                      src={skin.image || '/cscards.png'}
                      alt={skin.name}
                      fill
                      className="object-contain rounded-lg group-hover:brightness-110 transition-all duration-300"
                      style={{ objectFit: 'contain' }}
                      unoptimized={true}
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
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant="secondary" className="text-xs">{skin.category}</Badge>
                        <Badge variant="outline" className="text-xs">{skin.rarity}</Badge>
                        {skin.collection && (
                          <Badge variant="default" className="text-xs bg-[#6366f1]/20 text-[#6366f1] border-[#6366f1]/30">
                            {skin.collection}
                          </Badge>
                        )}
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
                </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSkins.map((skin, index) => (
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
                        src={skin.image || '/cscards.png'}
                        alt={skin.name}
                        fill
                        className="object-contain rounded-lg group-hover:brightness-110 transition-all duration-300"
                        style={{ objectFit: 'contain' }}
                        unoptimized={true}
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
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs">{skin.category}</Badge>
                            <Badge variant="outline" className="text-xs">{skin.rarity}</Badge>
                            {skin.collection && (
                              <Badge variant="default" className="text-xs bg-[#6366f1]/20 text-[#6366f1] border-[#6366f1]/30">
                                {skin.collection}
                              </Badge>
                            )}
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
        </div>
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
      <Footer />
    </div>
  )
}