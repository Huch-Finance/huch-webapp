"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronDown, Filter, RotateCcw, Search, ArrowRight, LayoutGrid, List } from "lucide-react"
import { BorrowConfirmationModal } from "@/components/borrow/borrow-confirmation-modal"
import { LoadingOverlay } from "@/components/loading/loading-overlay"
import { Footer } from "@/components/organism/footer"
import { useAuth } from "@/hooks/use-auth"
import { SteamAuthButton } from "@/components/auth/steam-auth-button"
import { useSteamInventory, SteamItem } from "@/hooks/use-steam-inventory"
import { Card } from "@/components/ui/card"

export default function Home() {
  const [selectedSkin, setSelectedSkin] = useState<string | null>(null)
  const [skinSelectorOpen, setSkinSelectorOpen] = useState(false)
  const [gridViewActive, setGridViewActive] = useState(false)
  const [loanPercentage, setLoanPercentage] = useState(100)
  const [loanAmount, setLoanAmount] = useState(0)
  const [loanDuration, setLoanDuration] = useState(7) // Loan duration in days
  const loanDurationOptions = [14, 25, 30, 35] // Loan duration options in days
  const [howItWorksOpen, setHowItWorksOpen] = useState(false) // State for the "How it works" dropdown menu
  
  // State for the borrow confirmation modal
  const [borrowModalOpen, setBorrowModalOpen] = useState(false)
  // State to track if a loan has been confirmed successfully
  const [borrowSuccessful, setBorrowSuccessful] = useState(false)
  
  // Gestionnaire pour la fermeture du modal de confirmation
  const handleConfirmationOpenChange = (open: boolean) => {
    setBorrowModalOpen(open);
    
    // If the modal closes, reset only if the loan was confirmed successfully
    if (!open) {
      // Short delay to avoid visual changes during closing
      setTimeout(() => {
        if (borrowSuccessful) {
          // Do not reset selectedSkin here to allow the user to see their previous choice
          // but reset other states if necessary
          setLoanAmount(0);
          setLoanDuration(7);
          // Reset the success state for the next loan
          setBorrowSuccessful(false);
        }
      }, 300);
    }
  }
  
  // Authentication with Privy
  const { isAuthenticated, isLoading: privyLoading, login, logout, profile, connectWallet } = useAuth()
  
  // Retrieve the user's Steam inventory
  const { inventory, isLoading: inventoryLoading, error: inventoryError, lastUpdated, refreshInventory, inventoryFetched } = useSteamInventory()
  
  // Global loading state (Privy + user data)
  const isLoading = privyLoading || inventoryLoading;
  
  // Debug logs
  useEffect(() => {
    console.log("Page borrow - States:", {
      privyLoading,
      inventoryLoading,
      isAuthenticated,
      inventoryFetched,
      inventoryLength: inventory?.length || 0
    });
  }, [privyLoading, inventoryLoading, isAuthenticated, inventoryFetched, inventory]);
  
  // Mock CS2 skins for example display when user is not connected
  const mockSkins: SteamItem[] = [
    // { id: "1", market_hash_name: "AWP | Dragon Lore", basePrice: 1500, rarity: "Covert", imageUrl: "/awp.webp", wear: "Factory New", floatValue: 0.01, liquidationRate: 65, loanOffer: 975, steamId: "", stickers: [] },
    // { id: "2", market_hash_name: "Butterfly Knife | Fade", basePrice: 800, rarity: "★", imageUrl: "/karambit.webp", wear: "Minimal Wear", floatValue: 0.08, liquidationRate: 65, loanOffer: 520, steamId: "", stickers: [] },
    // { id: "3", market_hash_name: "AK-47 | Fire Serpent", basePrice: 550, rarity: "Covert", imageUrl: "/ak47.webp", wear: "Field-Tested", floatValue: 0.18, liquidationRate: 65, loanOffer: 357.5, steamId: "", stickers: [] },
    // { id: "4", market_hash_name: "M4A4 | Howl", basePrice: 1200, rarity: "Contraband", imageUrl: "/awp.webp", wear: "Factory New", floatValue: 0.03, liquidationRate: 65, loanOffer: 780, steamId: "", stickers: [] },
    // { id: "5", market_hash_name: "Karambit | Doppler", basePrice: 650, rarity: "★", imageUrl: "/karambit.webp", wear: "Factory New", floatValue: 0.01, liquidationRate: 65, loanOffer: 422.5, steamId: "", stickers: [] },
    // { id: "6", market_hash_name: "Glock-18 | Fade", basePrice: 300, rarity: "Covert", imageUrl: "/ak47.webp", wear: "Factory New", floatValue: 0.02, liquidationRate: 65, loanOffer: 195, steamId: "", stickers: [] }
    { id: "1", market_hash_name: "AK-47 | Redline", basePrice: 2500, rarity: "Classified", imageUrl: "/ak47-redline.png", wear: "Factory New", floatValue: 0.01, liquidationRate: 65, loanOffer: 975, steamId: "", stickers: [] },
  ]
  
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
  
  // Determine the skins to display
  // Use the real inventory directly if available, otherwise use the mocks
  const [displaySkins, setDisplaySkins] = useState<SteamItem[]>(mockSkins);
  
  // Update the skins to display when the inventory changes
  useEffect(() => {
    console.log("Effect de mise à jour des displaySkins - États:", {
      isAuthenticated,
      inventoryFetched,
      inventoryLength: inventory?.length || 0,
      currentDisplaySkins: displaySkins === mockSkins ? "mockSkins" : "realInventory"
    });

    if (isAuthenticated && inventory && Array.isArray(inventory) && inventory.length > 0) {
      console.log("Using real inventory with", inventory.length, "skins");
      console.log("First item of the inventory:", inventory[0]);
      setDisplaySkins(inventory);
    } else if (isAuthenticated && inventoryFetched) {
      console.log("Inventory fetched but empty or invalid, using mocks");
      setDisplaySkins(mockSkins);
    } else if (!isAuthenticated) {
      console.log("User not authenticated, using mocks");
      setDisplaySkins(mockSkins);
    }
  }, [isAuthenticated, inventory, inventoryFetched]);
  
  // Calculate the loan amount based on the selected skin and chosen percentage
  useEffect(() => {
    if (selectedSkin) {
      const selectedSkinData = displaySkins.find(skin => skin.id === selectedSkin);
      if (selectedSkinData) {
        const maxLoanAmount = selectedSkinData.loanOffer;
        const calculatedAmount = (maxLoanAmount * loanPercentage) / 100;
        setLoanAmount(calculatedAmount);
      }
    } else {
      setLoanAmount(0);
    }
  }, [selectedSkin, loanPercentage, displaySkins])
  
  // const handleBorrowRequest = async () => {
  //   if (!profile?.id || !profile?.steamId || !selectedSkin) {
  //     alert("Missing user or skin info.");
  //     throw new Error("Missing user or skin info.");
  //   }
  //   const skin = displaySkins.find(s => s.id === selectedSkin);
  //   if (!skin) {
  //     alert("Skin not found.");
  //     throw new Error("Skin not found.");
  //   }
  //   try {
  //     const res = await fetch("http://localhost:3333/solana/borrow", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         userId: profile.id,
  //         steamId: profile.steamId, // <-- Vérification Steam ID ici (commentée)
  //         items: [skin],
  //         amount: loanAmount,
  //         duration: loanDuration,
  //         skinId: skin.id,
  //         value: skin.basePrice,
  //         userWallet: profile.wallet,
  //       }),
  //     });
  //     const data = await res.json();
  //     if (!res.ok) {
  //       // Affiche le message d'erreur du backend
  //       alert("Erreur: " + (data?.error || "Request failed"));
  //       throw new Error(data?.error || "Request failed");
  //     }
  //     console.log("Borrow response:", data);
  //     setBorrowSuccessful(true);
  //     return data;
  //   } catch (err) {
  //     // Affiche l'erreur JS si jamais
  //     alert("Error: " + (err instanceof Error ? err.message : err));
  //     throw err;
  //   }
  // };

  // Fonction mock pour la démo
  const handleBorrowRequest = async () => {
    // Simule un délai pour l'effet démo
    await new Promise(res => setTimeout(res, 700));
    setBorrowSuccessful(true);
    alert("Transaction acceptée ! (démo)");
    return { success: true };
  };

  const liveTransactions = [
    { username: "alex_cs", amount: "$250", skin: "AWP | Dragon Lore" },
    { username: "knife_master", amount: "$120", skin: "Butterfly Knife | Fade" },
    { username: "pro_gamer", amount: "$85", skin: "AK-47 | Fire Serpent" },
    { username: "headshot_queen", amount: "$190", skin: "M4A4 | Howl" },
    { username: "trader_joe", amount: "$65", skin: "USP-S | Kill Confirmed" },
  ]

  const [currentTransaction, setCurrentTransaction] = useState(0)

  // Manually refresh the inventory if needed
  const handleRefreshInventory = () => {
    console.log("Manual inventory refresh");
    refreshInventory();
  };
  
  // Try to fetch the inventory if the user is authenticated but the inventory has not been fetched
  useEffect(() => {
    if (!privyLoading && isAuthenticated && !inventoryFetched && !inventoryLoading) {
      console.log("Authenticated but inventory not fetched, attempt to fetch...");
      refreshInventory();
    }
  }, [isAuthenticated, inventoryFetched, privyLoading, inventoryLoading, refreshInventory]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTransaction((prev) => (prev + 1) % liveTransactions.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [liveTransactions.length])

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterWear, setFilterWear] = useState<string>('all');
  const [filterPriceMin, setFilterPriceMin] = useState<number>(0);
  const [filterPriceMax, setFilterPriceMax] = useState<number>(10000);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
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
      wear === wearMap[filterWear as keyof typeof wearMap];
    
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

  return (
    <div className="min-h-screen flex flex-col text-white">
      <main className="flex-1 flex flex-col items-center justify-center">
        <LoadingOverlay
          isLoading={isLoading} 
          message="Connecting to your wallet..."
          opacity={0.7}
        />
        <div className="container mx-auto px-4">
          {/* Live borrows ticker
          <div className="flex justify-center mb-6 overflow-hidden">
            <div className="bg-[#111827]/50 backdrop-blur-sm rounded-full px-6 py-1.5 flex items-center gap-2 max-w-full">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#6366f1] to-[#22d3ee] animate-pulse"></div>
              <div className="overflow-hidden w-auto h-5">
                <div
                  className="transition-all duration-500 ease-in-out"
                  style={{ transform: `translateY(-${currentTransaction * 20}px)` }}
                >
                  {liveTransactions.map((tx, index) => (
                    <div key={index} className="h-5 whitespace-nowrap text-sm">
                      <span className="font-medium text-[#6366f1]">{tx.username}</span> just borrowed{" "}
                      <span className="font-medium">{tx.amount}</span> with <span className="italic">{tx.skin}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div> */}

          {/* Main interface - Simple and elegant header */}
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-[#E1E1F5] mb-3 font-poppins">Loan Now</h2>
              </div>
            <div className="flex flex-col md:flex-row gap-[55px] w-full justify-center items-stretch relative">
              {/* Card Collateralize */}
              <Card className="relative flex-1 bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md flex flex-col h-full min-h-[500px] overflow-hidden">
                {/* Overlay grain */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 opacity-[.05]"
                  style={{
                    backgroundImage: "url('/grainbg.avif')",
                    backgroundRepeat: "repeat"
                  }}
                />
                <div className="text-left py-6 px-4 relative z-20">
                  <h2 className="text-2xl font-bold font-poppins text-[#E1E1F5]">You collateralize</h2>
                  {/* <p className="text-[#a1a1c5] text-sm mt-1">Lorem ipsum dolor</p> */}
                </div>
                <div className="p-3 flex flex-col flex-1 relative z-20">
                  {/* Skin selector button */}
                  <Button
                    className="mb-4 w-full bg-[#6366f1] hover:bg-[#5355d1] text-white font-semibold"
                    onClick={() => setSkinSelectorOpen(true)}
                  >
                    {selectedSkin
                      ? "Change skin"
                      : "Select a skin as collateral"}
                  </Button>
                  {/* Skin selection display */}
                  {selectedSkin ? (() => {
                    const skin = displaySkins.find(s => s.id === selectedSkin)
                    if (!skin) return null
                    const { name, wear } = extractSkinInfo(skin.market_hash_name)
                    return (
                      <div className="flex items-center gap-4 p-3 bg-[#161e2e] rounded-lg border border-[#23263a] mb-4">
                        <div className="relative w-16 h-16 overflow-hidden rounded-md flex-shrink-0 bg-[#23263a]">
                          <Image
                            src={skin.imageUrl}
                            alt={name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-semibold text-white text-base truncate">{name}</span>
                          <span className="text-xs text-[#a1a1c5]">{wear}</span>
                          <span className="text-xs text-[#a1a1c5] mt-1">
                            {skin.liquidationRate}% LTV &ndash; Max ${skin.loanOffer.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )
                  })() : (
                    <div className="text-center text-[#a1a1c5] text-sm mt-6 mb-4">
                      No skin selected
                    </div>
                  )}
                  {/* Inventory list */}
                  <div className="flex-1 overflow-y-auto max-h-[260px]">
                    <div className="space-y-1 w-full">
                      {displaySkins
                        .sort((a, b) => a.basePrice - b.basePrice)
                        .map((skin) => {
                          const { name, wear } = extractSkinInfo(skin.market_hash_name)
                          const rarity = skin.rarity ||
                            (skin.market_hash_name.includes('★') ? '★' :
                            skin.market_hash_name.includes('Covert') ? 'Covert' :
                            skin.market_hash_name.includes('Contraband') ? 'Contraband' : '')
                          return (
                            <div
                              key={skin.id}
                              className={`flex items-center gap-3 p-2 hover:bg-[#23263a] transition-colors rounded-md cursor-pointer ${selectedSkin === skin.id ? 'bg-[#23263a] border border-[#6366f1]' : 'border border-transparent'}`}
                              onClick={() => setSelectedSkin(skin.id)}
                            >
                              <div className="relative w-10 h-10 overflow-hidden rounded bg-[#161e2e]">
                                <Image
                                  src={skin.imageUrl}
                                  alt={name}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-sm truncate">{name}</span>
                                <div className="flex items-center gap-1 text-xs text-[#a1a1c5]">
                                  <span>{wear}</span>
                                  <span>•</span>
                                  <span>{skin.liquidationRate}% LTV</span>
                                </div>
                              </div>
                              <span className="text-xs font-medium bg-[#161e2e] px-2 py-0.5 rounded-full">${skin.basePrice.toFixed(0)}</span>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Arrow image au centre */}
              <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                <img src="/arrow.png" alt="arrow" className="w-12 h-12" />
              </div>
              
              {/* Card Borrow */}
              <Card className="relative flex-1 bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md flex flex-col min-h-[500px] overflow-hidden">
                {/* Overlay grain */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 opacity-[.05]"
                  style={{
                    backgroundImage: "url('/grainbg.avif')",
                    backgroundRepeat: "repeat"
                  }}
                />
                <div className="text-left py-6 px-4 relative z-20">
                  <h2 className="text-2xl font-bold font-poppins text-[#E1E1F5]">You borrow</h2>
                  {/* <p className="text-[#a1a1c5] text-sm mt-1">Lorem ipsum dolor sit amet</p> */}
                </div>
                <div className="p-3 flex flex-col items-center flex-1 relative z-20">
                  {/* Loan amount */}
                  <div className="flex flex-col items-center mb-4 w-full">
                    <span className="text-3xl font-bold mb-2">
                      {loanAmount ? `$${loanAmount.toFixed(2)}` : "$0.00"}
                    </span>
                    {/* Loan percentage slider */}
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={1}
                      value={loanPercentage}
                      onChange={e => setLoanPercentage(Number(e.target.value))}
                      className="w-full accent-[#6366f1] mb-2"
                      disabled={!selectedSkin}
                    />
                    <div className="flex justify-between w-full text-xs text-[#a1a1c5] mb-2">
                      <span>10%</span>
                      <span>100%</span>
                    </div>
                    <div className="flex justify-between w-full gap-2 mb-2">
                      {[10, 25, 50, 75, 100].map(val => (
                        <Button
                          key={val}
                          size="sm"
                          variant={loanPercentage === val ? "default" : "outline"}
                          className={`rounded-full px-3 py-1 text-xs ${loanPercentage === val ? "bg-[#6366f1] text-white" : "bg-[#23263a] text-[#a1a1c5]"}`}
                          onClick={() => setLoanPercentage(val)}
                          disabled={!selectedSkin}
                        >
                          {val}%
                        </Button>
                      ))}
                    </div>
                    <span className="text-xs text-[#a1a1c5]">USDC</span>
                  </div>
                  {/* Loan duration */}
                  <div className="flex flex-col items-center mb-4 w-full">
                    <label className="text-xs text-[#a1a1c5] mb-1">Duration</label>
                    <div className="flex gap-2 w-full justify-center">
                      {[7, ...loanDurationOptions].map(option => (
                        <Button
                          key={option}
                          size="sm"
                          variant={loanDuration === option ? "default" : "outline"}
                          className={`rounded-full px-3 py-1 text-xs ${loanDuration === option ? "bg-[#6366f1] text-white" : "bg-[#23263a] text-[#a1a1c5]"}`}
                          onClick={() => setLoanDuration(option)}
                          disabled={!selectedSkin}
                        >
                          {option}d
                        </Button>
                      ))}
                    </div>
                  </div>
                  {/* How it works */}
                  <div className="mb-4 w-full text-center">
                    <button
                      className="text-xs text-[#a1a1c5] underline hover:text-[#6366f1] transition"
                      onClick={() => setHowItWorksOpen(!howItWorksOpen)}
                      type="button"
                    >
                      How does it work ?
                    </button>
                    {howItWorksOpen && (
                      <div className="mt-2 text-xs text-[#a1a1c5] bg-[#161e2e] rounded-md p-2">
                        Select a skin, choose your loan amount and duration, then confirm to borrow USDC. Your skin is held as collateral until you repay.
                      </div>
                    )}
                  </div>
                  {/* Confirm button */}
                  <Button
                    className="w-full bg-gradient-to-r from-[#6366f1] to-[#7f8fff] text-white font-semibold text-base py-2 rounded-lg mt-auto"
                    disabled={!selectedSkin || loanAmount <= 0}
                    onClick={() => setBorrowModalOpen(true)}
                  >
                    Confirm and borrow now
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Skin selector modal */}
        {skinSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSkinSelectorOpen(false)}>
            <div className={`bg-[#1f2937] border border-[#2a3548] rounded-lg shadow-lg overflow-hidden w-full max-w-[95vw] ${gridViewActive ? 'md:max-w-[800px]' : 'md:max-w-[500px]'}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-2 border-b border-[#2a3548]">
                <h3 className="text-xs font-medium">Select a skin</h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full hover:bg-[#2a3548] flex items-center justify-center"
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
                    className="h-6 w-6 p-0 rounded-full hover:bg-[#2a3548] flex items-center justify-center"
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
                    className="h-6 w-6 p-0 rounded-full hover:bg-[#2a3548]" 
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
              <div className="p-2 border-b border-[#2a3548]">
                <div className="flex gap-2 items-center">
                  <div className="relative flex-grow">
                    <Search className="h-3 w-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search skins..."
                      className="w-full bg-[#161e2e] border border-[#2a3548] rounded-md py-1 pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                      autoFocus
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-[#1f2937] border-[#2a3548] hover:bg-[#2a3548] h-6 px-2 text-xs flex items-center gap-1"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-3 w-3" />
                    <span>Filters</span>
                  </Button>
                </div>
                
                {/* Filter panel */}
                {showFilters && (
                  <div className="mt-2 p-3 bg-[#161e2e] border border-[#2a3548] rounded-md space-y-3 animate-fadeIn">
                    {/* Rarity filter */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Rarity</label>
                      <select
                        className="w-full bg-[#1f2937] border border-[#2a3548] rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
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
                        className="w-full bg-[#1f2937] border border-[#2a3548] rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
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
                      <label className="text-xs text-gray-400">Price Range ($50 - $10,000)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          value={filterPriceMin}
                          onChange={(e) => setFilterPriceMin(Math.max(50, Math.min(filterPriceMax, parseInt(e.target.value) || 0)))}
                          className="w-full bg-[#1f2937] border border-[#2a3548] rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                        />
                        <span className="text-xs text-gray-400">to</span>
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          value={filterPriceMax}
                          onChange={(e) => setFilterPriceMax(Math.max(filterPriceMin, Math.min(10000, parseInt(e.target.value) || 10000)))}
                          className="w-full bg-[#1f2937] border border-[#2a3548] rounded-md py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                        />
                      </div>
                    </div>
                    
                    {/* Apply filters button */}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className="bg-[#6366f1] hover:bg-[#5355d1] text-xs py-1 px-3"
                        onClick={() => setShowFilters(false)}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-2 max-h-[500px] overflow-y-auto">
                {/* Message si aucun skin ne correspond aux critères */}
                {displaySkins.filter(filterSkins).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="text-3xl mb-3">😢</div>
                    <h3 className="text-sm font-medium mb-1">No matching skins found</h3>
                    <p className="text-xs text-gray-400">We couldn't find any skins matching your criteria. Try adjusting your filters or price range ($50-$10,000).</p>
                  </div>
                )}
                
                {/* List view */}
                {!gridViewActive && displaySkins.filter(filterSkins).length > 0 && (
                  <div className="space-y-1 w-full">
                    {displaySkins
                      .filter(filterSkins)
                      .sort((a, b) => a.basePrice - b.basePrice)
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
                            className={`flex items-center gap-4 p-3 hover:bg-[#2a3548] transition-colors rounded-md cursor-pointer ${selectedSkin === skin.id ? 'bg-[#2a3548] border border-[#3a4558]' : 'border border-transparent'}`}
                            onClick={() => {
                              setSelectedSkin(skin.id);
                              setSkinSelectorOpen(false);
                            }}
                          >
                            <div className="relative w-16 h-16 overflow-hidden rounded-md flex-shrink-0 bg-[#161e2e]">
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
                                <span className="text-xs font-medium bg-[#161e2e] px-2 py-0.5 rounded-full">${skin.basePrice.toFixed(2)}</span>
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
                      .sort((a, b) => a.basePrice - b.basePrice)
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
                            className={`flex flex-col p-3 hover:bg-[#2a3548] transition-colors rounded-md cursor-pointer border border-transparent ${selectedSkin === skin.id ? 'bg-[#2a3548] border-[#3a4558]' : ''}`}
                            onClick={() => {
                              setSelectedSkin(skin.id);
                              setSkinSelectorOpen(false);
                            }}
                          >
                            <div className="relative w-full h-32 overflow-hidden rounded-md flex-shrink-0 mb-2 bg-[#161e2e] group-hover:scale-105 transition-transform">
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
                                <span className="text-xs font-medium bg-[#161e2e] px-2 py-0.5 rounded-full">${skin.basePrice.toFixed(2)}</span>
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
      {/* Borrow confirmation modal */}
      <BorrowConfirmationModal 
        open={borrowModalOpen} 
        onOpenChange={handleConfirmationOpenChange}
        selectedSkin={selectedSkin}
        displaySkins={displaySkins}
        loanAmount={loanAmount}
        loanDuration={loanDuration}
        extractSkinInfo={extractSkinInfo}
        onConfirm={handleBorrowRequest} // <-- Utilise la fonction mock
      />
    <Footer />
    </div>
  )
}
