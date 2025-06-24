"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ArrowUpDown } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function ActiveTradeIndicator() {
  const router = useRouter()
  const pathname = usePathname()
  const { profile } = useAuth()
  const [hasActiveTrade, setHasActiveTrade] = useState(false)
  const [tradeData, setTradeData] = useState<{
    tradeId?: string
    tradeUrl?: string
    amount?: string
    skinName?: string
    skinImage?: string
  } | null>(null)

  // Check if there's an active trade
  useEffect(() => {
    const checkActiveTrade = async () => {
      if (!profile?.id) return

      try {
        // Check localStorage for active trade data
        const storedTradeData = localStorage.getItem('activeTradeData')
        if (storedTradeData) {
          const parsedData = JSON.parse(storedTradeData)
          setTradeData(parsedData)
          
          // Verify the trade is still active by checking its status
          if (parsedData.tradeId) {
            const response = await fetch(`http://localhost:3333/api/trade/${parsedData.tradeId}/status`, {
              headers: {
                'Content-Type': 'application/json',
                'X-Privy-Id': profile.id
              }
            })
            
            if (response.ok) {
              const data = await response.json()
              const rawStatus = data.trade?.status || data.status
              // Backend normalizes to lowercase, so we need to handle that
              const status = rawStatus ? rawStatus.toLowerCase() : ''
              
              // Check if trade is still active (only show for pending trades)
              if (status === 'active' || status === 'sent' || status === 'pending' || status === 'created') {
                setHasActiveTrade(true)
              } else {
                // Trade is accepted, declined, canceled, expired, in_escrow, escrow_pending, etc - remove indicator
                localStorage.removeItem('activeTradeData')
                setHasActiveTrade(false)
                setTradeData(null)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking active trade:', error)
      }
    }

    // Check immediately and then every 5 seconds
    checkActiveTrade()
    const interval = setInterval(checkActiveTrade, 5000)

    return () => clearInterval(interval)
  }, [profile?.id])

  // Don't show on trade-process page
  if (pathname === '/trade-process' || !hasActiveTrade || !tradeData) {
    return null
  }

  const handleClick = () => {
    if (tradeData) {
      const params = new URLSearchParams({
        tradeId: tradeData.tradeId || '',
        tradeUrl: tradeData.tradeUrl || '',
        amount: tradeData.amount || '',
        skinName: tradeData.skinName || '',
        skinImage: tradeData.skinImage || ''
      })
      router.push(`/trade-process?${params.toString()}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 left-4 z-50 flex items-center justify-center w-14 h-14 bg-slate-900 bg-opacity-70 backdrop-blur-sm border border-white border-opacity-10 rounded-xl text-white hover:bg-opacity-90 transition-all duration-200 group"
    >
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[.05] rounded-xl"
        style={{
          backgroundImage: "url('/grainbg.avif')",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="relative z-20">
        <ArrowUpDown className="w-7 h-7 text-[#6366f1] animate-pulse group-hover:animate-none" />
      </div>
      
      {/* Tooltip */}
      <div className="absolute left-full ml-2 px-3 py-1 bg-slate-900 bg-opacity-90 border border-white border-opacity-10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        <span className="text-sm">Trade in progress</span>
      </div>
    </button>
  )
}