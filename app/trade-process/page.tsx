"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Check, AlertCircle, ExternalLink } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function TradeProcessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile } = useAuth()
  
  // Récupérer les paramètres de l'URL
  const tradeId = searchParams.get('tradeId')
  const tradeUrl = searchParams.get('tradeUrl')
  const amount = searchParams.get('amount')
  const skinName = searchParams.get('skinName')
  const skinImage = searchParams.get('skinImage')
  
  const [tradeStatus, setTradeStatus] = useState<'waiting' | 'active' | 'accepted' | 'declined' | 'canceled' | 'error'>('waiting')
  const [tokensReceived, setTokensReceived] = useState(false)
  const [pollingActive, setPollingActive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  
  // Fonction pour vérifier le statut du trade
  const checkTradeStatus = async () => {
    if (!tradeId) return
    
    try {
      const response = await fetch(`http://localhost:3333/solana/trade-status/${tradeId}`)
      const data = await response.json()
      
      if (data.status === 'active') {
        setTokensReceived(true)
        setTradeStatus('accepted')
        setPollingActive(false)
      } else if (data.status === 'pending') {
        // Trade toujours en attente
        setTradeStatus('active')
      } else {
        // Trade décliné, annulé, etc.
        setTradeStatus(data.status || 'error')
        setPollingActive(false)
      }
    } catch (error) {
      console.error('Error checking trade status:', error)
    }
  }
  
  // Polling pour vérifier le statut du trade
  useEffect(() => {
    if (!pollingActive || !tradeId) return
    
    const interval = setInterval(checkTradeStatus, 3000) // Vérifier toutes les 3 secondes
    
    return () => clearInterval(interval)
  }, [pollingActive, tradeId])
  
  // Vérifier immédiatement au chargement
  useEffect(() => {
    if (tradeId) {
      checkTradeStatus()
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [tradeId])
  
  // Auto-open Steam trade page on mount
  useEffect(() => {
    if (tradeUrl && tradeId) {
      // Small delay to ensure the page has loaded
      const timer = setTimeout(() => {
        window.open(tradeUrl, '_blank')
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [tradeUrl, tradeId])
  
  // Si pas de paramètres nécessaires, rediriger (avec délai pour éviter le clignotement)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!tradeId || !tradeUrl) {
        console.log('Missing trade parameters, redirecting to borrow page')
        router.push('/borrow')
      }
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [tradeId, tradeUrl, router])
  
  const handleReturnToBorrow = () => {
    router.push('/borrow')
  }
  
  const handleOpenTrade = () => {
    if (tradeUrl) {
      window.open(tradeUrl, '_blank')
    }
  }
  
  // Affichage de chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col text-white">
        <main className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
          <p className="mt-4 text-[#a1a1c5]">Loading trade details...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <main className="flex-1 flex flex-col items-center justify-center pt-20 lg:pt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#E1E1F5] mb-3 font-poppins">
                {tradeStatus === 'accepted' && tokensReceived ? 'Trade Completed!' : 'Trade in Progress'}
              </h1>
              <p className="text-[#a1a1c5]">
                {tradeStatus === 'accepted' && tokensReceived 
                  ? 'Your tokens have been sent to your wallet'
                  : 'Please accept the Steam trade to receive your USDC'
                }
              </p>
            </div>
            
            {/* Main Card */}
            <Card className="bg-[#0F0F2A] border-[#FFFFFF] bg-opacity-70 border-opacity-10 shadow-md p-6">
              {/* Trade Details */}
              <div className="mb-6">
                <div className="flex items-center gap-4 p-4 bg-[#161e2e] rounded-lg border border-[#23263a]">
                  {skinImage && (
                    <div className="relative w-16 h-16 overflow-hidden rounded-md flex-shrink-0 bg-[#23263a]">
                      <Image
                        src={skinImage}
                        alt={skinName || 'Skin'}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{skinName}</h3>
                    <p className="text-[#a1a1c5] text-sm">
                      Loan Amount: <span className="text-white font-medium">${amount} USDC</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Status Section */}
              <div className="mb-6">
                {/* Waiting/Active State */}
                {(tradeStatus === 'waiting' || tradeStatus === 'active') && !tokensReceived && (
                  <div className="text-center space-y-4">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-12 w-12 animate-spin text-[#6366f1]" />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Waiting for Trade Acceptance</h3>
                        <p className="text-[#a1a1c5] text-sm max-w-md">
                          Please accept the Steam trade offer. Your USDC will be automatically sent to your wallet once the trade is confirmed.
                        </p>
                      </div>
                    </div>
                    
                    {/* Open Trade Button */}
                    <Button
                      onClick={handleOpenTrade}
                      className="bg-[#6366f1] hover:bg-[#5355d1] text-white font-medium flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Steam Trade
                    </Button>
                  </div>
                )}
                
                {/* Success State */}
                {tradeStatus === 'accepted' && tokensReceived && (
                  <div className="text-center space-y-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="h-8 w-8 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Trade Completed Successfully!</h3>
                        <p className="text-[#a1a1c5] text-sm max-w-md">
                          Your ${amount} USDC has been sent to your wallet. You can now use these funds.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Error States */}
                {(tradeStatus === 'declined' || tradeStatus === 'canceled' || tradeStatus === 'error') && (
                  <div className="text-center space-y-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {tradeStatus === 'declined' ? 'Trade Declined' :
                           tradeStatus === 'canceled' ? 'Trade Canceled' :
                           'Trade Error'}
                        </h3>
                        <p className="text-[#a1a1c5] text-sm max-w-md">
                          {tradeStatus === 'declined' 
                            ? 'The trade was declined. No tokens were sent.'
                            : tradeStatus === 'canceled'
                            ? 'The trade was canceled. No tokens were sent.'
                            : 'There was an error with the trade. Please try again.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {(tradeStatus === 'waiting' || tradeStatus === 'active') && !tokensReceived && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleReturnToBorrow}
                      className="border-[#2a3548] text-gray-400 hover:bg-[#1f2937] hover:text-white"
                    >
                      Return to Borrow
                    </Button>
                    <Button
                      onClick={handleOpenTrade}
                      className="bg-gradient-to-r from-[#6366f1] to-[#22d3ee] hover:from-[#4f46e5] hover:to-[#0ea5e9]"
                    >
                      Open Steam Trade
                    </Button>
                  </>
                )}
                
                {((tradeStatus === 'accepted' && tokensReceived) || tradeStatus === 'declined' || tradeStatus === 'canceled' || tradeStatus === 'error') && (
                  <Button
                    onClick={handleReturnToBorrow}
                    className="bg-gradient-to-r from-[#6366f1] to-[#22d3ee] hover:from-[#4f46e5] hover:to-[#0ea5e9]"
                  >
                    Return to Borrow
                  </Button>
                )}
              </div>
            </Card>
            
            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-[#a1a1c5]">
                Trade ID: {tradeId}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}