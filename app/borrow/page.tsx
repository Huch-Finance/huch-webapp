"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Filter, RotateCcw, Search, ArrowRight, LayoutGrid, List, Info, ExternalLink } from "lucide-react"
import { LoadingOverlay } from "@/components/loading/loading-overlay"
import { Footer } from "@/components/organism/footer"
import { useAuth } from "@/hooks/use-auth"
import { SteamAuthButton } from "@/components/auth/steam-auth-button"
import { useSteamInventory, SteamItem } from "@/hooks/use-steam-inventory"
import { Card } from "@/components/ui/card"
import { FeaturedSkins } from "@/components/borrow/featured-skins"
import { PurchaseDetails } from "@/components/borrow/purchase-details"

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

export default function TokenizationPage() {
  const router = useRouter()
  const [selectedSkin, setSelectedSkin] = useState<TokenizedSkin | null>(null)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [skinSelectorOpen, setSkinSelectorOpen] = useState(false)
  const [gridViewActive, setGridViewActive] = useState(false)
  const [tokenizedSkins, setTokenizedSkins] = useState<TokenizedSkin[]>([])
  const [tokenizedSkinsLoading, setTokenizedSkinsLoading] = useState(true)
  
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)
  const priceUpdateRef = useRef(false)
  
  // Trade link state
  const [tradeLink, setTradeLink] = useState("")
  const [savingTradeLink, setSavingTradeLink] = useState(false)
  
  // State for the borrow confirmation modal
  const [tokenizeModalOpen, setTokenizeModalOpen] = useState(false)
  
  
  // Authentication with Privy
  const { isAuthenticated, isLoading: privyLoading, login, logout, profile, connectWallet, updateSteamId } = useAuth()
  
  // Retrieve the user's Steam inventory
  const { inventory, isLoading: inventoryLoading, error: inventoryError, lastUpdated, refreshInventory, inventoryFetched } = useSteamInventory()

  // Global loading state (Privy + user data + tokenized skins)
  const isLoading = privyLoading || inventoryLoading || tokenizedSkinsLoading;

  // Initialise displaySkins à []
  const [displaySkins, setDisplaySkins] = useState<SteamItem[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterWear, setFilterWear] = useState<string>('all');
  const [filterPriceMin, setFilterPriceMin] = useState<number>(0);
  const [filterPriceMax, setFilterPriceMax] = useState<number>(10000);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Fetch tokenized skins from API
  useEffect(() => {
    const fetchTokenizedSkins = async () => {
      try {
        setTokenizedSkinsLoading(true);
        const response = await fetch('/api/tokenized-skins');
        const data = await response.json();
        setTokenizedSkins(data);
      } catch (error) {
        console.error('Failed to fetch tokenized skins:', error);
      } finally {
        setTokenizedSkinsLoading(false);
      }
    };
    fetchTokenizedSkins();
  }, []);

  // Debug logs
  useEffect(() => {
    console.log("Page borrow - States:", {
      privyLoading,
      inventoryLoading,
      isAuthenticated,
      inventoryFetched,
      inventoryLength: inventory?.length || 0,
      displaySkinsLength: displaySkins?.length || 0,
      profileSteamId: profile?.steamId,
      profileTradeLink: profile?.tradeLink,
      inventoryError,
      inventoryData: inventory,
      filterPriceMin,
      filterPriceMax,
      "items with price < 50": inventory?.filter(item => item.value < 50).length || 0
    });
  }, [privyLoading, inventoryLoading, isAuthenticated, inventoryFetched, inventory, displaySkins, profile?.steamId, profile?.tradeLink, inventoryError, filterPriceMin, filterPriceMax]);
  
  const updateInventoryPrices = async () => {
  console.log('🔍 updateInventoryPrices called with:', { 
    steamId: profile?.steamId,
    hasProfile: !!profile 
  });
  
  if (!profile?.steamId) {
    console.log('❌ No steamId found, skipping price update');
    return;
  }
  console.log('profile.steamId:', profile.steamId);
  
  try {
      console.log('🔄 Updating inventory prices...');
      const response = await fetch(`http://localhost:3333/inventory/${profile.steamId}/update-prices`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success) {
        console.log('✅ Prices updated:', data.data);
        if (data.data.cached) {
          console.log(`📦 Prices cached - next update in ${data.data.nextUpdateIn} minutes`);
        } else if (data.data.updated > 0) {
          console.log(`🆙 Updated ${data.data.updated} item prices`);
          // No need to call refreshInventory here - the inventory hook will handle it
        }
      } else {
        console.error('❌ Price update failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Failed to update prices:', error);
    }
  };

  // Removed price update useEffect - inventory fetching is already handled in the hook

  
  // Fonction pour extraire le nom et l'usure d'un skin à partir du market_hash_name
  const extractSkinInfo = (marketHashName: string) => {
    // Format typique: "Weapon | Skin (Wear)"
    const parts = marketHashName.split('|')
    if (parts.length < 2) return { name: marketHashName, wear: '' }

    const weapon = parts[0].trim()
    const skinParts = parts[1].trim().split('(')
    const skin = skinParts[0].trim()
    const wear = skinParts.length > 1 ? skinParts[1].replace(')', '').trim() : ''

    return {
      name: `${weapon} | ${skin}`,
      wear
    }
  }

  // Mets à jour displaySkins uniquement avec les vrais items
  useEffect(() => {
    if (isAuthenticated && inventory && Array.isArray(inventory) && inventory.length > 0) {
      console.log("Setting displaySkins with", inventory.length, "items");
      console.log("Sample inventory items:", inventory.slice(0, 3));
      setDisplaySkins(inventory);
    } else {
      console.log("Not setting displaySkins - conditions not met", {
        isAuthenticated,
        inventoryIsArray: Array.isArray(inventory),
        inventoryLength: inventory?.length || 0
      });
      setDisplaySkins([]);
    }
  }, [isAuthenticated, inventory, inventoryFetched]);
  

  const handleTokenizeRequest = async () => {
    if (!selectedSkin) return;
    
    try {
      // Purchase the item via API
      const response = await fetch('/api/tokenized-skins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skinId: selectedSkin.id,
          totalCost: selectedSkin.price * 1.02
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to purchase item');
      }
      
      // Update the available quantity in the API
      const updateResponse = await fetch('/api/tokenized-skins', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skinId: selectedSkin.id,
          quantityPurchased: 1
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update inventory');
      }
      
      const updatedSkin = await updateResponse.json();
      
      // Update the local state with the new available quantity
      setTokenizedSkins(prevSkins => 
        prevSkins.map(skin => 
          skin.id === updatedSkin.id ? updatedSkin : skin
        )
      );
      
      // Update selected skin if it's the same one
      if (selectedSkin.id === updatedSkin.id) {
        setSelectedSkin(updatedSkin);
      }
      
      console.log('Item purchased successfully:', { 
        skin: selectedSkin.name,
        totalCost: (selectedSkin.price * 1.02).toFixed(2)
      });
      
    } catch (error) {
      console.error('Error purchasing item:', error);
    }
  };


  // Manually refresh the inventory prices
  const handleRefreshInventory = async () => {
    console.log("Manual price refresh");
    await refreshInventory();
    console.log("Inventory refresh completed");
  };
  
  // Handle trade link save
  const handleSaveTradeLink = async () => {
    if (!tradeLink || !profile?.steamId) {
      console.log('Missing trade link or steam ID:', { tradeLink, steamId: profile?.steamId });
      return;
    }
    
    console.log('Saving trade link:', tradeLink, 'for steam ID:', profile.steamId);
    setSavingTradeLink(true);
    try {
      const success = await updateSteamId(profile.steamId, tradeLink);
      console.log('Trade link save result:', success);
      if (success) {
        // Clear the input and refresh inventory
        setTradeLink("");
        refreshInventory();
      } else {
        console.error("Failed to save trade link");
      }
    } catch (error) {
      console.error("Error saving trade link:", error);
    } finally {
      setSavingTradeLink(false);
    }
  };
  
  // Removed duplicate useEffect - inventory fetching is already handled in the hook

  // Reusable filtering function for both views
  const filterSkins = (skin: any) => {
    // Filter by name
    const nameMatch = skin.marketHashName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by rarity
    const rarityMatch = filterRarity === 'all' ? true : 
      skin.marketHashName.includes(filterRarity);
    
    // Filter by wear
    const { wear } = extractSkinInfo(skin.marketHashName);
    const wearMap = { 'Factory New': 'FN', 'Minimal Wear': 'MW', 'Field-Tested': 'FT', 'Well-Worn': 'WW', 'Battle-Scarred': 'BS' };
    const wearMatch = filterWear === 'all' ? true : 
      wear === filterWear;
    
    // Filter by price
    const priceMatch = skin.value >= filterPriceMin && skin.value <= filterPriceMax;
    
    return nameMatch && rarityMatch && wearMatch && priceMatch;
  };
  
  // Rarity options for the filter
  const rarityOptions = [
    { value: 'all', label: 'All Rarities' },
    { value: 'Consumer', label: 'Consumer', color: 'rgb(176, 195, 217)' },
    { value: 'Industrial', label: 'Industrial', color: 'rgb(94, 152, 217)' },
    { value: 'Mil-Spec', label: 'Mil-Spec', color: 'rgb(75, 105, 255)' },
    { value: 'Restricted', label: 'Restricted', color: 'rgb(136, 71, 255)' },
    { value: 'Classified', label: 'Classified', color: 'rgb(211, 44, 230)' },
    { value: 'Covert', label: 'Covert', color: 'rgb(235, 75, 75)' },
    { value: 'Contraband', label: 'Contraband', color: 'rgb(228, 174, 57)' },
  ];
  
  // Wear options for the filter
  const wearOptions = [
    { value: 'all', label: 'All Wear' },
    { value: 'Factory New', label: 'Factory New' },
    { value: 'Minimal Wear', label: 'Minimal Wear' },
    { value: 'Field-Tested', label: 'Field-Tested' },
    { value: 'Well-Worn', label: 'Well-Worn' },
    { value: 'Battle-Scarred', label: 'Battle-Scarred' },
  ];

  // Si l'utilisateur est authentifié mais n'a pas connecté Steam
  // if (isAuthenticated && profile && !profile.steamId && !isLoading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen text-white">
  //       <h2 className="text-2xl font-bold mb-4">Connect your Steam account</h2>
  //       <SteamAuthButton />
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <main className="flex-1 flex flex-col items-center justify-center pt-8 lg:  pt-12">
        <LoadingOverlay
          isLoading={isLoading} 
          message={tokenizedSkinsLoading ? "Loading featured skins..." : "Connecting to your wallet..."}
          opacity={0.7}
        />
        <div className="container mx-auto px-4">
          {/* Featured Skins Component */}
          <FeaturedSkins
            tokenizedSkins={tokenizedSkins}
            onSkinSelect={(skin) => {
              setSelectedSkin(skin);
              setPurchaseModalOpen(true);
            }}
            onBrowseAll={() => router.push('/browse-skins')}
            isLoading={tokenizedSkinsLoading}
          />

          {/* Purchase Details Modal */}
          <PurchaseDetails
            selectedSkin={selectedSkin}
            onPurchase={() => {
              setTokenizeModalOpen(true);
              setPurchaseModalOpen(false);
            }}
            isOpen={purchaseModalOpen}
            onClose={() => setPurchaseModalOpen(false)}
          />
        </div>
        
        {/* Skin selector modal */}
        {skinSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSkinSelectorOpen(false)}>
            <div className={`bg-blue-950/20 backdrop-blur-md border border-blue-400/30 rounded-lg shadow-lg overflow-hidden w-full max-w-[95vw] ${gridViewActive ? 'md:max-w-[800px]' : 'md:max-w-[500px]'}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-2 border-b border-blue-400/20">
                <h3 className="text-xs font-medium">Browse Premium CS2 Skins</h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full hover:bg-blue-950/30 flex items-center justify-center"
                    onClick={() => setGridViewActive(!gridViewActive)}
                    title={gridViewActive ? "List view" : "Grid view"}
                  >
                    {gridViewActive ? 
                      <List className="h-3 w-3" /> : 
                      <LayoutGrid className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full hover:bg-blue-950/30 flex items-center justify-center"
                    onClick={() => {
                      handleRefreshInventory();
                      // Optionally, you can show a toast or loading indicator here
                    }}
                    disabled={inventoryLoading}
                    title="Refresh inventory"
                  >
                    <RotateCcw className={`h-3 w-3 ${inventoryLoading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 rounded-full hover:bg-blue-950/30" 
                    onClick={() => setSkinSelectorOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </Button>
                </div>
              </div>
              <div className="p-2 border-b border-blue-400/20">
                <div className="flex gap-2 items-center">
                  <div className="relative flex-grow">
                    <Search className="h-3 w-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search premium CS2 skins..."
                      className="w-full bg-blue-950/30 backdrop-blur-sm border border-blue-400/20 rounded-md py-1 pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-950/30 backdrop-blur-sm border-blue-400/20 hover:bg-blue-950/40 h-6 px-2 text-xs flex items-center gap-1"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-3 w-3" />
                    <span>Filters</span>
                  </Button>
                </div>
                
                {/* Filter panel */}
                {showFilters && (
                  <div className="mt-2 p-3 bg-blue-950/30 backdrop-blur-sm border border-blue-400/20 rounded-md space-y-3 animate-fadeIn">
                    {/* Rarity filter */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Rarity</label>
                      <select
                        className="w-full bg-blue-950/30 backdrop-blur-sm border border-blue-400/20 rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                        value={filterRarity}
                        onChange={(e) => setFilterRarity(e.target.value)}
                      >
                        {rarityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Wear filter */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Wear</label>
                      <select
                        className="w-full bg-blue-950/30 backdrop-blur-sm border border-blue-400/20 rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                        value={filterWear}
                        onChange={(e) => setFilterWear(e.target.value)}
                      >
                        {wearOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Price filter */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Price Range ($0 - $10,000)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          step="0.01"
                          value={filterPriceMin}
                          onChange={(e) => setFilterPriceMin(Math.max(0, Math.min(filterPriceMax, parseFloat(e.target.value) || 0)))}
                          className="w-full bg-blue-950/30 backdrop-blur-sm border border-blue-400/20 rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                        />
                        <span className="text-xs text-gray-400">to</span>
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          step="0.01"
                          value={filterPriceMax}
                          onChange={(e) => setFilterPriceMax(Math.max(filterPriceMin, Math.min(10000, parseFloat(e.target.value) || 10000)))}
                          className="w-full bg-blue-950/30 backdrop-blur-sm border border-blue-400/20 rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                        />
                      </div>
                    </div>
                    
                    {/* Apply filters button */}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className="bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-md border border-blue-400/30 hover:border-blue-400/50 text-xs py-1 px-3"
                        onClick={() => setShowFilters(false)}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-2">
                {/* Message si aucun skin ne correspond aux critères */}
                {displaySkins.filter(filterSkins).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="text-3xl mb-3">😢</div>
                    <h3 className="text-sm font-medium mb-1">No matching skins found</h3>
                    <p className="text-xs text-gray-400">We couldn't find any skins matching your criteria. Try adjusting your filters or price range ($0-$10,000).</p>
                  </div>
                )}
                
                {/* List view */}
                {!gridViewActive && displaySkins.filter(filterSkins).length > 0 && (
                  <div className="space-y-1 w-full">
                    {displaySkins
                      .filter(filterSkins)
                      .sort((a, b) => b.value - a.value)
                      .map((skin) => {
                        // Extract the name and wear of the skin
                        const { name, wear } = extractSkinInfo(skin.marketHashName)
                        
                        // Determine rarity (for color)
                        const rarity = skin.rarity || 
                          (skin.marketHashName.includes('★') ? '★' : 
                          skin.marketHashName.includes('Covert') ? 'Covert' : 
                          skin.marketHashName.includes('Contraband') ? 'Contraband' : '')
                        
                        return (
                          <div 
                            key={skin.id} 
                            className={`flex items-center gap-4 p-3 hover:bg-blue-950/30 backdrop-blur-sm transition-colors rounded-md cursor-pointer ${selectedSkin?.id === skin.id ? 'bg-blue-950/30 border border-blue-400/40' : 'border border-transparent'}`}
                            onClick={() => {
                              // Convert SteamItem to TokenizedSkin format
                              const { wear } = extractSkinInfo(skin.marketHashName)
                              const tokenizedSkin: TokenizedSkin = {
                                id: skin.id,
                                name: skin.marketHashName,
                                price: skin.value,
                                image: skin.iconUrl,
                                totalQuantity: 100,
                                availableQuantity: 50,
                                pricePerItem: skin.value,
                                wear: wear || undefined,
                                float: skin.floatValue || undefined
                              };
                              setSelectedSkin(tokenizedSkin);
                              setSkinSelectorOpen(false);
                            }}
                          >
                            <div className="relative w-16 h-16 overflow-hidden rounded-md flex-shrink-0 bg-blue-950/30 backdrop-blur-sm">
                              <Image
                                src={skin.iconUrl}
                                alt={name}
                                fill
                                className="object-contain p-1 hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="text-sm font-medium truncate">{name}</h4>
                                <span className="text-xs font-medium bg-blue-950/30 backdrop-blur-sm px-2 py-0.5 rounded-full">${skin.value.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1.5">
                                <span className="text-[10px] text-gray-400">{rarity || 'Normal'}</span>
                                <span className="text-[10px] text-gray-400">•</span>
                                <span className="text-[10px] text-gray-400">{wear}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
                
                {/* Grid view */}
                {gridViewActive && displaySkins.filter(filterSkins).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {displaySkins
                      .filter(filterSkins)
                      .sort((a, b) => b.value - a.value)
                      .map((skin) => {
                        // Extract the name and wear of the skin
                        const { name, wear } = extractSkinInfo(skin.marketHashName)
                        
                        // Determine rarity (for color)
                        const rarity = skin.rarity || 
                          (skin.marketHashName.includes('★') ? '★' : 
                          skin.marketHashName.includes('Covert') ? 'Covert' : 
                          skin.marketHashName.includes('Contraband') ? 'Contraband' : '')
                        
                        return (
                          <div 
                            key={skin.id} 
                            className={`flex flex-col p-3 hover:bg-blue-950/30 backdrop-blur-sm transition-colors rounded-md cursor-pointer border border-transparent ${selectedSkin?.id === skin.id ? 'bg-blue-950/30 border-blue-400/40' : ''}`}
                            onClick={() => {
                              // Convert SteamItem to TokenizedSkin format
                              const { wear } = extractSkinInfo(skin.marketHashName)
                              const tokenizedSkin: TokenizedSkin = {
                                id: skin.id,
                                name: skin.marketHashName,
                                price: skin.value,
                                image: skin.iconUrl,
                                totalQuantity: 100,
                                availableQuantity: 50,
                                pricePerItem: skin.value,
                                wear: wear || undefined,
                                float: skin.floatValue || undefined
                              };
                              setSelectedSkin(tokenizedSkin);
                              setSkinSelectorOpen(false);
                            }}
                          >
                            <div className="relative w-full h-32 overflow-hidden rounded-md flex-shrink-0 mb-2 bg-blue-950/30 backdrop-blur-sm group-hover:scale-105 transition-transform">
                              <Image
                                src={skin.iconUrl}
                                alt={name}
                                fill
                                className="object-contain p-2 hover:scale-110 transition-transform"
                              />
                            </div>
                            <div className="w-full">
                              <h4 className="text-xs font-medium truncate">{name}</h4>
                              <div className="flex justify-between items-center mt-1">
                                <div className="flex items-center gap-1">
                                  <span style={{
                                    fontSize: '10px',
                                    color: 
                                      rarity === 'Covert' ? 'rgb(235, 75, 75)' :
                                      rarity === 'Contraband' ? 'rgb(228, 174, 57)' :
                                      rarity === 'Consumer' ? 'rgb(176, 195, 217)' :
                                      rarity === 'Industrial' ? 'rgb(94, 152, 217)' :
                                      rarity === 'Mil-Spec' ? 'rgb(75, 105, 255)' :
                                      rarity === 'Restricted' ? 'rgb(136, 71, 255)' :
                                      rarity === 'Classified' ? 'rgb(211, 44, 230)' :
                                      rarity === '★' ? 'rgb(228, 174, 57)' : 'rgb(176, 195, 217)'
                                  }}>{rarity || 'Normal'}</span>
                                  <span className="text-[10px] text-gray-400">•</span>
                                  <span className="text-[10px] text-gray-400">{wear}</span>
                                </div>
                                <span className="text-xs font-medium bg-blue-950/30 backdrop-blur-sm px-2 py-0.5 rounded-full">${skin.value.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>      
      {/* Purchase confirmation modal */}
      {tokenizeModalOpen && selectedSkin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#0F0F2A] border border-[#FFFFFF]/10 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Purchase</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#a1a1c5]">Skin:</span>
                <span className="text-white">{selectedSkin.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#a1a1c5]">Total Cost:</span>
                <span className="text-white">${(selectedSkin.price * 1.02).toFixed(2)}</span>
              </div>
              <p className="text-xs text-[#a1a1c5]">
                You will own this skin item.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setTokenizeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-[#6366f1] to-[#7f8fff]"
                onClick={() => {
                  handleTokenizeRequest();
                  setTokenizeModalOpen(false);
                }}
              >
                Buy Item
              </Button>
            </div>
          </div>
        </div>
      )}
    <Footer />
    </div>
  )
}
