"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Filter, RotateCcw, Search, ArrowRight, LayoutGrid, List, Info, ExternalLink } from "lucide-react"
import { LoadingOverlay } from "@/components/loading/loading-overlay"
import { Footer } from "@/components/organism/footer"
import { useAuth } from "@/hooks/use-auth"
import { SteamAuthButton } from "@/components/auth/steam-auth-button"
import { useSteamInventory, SteamItem } from "@/hooks/use-steam-inventory"
import { Card } from "@/components/ui/card"

interface TokenizedSkin {
  id: string;
  name: string;
  price: number;
  image: string;
  totalShares: number;
  availableShares: number;
  pricePerShare: number;
}

export default function TokenizationPage() {
  const [selectedSkin, setSelectedSkin] = useState<TokenizedSkin | null>(null)
  const [skinSelectorOpen, setSkinSelectorOpen] = useState(false)
  const [gridViewActive, setGridViewActive] = useState(false)
  const [sharesAmount, setSharesAmount] = useState(1)
  const [maxShares] = useState(100) // Each skin has 100 shares total
  const [tokenizedSkins, setTokenizedSkins] = useState<TokenizedSkin[]>([])
  
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
  const { inventory, isLoading: inventoryLoading, error: inventoryError, lastUpdated, refreshInventory, refreshPrices, inventoryFetched } = useSteamInventory()

  // Global loading state (Privy + user data)
  const isLoading = privyLoading || inventoryLoading;

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
        const response = await fetch('/api/tokenized-skins');
        const data = await response.json();
        setTokenizedSkins(data);
      } catch (error) {
        console.error('Failed to fetch tokenized skins:', error);
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
      "items with price < 50": inventory?.filter(item => item.basePrice < 50).length || 0
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
      // Update the available shares in the API
      const response = await fetch('/api/tokenized-skins', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skinId: selectedSkin.id,
          sharesPurchased: sharesAmount
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to purchase shares');
      }
      
      const updatedSkin = await response.json();
      
      // Update the local state with the new available shares
      setTokenizedSkins(prevSkins => 
        prevSkins.map(skin => 
          skin.id === updatedSkin.id ? updatedSkin : skin
        )
      );
      
      // Update selected skin if it's the same one
      if (selectedSkin.id === updatedSkin.id) {
        setSelectedSkin(updatedSkin);
      }
      
      console.log('Shares purchased successfully:', { 
        skin: selectedSkin.name, 
        shares: sharesAmount, 
        totalCost: (selectedSkin.pricePerShare * sharesAmount * 1.02).toFixed(2)
      });
      
      // Reset shares amount
      setSharesAmount(1);
      
    } catch (error) {
      console.error('Error purchasing shares:', error);
    }
  };


  // Manually refresh the inventory prices
  const handleRefreshInventory = async () => {
    console.log("Manual price refresh");
    const success = await refreshPrices();
    if (success) {
      console.log("Prices refreshed successfully");
    } else {
      console.log("Price refresh failed or rate limited");
    }
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
    const nameMatch = skin.market_hash_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by rarity
    const rarityMatch = filterRarity === 'all' ? true : 
      skin.market_hash_name.includes(filterRarity);
    
    // Filter by wear
    const { wear } = extractSkinInfo(skin.market_hash_name);
    const wearMap = { 'Factory New': 'FN', 'Minimal Wear': 'MW', 'Field-Tested': 'FT', 'Well-Worn': 'WW', 'Battle-Scarred': 'BS' };
    const wearMatch = filterWear === 'all' ? true : 
      wear === filterWear;
    
    // Filter by price
    const priceMatch = skin.basePrice >= filterPriceMin && skin.basePrice <= filterPriceMax;
    
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
          message="Connecting to your wallet..."
          opacity={0.7}
        />
        <div className="container mx-auto px-4">
          {/* Main interface - Simple and elegant header */}
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#E1E1F5] font-poppins">Buy</h2>
              <p className="text-[#a1a1c5] text-sm mt-2">Buy shares of premium CS2 skins with HUCH tokens</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-stretch relative">
              {/* Card Collateralize */}
              <Card className="relative flex-1 bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md flex flex-col h-[450px] overflow-hidden">
                {/* Overlay grain */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 opacity-[.05]"
                  style={{
                    backgroundImage: "url('/grainbg.avif')",
                    backgroundRepeat: "repeat"
                  }}
                />
                <div className="text-left py-4 px-4 relative z-20">
                  <h2 className="text-xl font-bold font-poppins text-[#E1E1F5]">Available Skins</h2>
                  <p className="text-[#a1a1c5] text-xs mt-1">Choose a skin to buy shares of</p>
                </div>
                <div className="p-4 flex flex-col flex-1 relative z-20">
                  {/* Featured Skins - 2x2 Grid Layout */}
                  <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                    {tokenizedSkins.slice(0, 4).map((skin, index) => (
                      <div 
                        key={index}
                        className={`aspect-square flex flex-col p-3 bg-[#161e2e] rounded-lg border cursor-pointer hover:border-[#6366f1] transition-colors ${
                          selectedSkin?.id === skin.id ? 'border-[#6366f1] bg-[#6366f1]/10' : 'border-[#23263a]'
                        }`}
                        onClick={() => setSelectedSkin(skin)}
                      >
                        {/* Skin Image */}
                        <div className="flex-1 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-md flex items-center justify-center mb-2 relative overflow-hidden">
                          <Image
                            src={skin.image}
                            alt={skin.name}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        
                        {/* Skin Info */}
                        <div className="space-y-1">
                          <h3 className="font-semibold text-white text-xs truncate">{skin.name}</h3>
                          <div className="flex items-center gap-1 text-[10px] text-[#a1a1c5]">
                            <span>${skin.price}</span>
                            <span>•</span>
                            <span>{Math.round((skin.availableShares / skin.totalShares) * 100)}% available</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-[#23263a] rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-[#6366f1] to-[#7f8fff] h-1 rounded-full"
                              style={{ width: `${(skin.availableShares / skin.totalShares) * 100}%` }}
                            ></div>
                          </div>
                          
                          {/* Price per share */}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-[#a1a1c5]">per share</span>
                            <span className="text-xs font-semibold text-white">${skin.pricePerShare.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Browse more skins */}
                  <div>
                    <Button
                      className="w-full bg-[#161e2e] hover:bg-[#23263a] text-[#a1a1c5] border border-[#23263a] hover:border-[#6366f1] transition-colors py-2 text-sm"
                      onClick={() => setSkinSelectorOpen(true)}
                    >
                      Browse All Skins
                    </Button>
                  </div>
                </div>
              </Card>
              
              {/* Arrow image au centre */}
              <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                <img src="/arrow.png" alt="arrow" className="w-12 h-12" />
              </div>
              
              {/* Card Borrow */}
              <Card className="relative flex-1 bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md flex flex-col h-[450px] overflow-hidden">
                {/* Overlay grain */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 opacity-[.05]"
                  style={{
                    backgroundImage: "url('/grainbg.avif')",
                    backgroundRepeat: "repeat"
                  }}
                />
                <div className="text-left py-4 px-4 relative z-20">
                  <h2 className="text-xl font-bold font-poppins text-[#E1E1F5]">Purchase Details</h2>
                  <p className="text-[#a1a1c5] text-xs mt-1">Buy shares with HUCH tokens</p>
                </div>
                <div className="p-3 flex flex-col items-center flex-1 relative z-20">
                  {selectedSkin ? (
                    <>
                      {/* Selected Skin Display */}
                      <div className="w-full mb-3">
                        <div className="text-center">
                          <h3 className="text-base font-semibold text-white">{selectedSkin.name}</h3>
                          <p className="text-xs text-[#a1a1c5]">Selected for purchase</p>
                        </div>
                      </div>
                      
                      {/* Shares Selection */}
                      <div className="w-full mb-3">
                        <label className="block text-xs font-medium text-white mb-2">Number of shares</label>
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-8 h-8 p-0 bg-[#161e2e] border-[#23263a] hover:bg-[#23263a]"
                            onClick={() => setSharesAmount(Math.max(1, sharesAmount - 1))}
                            disabled={sharesAmount <= 1}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            value={sharesAmount}
                            onChange={(e) => setSharesAmount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                            className="flex-1 bg-[#161e2e] border-[#23263a] text-center"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-8 h-8 p-0 bg-[#161e2e] border-[#23263a] hover:bg-[#23263a]"
                            onClick={() => setSharesAmount(Math.min(50, sharesAmount + 1))}
                            disabled={sharesAmount >= 50}
                          >
                            +
                          </Button>
                        </div>
                        
                        {/* Quick select buttons */}
                        <div className="flex gap-2 justify-center">
                          {[1, 5, 10, 25].map(amount => (
                            <Button
                              key={amount}
                              size="sm"
                              variant={sharesAmount === amount ? "default" : "outline"}
                              className={`px-3 py-1 text-xs ${
                                sharesAmount === amount 
                                  ? "bg-[#6366f1] text-white" 
                                  : "bg-[#161e2e] border-[#23263a] text-[#a1a1c5] hover:bg-[#23263a]"
                              }`}
                              onClick={() => setSharesAmount(amount)}
                            >
                              {amount}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Cost Breakdown */}
                      <div className="w-full bg-[#161e2e] rounded-lg p-3 space-y-2 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#a1a1c5]">Price per share</span>
                          <span className="text-white">${selectedSkin.pricePerShare.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#a1a1c5]">Shares × {sharesAmount}</span>
                          <span className="text-white">${(selectedSkin.pricePerShare * sharesAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#a1a1c5]">Platform fee (2%)</span>
                          <span className="text-white">${(selectedSkin.pricePerShare * sharesAmount * 0.02).toFixed(2)}</span>
                        </div>
                        <div className="border-t border-[#23263a] pt-2">
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-white">Total</span>
                            <span className="text-white">${(selectedSkin.pricePerShare * sharesAmount * 1.02).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-center">
                      <div className="w-16 h-16 bg-[#161e2e] rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🔍</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Select a Skin</h3>
                      <p className="text-sm text-[#a1a1c5] max-w-[200px]">
                        Choose a CS2 skin from the left to see purchase details
                      </p>
                    </div>
                  )}
                  {/* How it works - more compact */}
                  {selectedSkin && (
                    <div className="mb-2 w-full text-center">
                      <button
                        className="text-[10px] text-[#a1a1c5] underline hover:text-[#6366f1] transition"
                        onClick={() => setHowItWorksOpen(!howItWorksOpen)}
                        type="button"
                      >
                        How does share ownership work?
                      </button>
                      {howItWorksOpen && (
                        <div className="mt-1 text-[10px] text-[#a1a1c5] bg-[#161e2e] rounded-md p-2">
                          Buy fractional ownership of premium CS2 skins. Each skin is divided into 100 shares.
                        </div>
                      )}
                    </div>
                  )}
                  {/* Purchase button */}
                  <Button
                    className="w-full bg-gradient-to-r from-[#6366f1] to-[#7f8fff] text-white font-semibold text-sm py-2 rounded-lg mt-auto"
                    disabled={!selectedSkin}
                    onClick={() => setTokenizeModalOpen(true)}
                  >
                    {selectedSkin ? `Buy ${sharesAmount} Share${sharesAmount !== 1 ? 's' : ''} ($${(selectedSkin.pricePerShare * sharesAmount * 1.02).toFixed(2)})` : 'Select a Skin'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
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
              <div className="p-2 max-h-[500px] overflow-y-auto custom-scrollbar">
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
                      .sort((a, b) => b.basePrice - a.basePrice)
                      .map((skin) => {
                        // Extract the name and wear of the skin
                        const { name, wear } = extractSkinInfo(skin.market_hash_name)
                        
                        // Determine rarity (for color)
                        const rarity = skin.rarity || 
                          (skin.market_hash_name.includes('★') ? '★' : 
                          skin.market_hash_name.includes('Covert') ? 'Covert' : 
                          skin.market_hash_name.includes('Contraband') ? 'Contraband' : '')
                        
                        return (
                          <div 
                            key={skin.id} 
                            className={`flex items-center gap-4 p-3 hover:bg-blue-950/30 backdrop-blur-sm transition-colors rounded-md cursor-pointer ${selectedSkin === skin.id ? 'bg-blue-950/30 border border-blue-400/40' : 'border border-transparent'}`}
                            onClick={() => {
                              setSelectedSkin(skin.id);
                              setSkinSelectorOpen(false);
                            }}
                          >
                            <div className="relative w-16 h-16 overflow-hidden rounded-md flex-shrink-0 bg-blue-950/30 backdrop-blur-sm">
                              <Image
                                src={skin.imageUrl}
                                alt={name}
                                fill
                                className="object-contain p-1 hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="text-sm font-medium truncate">{name}</h4>
                                <span className="text-xs font-medium bg-blue-950/30 backdrop-blur-sm px-2 py-0.5 rounded-full">${skin.basePrice.toFixed(2)}</span>
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
                      .sort((a, b) => b.basePrice - a.basePrice)
                      .map((skin) => {
                        // Extract the name and wear of the skin
                        const { name, wear } = extractSkinInfo(skin.market_hash_name)
                        
                        // Determine rarity (for color)
                        const rarity = skin.rarity || 
                          (skin.market_hash_name.includes('★') ? '★' : 
                          skin.market_hash_name.includes('Covert') ? 'Covert' : 
                          skin.market_hash_name.includes('Contraband') ? 'Contraband' : '')
                        
                        return (
                          <div 
                            key={skin.id} 
                            className={`flex flex-col p-3 hover:bg-blue-950/30 backdrop-blur-sm transition-colors rounded-md cursor-pointer border border-transparent ${selectedSkin === skin.id ? 'bg-blue-950/30 border-blue-400/40' : ''}`}
                            onClick={() => {
                              setSelectedSkin(skin.id);
                              setSkinSelectorOpen(false);
                            }}
                          >
                            <div className="relative w-full h-32 overflow-hidden rounded-md flex-shrink-0 mb-2 bg-blue-950/30 backdrop-blur-sm group-hover:scale-105 transition-transform">
                              <Image
                                src={skin.imageUrl}
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
                                <span className="text-xs font-medium bg-blue-950/30 backdrop-blur-sm px-2 py-0.5 rounded-full">${skin.basePrice.toFixed(2)}</span>
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
                <span className="text-[#a1a1c5]">Shares:</span>
                <span className="text-white">{sharesAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#a1a1c5]">Total Cost:</span>
                <span className="text-white">${(selectedSkin.pricePerShare * sharesAmount * 1.02).toFixed(2)}</span>
              </div>
              <p className="text-xs text-[#a1a1c5]">
                You will own {((sharesAmount / 100) * 100).toFixed(1)}% of this skin and receive proportional dividends.
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
                Buy Shares
              </Button>
            </div>
          </div>
        </div>
      )}
    <Footer />
    </div>
  )
}
