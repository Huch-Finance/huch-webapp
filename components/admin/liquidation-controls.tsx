"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

export function LiquidationControls() {
  const { profile } = useAuth()
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckLiquidations = async () => {
    if (!profile?.id) {
      toast.error("Authentication required")
      return
    }

    setIsChecking(true)
    try {
      const response = await fetch("http://localhost:3333/solana/check-liquidations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Privy-Id": profile.id
        }
      })

      if (response.ok) {
        toast.success("Liquidation check started. Check server logs for results.")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to start liquidation check")
      }
    } catch (error) {
      toast.error("Network error when checking liquidations")
      console.error("Error:", error)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Card className="relative bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-5 opacity-[.05]"
        style={{
          backgroundImage: "url('/grainbg.avif')",
          backgroundRepeat: "repeat",
        }}
      />
      
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle size={20} />
          Liquidation Management
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <h3 className="text-red-400 font-semibold mb-2">Liquidation System</h3>
          <p className="text-sm text-gray-400 mb-4">
            Automatically checks for overdue loans and liquidates them according to smart contract rules. 
            Loans are liquidated when their duration expires and they haven't been repaid.
          </p>
          <Button
            onClick={handleCheckLiquidations}
            disabled={isChecking}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Check All Loans for Liquidation
              </>
            )}
          </Button>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>⚠️ This will check all active loans and liquidate any that are overdue.</p>
          <p>The process runs automatically every hour when enabled.</p>
        </div>
      </CardContent>
    </Card>
  )
}