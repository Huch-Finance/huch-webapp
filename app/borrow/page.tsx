"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Bell, ChevronDown, Filter, RotateCcw, Search, Settings, ArrowRight, Clock, AlertCircle, Check, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BorrowConfirmationModal } from "@/components/borrow-confirmation-modal"
import { LoadingOverlay } from "@/components/loading-overlay"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/hooks/use-auth"
import { SteamAuthButton } from "@/components/steam-auth-button"
import { useSteamInventory, SteamItem } from "@/hooks/use-steam-inventory"

export default function Home() {
  const [activeTab, setActiveTab] = useState("borrow")
  const [currency, setCurrency] = useState("USDC")
  const [selectedSkin, setSelectedSkin] = useState<string | null>(null)
  const [skinSelectorOpen, setSkinSelectorOpen] = useState(false)
  const [loanPercentage, setLoanPercentage] = useState(100)
  const [loanAmount, setLoanAmount] = useState(0)
  const [loanDuration, setLoanDuration] = useState(7) // Durée du prêt en jours
  const loanDurationOptions = [3, 7, 14, 30] // Options de durée en jours
  const [howItWorksOpen, setHowItWorksOpen] = useState(false) // État pour le menu déroulant "How it works"
  
  // État pour le modal de confirmation d'emprunt
  const [borrowModalOpen, setBorrowModalOpen] = useState(false)
  
  // Gestionnaire pour la fermeture du modal de confirmation
  const handleConfirmationOpenChange = (open: boolean) => {
    setBorrowModalOpen(open);
    
    // Si le modal se ferme, réinitialiser l'état de sélection pour permettre un nouveau prêt
    if (!open) {
      // Délai court pour éviter des changements visuels pendant la fermeture
      setTimeout(() => {
        // Ne pas réinitialiser selectedSkin ici pour permettre à l'utilisateur de voir son choix précédent
        // mais réinitialiser d'autres états si nécessaire
        setLoanAmount(0);
        setLoanDuration(7);
      }, 300);
    }
  }
  
  // Authentification avec Privy
  const { isAuthenticated, isLoading: privyLoading, login, logout, profile, connectWallet } = useAuth()
  
  // Récupérer l'inventaire Steam de l'utilisateur
  const { inventory, isLoading: inventoryLoading, error: inventoryError, lastUpdated, refreshInventory, inventoryFetched } = useSteamInventory()
  
  // État de chargement global (Privy + données utilisateur)
  const isLoading = privyLoading || inventoryLoading;
  
  // Afficher des logs pour déboguer
  useEffect(() => {
    console.log("Page borrow - États:", {
      privyLoading,
      inventoryLoading,
      isAuthenticated,
      inventoryFetched,
      inventoryLength: inventory?.length || 0
    });
  }, [privyLoading, inventoryLoading, isAuthenticated, inventoryFetched, inventory]);
  
  // Mock CS2 skins pour l'affichage d'exemple quand l'utilisateur n'est pas connecté
  const mockSkins: SteamItem[] = [
    { id: "1", market_hash_name: "AWP | Dragon Lore", basePrice: 1500, rarity: "Covert", imageUrl: "/awp.webp", wear: "Factory New", floatValue: 0.01, liquidationRate: 65, loanOffer: 975, steamId: "", stickers: [] },
    { id: "2", market_hash_name: "Butterfly Knife | Fade", basePrice: 800, rarity: "★", imageUrl: "/karambit.webp", wear: "Minimal Wear", floatValue: 0.08, liquidationRate: 65, loanOffer: 520, steamId: "", stickers: [] },
    { id: "3", market_hash_name: "AK-47 | Fire Serpent", basePrice: 550, rarity: "Covert", imageUrl: "/ak47.webp", wear: "Field-Tested", floatValue: 0.18, liquidationRate: 65, loanOffer: 357.5, steamId: "", stickers: [] },
    { id: "4", market_hash_name: "M4A4 | Howl", basePrice: 1200, rarity: "Contraband", imageUrl: "/awp.webp", wear: "Factory New", floatValue: 0.03, liquidationRate: 65, loanOffer: 780, steamId: "", stickers: [] },
    { id: "5", market_hash_name: "Karambit | Doppler", basePrice: 650, rarity: "★", imageUrl: "/karambit.webp", wear: "Factory New", floatValue: 0.01, liquidationRate: 65, loanOffer: 422.5, steamId: "", stickers: [] },
    { id: "6", market_hash_name: "Glock-18 | Fade", basePrice: 300, rarity: "Covert", imageUrl: "/ak47.webp", wear: "Factory New", floatValue: 0.02, liquidationRate: 65, loanOffer: 195, steamId: "", stickers: [] }
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
  
  // Déterminer les skins à afficher
  // Utiliser directement l'inventaire réel si disponible, sinon utiliser les mocks
  const [displaySkins, setDisplaySkins] = useState<SteamItem[]>(mockSkins);
  
  // Mettre à jour les skins à afficher lorsque l'inventaire change
  useEffect(() => {
    console.log("Effect de mise à jour des displaySkins - États:", {
      isAuthenticated,
      inventoryFetched,
      inventoryLength: inventory?.length || 0,
      currentDisplaySkins: displaySkins === mockSkins ? "mockSkins" : "realInventory"
    });
    
    if (isAuthenticated && inventory && Array.isArray(inventory) && inventory.length > 0) {
      console.log("Utilisation de l'inventaire réel avec", inventory.length, "skins");
      console.log("Premier item de l'inventaire:", inventory[0]);
      setDisplaySkins(inventory);
    } else if (isAuthenticated && inventoryFetched) {
      console.log("Inventaire récupéré mais vide ou invalide, utilisation des mocks");
      setDisplaySkins(mockSkins);
    } else if (!isAuthenticated) {
      console.log("Utilisateur non authentifié, utilisation des mocks");
      setDisplaySkins(mockSkins);
    }
  }, [isAuthenticated, inventory, inventoryFetched, mockSkins]);
  
  // Calcul du montant du prêt en fonction du pourcentage choisi
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
  
  // Pas besoin de fonction handleBorrow car elle est désormais dans le composant BorrowConfirmationModal

  const liveTransactions = [
    { username: "alex_cs", amount: "$250", skin: "AWP | Dragon Lore" },
    { username: "knife_master", amount: "$120", skin: "Butterfly Knife | Fade" },
    { username: "pro_gamer", amount: "$85", skin: "AK-47 | Fire Serpent" },
    { username: "headshot_queen", amount: "$190", skin: "M4A4 | Howl" },
    { username: "trader_joe", amount: "$65", skin: "USP-S | Kill Confirmed" },
  ]

  const [currentTransaction, setCurrentTransaction] = useState(0)

  // Rafraîchir l'inventaire manuellement si nécessaire
  const handleRefreshInventory = () => {
    console.log("Rafraîchissement manuel de l'inventaire");
    refreshInventory();
  };
  
  // Tenter de récupérer l'inventaire si l'utilisateur est authentifié mais que l'inventaire n'a pas été récupéré
  useEffect(() => {
    if (!privyLoading && isAuthenticated && !inventoryFetched && !inventoryLoading) {
      console.log("Authentifié mais inventaire non récupéré, tentative de récupération...");
      refreshInventory();
    }
  }, [isAuthenticated, inventoryFetched, privyLoading, inventoryLoading, refreshInventory]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTransaction((prev) => (prev + 1) % liveTransactions.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [liveTransactions.length])

  return (
    <>
      <Navbar />
      <LoadingOverlay 
        isLoading={isLoading} 
        message="Connecting to your wallet..."
        opacity={0.7}
      />
      <main className="min-h-screen bg-[#0a0c14] text-white relative overflow-hidden pt-16">
        {/* Background with floating elements */} 
        <div className="inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-teal-500/10 blur-3xl"></div>
          <div className="absolute top-2/3 left-1/3 w-24 h-24 rounded-full bg-blue-500/10 blur-3xl"></div>

          {/* Floating skin images */}
          <div className="absolute top-[20%] right-[15%] w-16 h-16 opacity-30 animate-float-slow">
            <Image
              src="/ak47.webp"
              alt="Floating skin"
              width={64}
              height={64}
              className="rounded-md"
            />
          </div>
          <div className="absolute top-[60%] left-[10%] w-20 h-20 opacity-20 animate-float">
            <Image
              src="/awp.webp"
              alt="Floating skin"
              width={80}
              height={80}
              className="rounded-md"
            />
          </div>
          <div className="absolute bottom-[20%] right-[25%] w-24 h-24 opacity-25 animate-float-slow-reverse">
            <Image
              src="/karambit.webp"
              alt="Floating skin"
              width={96}
              height={96}
              className="rounded-md"
            />
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-8">
          {/* Live borrows ticker */}
          <div className="flex justify-center mb-6 overflow-hidden">
            <div className="bg-[#111827]/50 backdrop-blur-sm rounded-full px-6 py-1.5 flex items-center gap-2 max-w-full">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#6366f1] to-[#22d3ee] animate-pulse"></div>
              <div className="overflow-hidden relative w-72 sm:w-80 md:w-96 h-5">
                <div
                  className="absolute transition-all duration-500 ease-in-out"
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
          </div>

          {/* Main interface - Simple and elegant header */}
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-medium text-white mb-3">Loan Now</h2>
              <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">
                Get instant USDC loans using your CS2 skins as collateral
              </p>
              
              <div className="inline-flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-white font-medium">65%</p>
                  <p className="text-gray-500 text-xs">Loan-to-Value</p>
                </div>
                
                <div className="h-8 w-px bg-gray-800"></div>
                
                <div className="text-center">
                  <p className="text-white font-medium">Instant</p>
                  <p className="text-gray-500 text-xs">Processing</p>
                </div>
              </div>
            </div>
            
            {/* Commented buttons - not needed for now
            <div className="flex items-center justify-end mb-6">
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" className="rounded-full bg-[#1f2937] hover:bg-[#1f2937]/80 px-5">
                  Lend
                </Button>
                <div className="flex bg-[#1f2937] rounded-full p-1">
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            */}

            {/* Main borrow interface - rain.fi style */}
            <div className="bg-[#0f1420] backdrop-blur-sm rounded-xl overflow-hidden border border-[#1f2937] mb-4 shadow-md max-w-md mx-auto">
              {/* Top section with title */}
              <div className="text-center border-b border-[#1f2937] py-2">
                <h2 className="text-sm font-medium text-white">Borrow</h2>
              </div>
              
              {/* You collateralize section */}
              <div className="p-3 border-b border-[#1f2937]">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-medium text-gray-400">You collateralize</h3>
                  
                  {/* Skin selector button */}
                  <div className="relative">
                    {/* Vérifier si l'utilisateur est connecté et a un Steam ID et un lien d'échange */}
                    {isAuthenticated && profile?.steamId && profile?.tradeLink ? (
                      /* L'utilisateur a un Steam ID et un lien d'échange, afficher le sélecteur de skins */
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#1f2937] border-[#2a3548] hover:bg-[#2a3548] rounded-full flex items-center gap-1 h-6 px-2 text-xs"
                          onClick={() => setSkinSelectorOpen(true)}
                        >
                          {selectedSkin ? "Change skin" : "Select skin"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full hover:bg-[#2a3548] flex items-center justify-center"
                          onClick={handleRefreshInventory}
                          disabled={inventoryLoading}
                          title="Refresh inventory"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : isAuthenticated ? (
                      /* L'utilisateur est connecté mais n'a pas de Steam ID ou de lien d'échange */
                      <SteamAuthButton />
                    ) : (
                      /* L'utilisateur n'est pas connecté */
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#1f2937] border-[#2a3548] hover:bg-[#2a3548] rounded-full flex items-center gap-1 h-6 px-2 text-xs"
                        onClick={() => setSkinSelectorOpen(true)}
                      >
                        <span>Select skin</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Skin selection display */}
                <div className="bg-[#1f2937] rounded-lg p-2 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden relative flex-shrink-0">
                    {selectedSkin !== null ? (
                      <Image
                        src={displaySkins.find(skin => skin.id === selectedSkin)?.imageUrl || ''}
                        alt={displaySkins.find(skin => skin.id === selectedSkin)?.market_hash_name || ''}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2a3548] flex items-center justify-center">
                        <span className="text-xs text-gray-400">No skin</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="text-sm font-medium">
                          {selectedSkin !== null ? 
                            extractSkinInfo(displaySkins.find(skin => skin.id === selectedSkin)?.market_hash_name || '').name : 
                            "Select a skin"}
                        </h4>
                        {selectedSkin !== null && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs text-gray-400">
                              {extractSkinInfo(displaySkins.find(skin => skin.id === selectedSkin)?.market_hash_name || '').wear}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">
                              Float: {displaySkins.find(skin => skin.id === selectedSkin)?.floatValue.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          ${selectedSkin !== null ? 
                            displaySkins.find(skin => skin.id === selectedSkin)?.basePrice.toFixed(2) || '0' : '-'}
                        </div>
                        <div className="text-xs text-gray-400">Market price</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="h-1 w-full bg-[#2a3548] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#6366f1] to-[#22d3ee] w-[65%]"></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-gray-400">65% LTV</span>
                        <span className="text-[10px] text-gray-400">Max: 85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* You borrow section */}
              <div className="p-3 border-b border-[#1f2937]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-medium text-gray-400">You borrow</h3>
                  <div className="flex items-center gap-1 bg-[#1f2937] px-2 py-1 rounded-full">
                    <span className="text-xs">USDC</span>
                    <ChevronDown className="h-3 w-3" />
                  </div>
                </div>
                
                {/* Montant du prêt */}
                <div className="bg-[#1f2937] rounded-lg p-3 mb-3">
                  <div className="flex items-center">
                    <div className="flex-grow">
                      <input
                        type="text"
                        className="w-full bg-transparent border-none text-white text-2xl font-medium focus:outline-none"
                        placeholder="0.00"
                        value={selectedSkin !== null ? loanAmount.toFixed(2) : ''}
                        readOnly
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2a3548] flex items-center justify-center">
                        <span className="text-sm font-medium">$</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedSkin !== null && (
                  <>
                    {/* Curseur de pourcentage */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-white font-medium">Loan amount</span>
                        <span className="text-xs text-white font-medium">{loanPercentage}%</span>
                      </div>
                      <div className="relative">
                        <div className="h-2 w-full bg-[#1f2937] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#6366f1] to-[#22d3ee]" 
                            style={{ width: `${loanPercentage}%` }}
                          ></div>
                        </div>
                        {/* Rond du curseur */}
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg transition-none" 
                          style={{ left: `calc(${loanPercentage}% - 8px)` }}
                        ></div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={loanPercentage} 
                          onChange={(e) => setLoanPercentage(parseInt(e.target.value))} 
                          className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-grab active:cursor-grabbing z-10" 
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-gray-400">0%</span>
                        <span className="text-[10px] text-gray-400">Max: ${selectedSkin !== null ? 
                          (displaySkins.find(skin => skin.id === selectedSkin)?.loanOffer || 0).toFixed(2) : '0.00'}</span>
                      </div>
                    </div>
                    
                    {/* Sélection de la durée */}
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white font-medium">Loan duration</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {loanDurationOptions.map((days) => (
                          <button
                            key={days}
                            onClick={() => setLoanDuration(days)}
                            className={`text-center py-1 px-2 rounded-lg text-xs ${loanDuration === days 
                              ? 'bg-gradient-to-r from-[#6366f1] to-[#22d3ee] text-white' 
                              : 'bg-[#1f2937] text-gray-400'}`}
                          >
                            {days} days
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Informations sur le prêt */}
                    <div className="bg-[#1f2937] rounded-lg p-2 mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Total to repay</span>
                        <span className="text-xs text-white">${(loanAmount * (1 + 0.025 * loanDuration / 7)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Due date</span>
                        <span className="text-xs text-white">{new Date(Date.now() + loanDuration * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* How it works section */}
              <div className="p-3">
                <div className="w-full">
                  <button 
                    onClick={() => setHowItWorksOpen(prev => !prev)}
                    className="w-full flex justify-between items-center bg-[#1f2937] hover:bg-[#2a3548] rounded-lg p-2 transition-colors"
                  >
                    <span className="text-xs font-medium">How it works</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${howItWorksOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {howItWorksOpen && (
                    <div className="mt-2 bg-[#1f2937] rounded-lg p-3 border border-[#2a3548] animate-slideDown">
                      <h3 className="text-sm font-medium mb-2">How Huch Finance works</h3>
                      <p className="text-xs text-gray-400 mb-3">
                        Huch Finance allows you to borrow USDC using your CS2 skins as collateral at a 65% loan-to-value ratio.
                      </p>
                      <div className="flex justify-between items-center gap-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-[#6366f1]/20 flex items-center justify-center mb-1">
                            <span className="text-[#6366f1] text-[10px] font-bold">1</span>
                          </div>
                          <h4 className="text-[10px] font-medium mb-1">Connect wallet</h4>
                          <p className="text-[9px] text-gray-400">Link your Steam account</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-[#6366f1]/20 flex items-center justify-center mb-1">
                            <span className="text-[#6366f1] text-[10px] font-bold">2</span>
                          </div>
                          <h4 className="text-[10px] font-medium mb-1">Borrow USDC</h4>
                          <p className="text-[9px] text-gray-400">Get USDC loans against skins</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-[#6366f1]/20 flex items-center justify-center mb-1">
                            <span className="text-[#6366f1] text-[10px] font-bold">3</span>
                          </div>
                          <h4 className="text-[10px] font-medium mb-1">Repay anytime</h4>
                          <p className="text-[9px] text-gray-400">No early repayment fees</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Borrow button */}
              <div className="flex justify-center my-3 max-w-md mx-auto px-3">
                <Button
                  className="bg-[#6366f1] hover:bg-[#5355d1] rounded-full flex items-center gap-1 text-xs py-1.5 px-3 shadow-sm transition-all w-full"
                  onClick={() => {
                    if (!isAuthenticated) {
                      login();
                    } else if (selectedSkin !== null) {
                      // Ouvrir le modal de confirmation d'emprunt
                      setBorrowModalOpen(true);
                    } else {
                      setSkinSelectorOpen(true);
                    }
                  }}
                >
                  <ArrowRight className="h-3 w-3" />
                  <span>{!isAuthenticated ? "Connect Account to Borrow" : (selectedSkin !== null ? "Borrow Now" : "Select a Skin to Borrow")}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Skin selector modal */}
        {skinSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSkinSelectorOpen(false)}>
            <div className="bg-[#1f2937] border border-[#2a3548] rounded-lg shadow-lg overflow-hidden w-[300px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-2 border-b border-[#2a3548]">
                <h3 className="text-xs font-medium">Select a skin</h3>
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
              <div className="p-2 border-b border-[#2a3548]">
                <div className="relative">
                  <Search className="h-3 w-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search skins..."
                    className="w-full bg-[#161e2e] border border-[#2a3548] rounded-md py-1 pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                    autoFocus
                  />
                </div>
              </div>
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {displaySkins.map((skin) => {
                  // Extraire le nom et l'usure du skin
                  const { name, wear } = extractSkinInfo(skin.market_hash_name)
                  
                  // Déterminer la rareté (pour la couleur)
                  const rarity = skin.rarity || 
                    (skin.market_hash_name.includes('★') ? '★' : 
                    skin.market_hash_name.includes('Covert') ? 'Covert' : 
                    skin.market_hash_name.includes('Contraband') ? 'Contraband' : '')
                  
                  return (
                    <div 
                      key={skin.id} 
                      className={`flex items-center gap-3 p-2 hover:bg-[#2a3548] transition-colors rounded-md cursor-pointer ${selectedSkin === skin.id ? 'bg-[#2a3548]' : ''}`}
                      onClick={() => {
                        setSelectedSkin(skin.id);
                        setSkinSelectorOpen(false);
                      }}
                    >
                      <div className="relative w-10 h-10 overflow-hidden rounded-md flex-shrink-0">
                        <Image
                          src={skin.imageUrl}
                          alt={name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-medium truncate">{name}</h4>
                          <span className="text-xs font-medium">${skin.basePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[10px] ${
                            rarity === "Covert" ? "text-red-400" : 
                            rarity === "Contraband" ? "text-amber-400" : 
                            rarity === "★" ? "text-yellow-400" : "text-gray-400"
                          }`}>{rarity || 'Normal'}</span>
                          <span className="text-[10px] text-gray-400">•</span>
                          <span className="text-[10px] text-gray-400">{wear}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      
      {/* Modal de confirmation d'emprunt */}
      <BorrowConfirmationModal 
        open={borrowModalOpen} 
        onOpenChange={handleConfirmationOpenChange}
        selectedSkin={selectedSkin}
        displaySkins={displaySkins}
        loanAmount={loanAmount}
        loanDuration={loanDuration}
        extractSkinInfo={extractSkinInfo}
        onConfirm={() => {
          console.log("Loan confirmed for", loanAmount, "USDC")
          // Dans une implémentation réelle, ici on pourrait:
          // 1. Mettre à jour l'état de l'utilisateur
          // 2. Rediriger vers une page de confirmation
          // 3. Mettre à jour le solde USDC de l'utilisateur
        }}
      />
    </>
  )
}
