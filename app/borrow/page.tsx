"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Bell, ChevronDown, Filter, RotateCcw, Search, Settings, ArrowRight, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/hooks/use-auth"

export default function Home() {
  const [activeTab, setActiveTab] = useState("borrow")
  const [currency, setCurrency] = useState("USDC")
  const [selectedSkin, setSelectedSkin] = useState<number | null>(null)
  const [skinSelectorOpen, setSkinSelectorOpen] = useState(false)
  
  // Authentification avec Privy
  const { isAuthenticated, isLoading, login, logout, profile, connectWallet } = useAuth()
  
  // Mock CS2 skins for example display
  const mockSkins = [
    { id: 1, name: "AWP | Dragon Lore", price: "$1,500", rarity: "Covert", image: "/awp.webp", wear: "Factory New", float: "0.01" },
    { id: 2, name: "Butterfly Knife | Fade", price: "$800", rarity: "★", image: "/karambit.webp", wear: "Minimal Wear", float: "0.08" },
    { id: 3, name: "AK-47 | Fire Serpent", price: "$550", rarity: "Covert", image: "/ak47.webp", wear: "Field-Tested", float: "0.18" },
    { id: 4, name: "M4A4 | Howl", price: "$1,200", rarity: "Contraband", image: "/awp.webp", wear: "Factory New", float: "0.03" },
    { id: 5, name: "Karambit | Doppler", price: "$650", rarity: "★", image: "/karambit.webp", wear: "Factory New", float: "0.01" },
    { id: 6, name: "Glock-18 | Fade", price: "$300", rarity: "Covert", image: "/ak47.webp", wear: "Factory New", float: "0.02" }
  ]

  const liveTransactions = [
    { username: "alex_cs", amount: "$250", skin: "AWP | Dragon Lore" },
    { username: "knife_master", amount: "$120", skin: "Butterfly Knife | Fade" },
    { username: "pro_gamer", amount: "$85", skin: "AK-47 | Fire Serpent" },
    { username: "headshot_queen", amount: "$190", skin: "M4A4 | Howl" },
    { username: "trader_joe", amount: "$65", skin: "USP-S | Kill Confirmed" },
  ]

  const [currentTransaction, setCurrentTransaction] = useState(0)

  if (!isLoading && isAuthenticated) {
    console.log(profile)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTransaction((prev) => (prev + 1) % liveTransactions.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Navbar />
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
          <div className="bg-[#111827]/50 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#6366f1] to-[#22d3ee] animate-pulse"></div>
            <div className="overflow-hidden relative w-64 h-5">
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

        {/* Main interface */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium">CS2 Skins</h2>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#1f2937] border-[#2a3548] hover:bg-[#2a3548] rounded-full flex items-center gap-1 h-6 px-2 text-xs"
                    onClick={() => setSkinSelectorOpen(!skinSelectorOpen)}
                  >
                    {selectedSkin !== null ? (
                      <div className="flex items-center gap-1">
                        <div className="relative w-4 h-4 overflow-hidden rounded-full">
                          <Image
                            src={mockSkins[selectedSkin].image}
                            alt={mockSkins[selectedSkin].name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-xs truncate max-w-[80px]">{mockSkins[selectedSkin].name.split(' | ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-xs">Select skin</span>
                    )}
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${skinSelectorOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {/* Dropdown Menu - Improved */}
                  {skinSelectorOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                      <div className="bg-[#1f2937] border border-[#2a3548] rounded-lg shadow-lg overflow-hidden w-[300px] max-w-[90vw]">
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
                          {mockSkins.map((skin, index) => (
                            <div 
                              key={skin.id} 
                              className={`flex items-center gap-3 p-2 hover:bg-[#2a3548] transition-colors rounded-md cursor-pointer ${selectedSkin === index ? 'bg-[#2a3548]' : ''}`}
                              onClick={() => {
                                setSelectedSkin(index);
                                setSkinSelectorOpen(false);
                              }}
                            >
                              <div className="relative w-10 h-10 overflow-hidden rounded-md flex-shrink-0">
                                <Image
                                  src={skin.image}
                                  alt={skin.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="text-xs font-medium truncate">{skin.name}</div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-gray-400">{skin.wear}</span>
                                  <span className="text-xs font-medium">{skin.price}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-t-[#5D5FEF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-1"></div>
                  <p className="text-xs text-gray-400">Loading...</p>
                </div>
              ) : isAuthenticated ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">No CS2 skins found</span>
                    <span className="text-xs">😢</span>
                  </div>
                </div>
              ) : selectedSkin !== null ? (
                <div className="flex items-center justify-between bg-[#161e2e] rounded-lg p-3 h-[72px]">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 overflow-hidden rounded-md">
                      <Image
                        src={mockSkins[selectedSkin].image}
                        alt={mockSkins[selectedSkin].name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-400 truncate max-w-[180px]">{mockSkins[selectedSkin].name}</div>
                      <div className="text-[10px] text-gray-500">{mockSkins[selectedSkin].wear} · Float: {mockSkins[selectedSkin].float}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold">{mockSkins[selectedSkin].price}</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="text-xs text-gray-400">Select a skin to collateralize</div>
                  <div className="text-[10px] text-gray-500 italic">Example skins available</div>
                </div>
              )}
            </div>
            
            {/* You borrow section - in the same block */}
            <div className="p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-medium text-gray-400">You borrow</h3>
                
                {/* Currency selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#1f2937] border-[#2a3548] hover:bg-[#2a3548] rounded-full flex items-center gap-1 h-6 px-2 text-xs"
                    >
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-[#6366f1] flex items-center justify-center text-[10px] font-bold">$</div>
                        <span className="text-xs">{currency}</span>
                      </div>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1f2937] border-[#2a3548] rounded-lg p-1 w-28">
                    <DropdownMenuItem onClick={() => setCurrency("USDC")} className="rounded-md hover:bg-[#2a3548]">
                      <div className="flex items-center gap-1 py-1">
                        <div className="w-4 h-4 rounded-full bg-[#6366f1] flex items-center justify-center text-[10px] font-bold">$</div>
                        <span className="text-xs">USDC</span>
                      </div>
                    </DropdownMenuItem>
                    {/*<DropdownMenuItem onClick={() => setCurrency("ETH")}>ETH</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrency("BTC")}>BTC</DropdownMenuItem>*/}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {selectedSkin !== null ? (
                <div className="flex items-center justify-between bg-[#161e2e] rounded-lg p-3 h-[72px]">
                  <div>
                    <div className="text-sm font-medium">USDC</div>
                    <div className="text-xs text-gray-400">Maximum borrow amount (65% LTV)</div>
                  </div>
                  <div className="text-sm font-bold">{parseInt(mockSkins[selectedSkin].price.replace('$', '')) * 0.65}$</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <p className="text-xs text-gray-400">{isAuthenticated ? "Select a skin above" : "Connect wallet and select a skin"}</p>
                </div>
              )}
            </div>
          </div>

          {/* How it works dropdown */}
          <div className="flex justify-center mb-2 max-w-md mx-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-transparent text-[10px]"
                >
                  <span>How it works</span>
                  <ChevronDown className="h-2 w-2 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-[#1f2937] border-[#2a3548] rounded-lg p-3 w-[300px] shadow-md">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#6366f1]/20 flex items-center justify-center mb-1">
                      <span className="text-[#6366f1] text-[10px] font-bold">1</span>
                    </div>
                    <h4 className="text-[10px] font-medium mb-1">Deposit skins</h4>
                    <p className="text-[9px] text-gray-400">Select CS2 skins as collateral</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#6366f1]/20 flex items-center justify-center mb-1">
                      <span className="text-[#6366f1] text-[10px] font-bold">2</span>
                    </div>
                    <h4 className="text-[10px] font-medium mb-1">Borrow crypto</h4>
                    <p className="text-[9px] text-gray-400">Get USDC loans against skins</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#6366f1]/20 flex items-center justify-center mb-1">
                      <span className="text-[#6366f1] text-[10px] font-bold">3</span>
                    </div>
                    <h4 className="text-[10px] font-medium mb-1">Repay anytime</h4>
                    <p className="text-[9px] text-gray-400">Get your skins back</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Connect wallet button */}
          <div className="flex justify-center my-3 max-w-md mx-auto">
            <Button
              className="bg-[#6366f1] hover:bg-[#5355d1] rounded-full flex items-center gap-1 text-xs py-1.5 px-3 shadow-sm transition-all w-full max-w-[200px]"
              onClick={()=>{if(!isAuthenticated){login()}else{logout()}}}
            >
              <RotateCcw className="h-3 w-3" />
              <span>{!isAuthenticated ? "Connect Account" : "Disconnect Account"}</span>
            </Button>
          </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  )
}
