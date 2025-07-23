"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

export function LiquidationControls() {
  const { profile, getPrivyAccessToken } = useAuth()
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckLiquidations = async () => {
    if (!profile?.id) {
      toast.error("Authentication required")
      return
    }

    // Get access token for secure authentication
    const token = await getPrivyAccessToken()
    if (!token) {
      toast.error("No access token available")
      return
    }

    setIsChecking(true)
    try {
      const response = await fetch("http://localhost:3333/solana/check-liquidations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
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

  if (!profile?.admin) {
    return null
  }

  return (
    <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 text-red-500" />
          Liquidation Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400 mb-4">
          Check for loans that need to be liquidated due to price drops or expiration.
        </p>
        <Button
          onClick={handleCheckLiquidations}
          disabled={isChecking}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking Liquidations...
            </>
          ) : (
            "Check Liquidations"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}