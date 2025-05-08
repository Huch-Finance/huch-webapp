"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Bell, ChevronDown, Filter, RotateCcw, Search, Settings, ArrowRight, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Home() {
  const [activeTab, setActiveTab] = useState("borrow")
  const [currency, setCurrency] = useState("USDC")

  const liveTransactions = [
    { username: "alex_cs", amount: "$250", skin: "AWP | Dragon Lore" },
    { username: "knife_master", amount: "$120", skin: "Butterfly Knife | Fade" },
    { username: "pro_gamer", amount: "$85", skin: "AK-47 | Fire Serpent" },
    { username: "headshot_queen", amount: "$190", skin: "M4A4 | Howl" },
    { username: "trader_joe", amount: "$65", skin: "USP-S | Kill Confirmed" },
  ]

  const [currentTransaction, setCurrentTransaction] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTransaction((prev) => (prev + 1) % liveTransactions.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-[#0a0c14] text-white relative overflow-hidden">
      {/* Background with floating elements */}
      <div className="absolute inset-0 overflow-hidden">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">CS2 Skins</h2>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="rounded-full bg-[#1f2937] hover:bg-[#1f2937]/80">
                Lend
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Collateralize section */}
          <div className="bg-[#111827]/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 mb-3">
            <h3 className="text-sm text-gray-400 mb-3">You collateralize</h3>

            <div className="flex flex-col items-center justify-center py-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">No CS2 skins found</span>
                <span className="text-lg">😢</span>
              </div>
              <Button className="bg-[#6366f1] hover:bg-[#6366f1]/90 rounded-full text-sm py-1.5">
                Browse CS2 Skins
              </Button>
            </div>
          </div>

          {/* Divider with arrow */}
          <div className="flex justify-center -my-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-[#1f2937] border border-gray-700 flex items-center justify-center">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Borrow section */}
          <div className="bg-[#111827]/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 mb-3">
            <h3 className="text-sm text-gray-400 mb-3">You borrow</h3>

            <div className="flex justify-end mb-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#1f2937] border-gray-700 rounded-full flex items-center gap-2 h-8 px-3"
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">{currency}</span>
                    </div>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1f2937] border-gray-700">
                  <DropdownMenuItem onClick={() => setCurrency("USDC")}>USDC</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrency("ETH")}>ETH</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrency("BTC")}>BTC</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col items-center justify-center py-3">
              <p className="text-gray-400 mb-3 text-sm">Connect your wallet and deposit CS2 skins to borrow</p>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 rounded-full flex items-center gap-2 text-sm py-1.5"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Connect Wallet</span>
              </Button>
            </div>
          </div>

          {/* Buy skins button */}
          <div className="bg-[#111827]/50 backdrop-blur-sm rounded-xl p-3 border border-gray-800 flex justify-center">
            <Button
              size="sm"
              className="bg-[#1f2937] hover:bg-[#1f2937]/80 border border-gray-700 rounded-full w-full text-sm py-1.5"
            >
              Buy CS2 Skins
            </Button>
          </div>
        </div>
      </div>  
    </main>
  )
}
