"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Check, AlertCircle, ExternalLink, ArrowUpDown, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

function TradeProcessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile, getPrivyAccessToken } = useAuth()
  
  // Récupérer les paramètres de l'URL
  const tradeId = searchParams.get('tradeId')
  const tradeUrl = searchParams.get('tradeUrl')
  const amount = searchParams.get('amount')
  const skinName = searchParams.get('skinName')
  const skinImage = searchParams.get('skinImage')
  
  const [tradeStatus, setTradeStatus] = useState<'waiting' | 'active' | 'accepted' | 'declined' | 'canceled' | 'error' | 'in_escrow' | 'escrow_pending'>('waiting')
  const [pollingActive, setPollingActive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [escrowInfo, setEscrowInfo] = useState<{
    escrowDays?: number
    escrowEndDate?: string
    comment?: string
  } | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Save trade data to localStorage when we have it
  useEffect(() => {
    if (tradeId && tradeUrl && amount && skinName) {
      const tradeData = {
        tradeId,
        tradeUrl,
        amount,
        skinName,
        skinImage
      }
      localStorage.setItem('activeTradeData', JSON.stringify(tradeData))
    }
  }, [tradeId, tradeUrl, amount, skinName, skinImage])
  
  // Fonction pour vérifier le statut du trade
  const checkTradeStatus = async () => {
    if (!tradeId) return
    
    try {
      // Get access token for secure authentication
      const token = await getPrivyAccessToken()
      if (!token) {
        console.error("No access token available")
        return
      }

      // Utiliser l'endpoint de vérification des trades du backend
      const response = await fetch(`http://localhost:3333/api/trade/${tradeId}/status?refresh=true`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        console.error('Failed to fetch trade status:', response.status)
        return
      }
      
      const data = await response.json()
      console.log('Trade status response:', data)
      
      // Mapper les statuts du backend vers les statuts locaux
      // Les statuts Steam peuvent être: Active, Accepted, Declined, Canceled, Expired, InvalidItems
      // Backend normalizes to lowercase, so we need to handle both cases
      const rawStatus = data.trade?.status || data.status
      const steamStatus = rawStatus ? rawStatus.toLowerCase() : ''
      console.log('Steam status:', steamStatus, '(raw:', rawStatus, ')')
      
      if (steamStatus === 'accepted') {
        setTradeStatus('accepted')
        setPollingActive(false)
        // Clear localStorage when trade is accepted
        localStorage.removeItem('activeTradeData')
        console.log('Trade accepted - polling stopped')
      } else if (steamStatus === 'in_escrow') {
        setTradeStatus('in_escrow')
        setPollingActive(false) // Stop polling for escrow trades
        // Get escrow info
        if (data.trade) {
          setEscrowInfo({
            escrowDays: data.trade.escrowDays,
            escrowEndDate: data.trade.escrowEndDate,
            comment: data.trade.comment
          })
        }
      } else if (steamStatus === 'escrow_pending') {
        setTradeStatus('escrow_pending')
        setPollingActive(true) // Continue polling for escrow completion
        if (data.trade) {
          setEscrowInfo({
            escrowDays: data.trade.escrowDays,
            escrowEndDate: data.trade.escrowEndDate,
            comment: data.trade.comment
          })
        }
      } else if (steamStatus === 'declined') {
        setTradeStatus('declined')
        setPollingActive(false)
        localStorage.removeItem('activeTradeData')
        console.log('Trade declined - polling stopped')
      } else if (steamStatus === 'canceled' || steamStatus === 'expired') {
        setTradeStatus('canceled')
        setPollingActive(false)
        localStorage.removeItem('activeTradeData')
        console.log('Trade canceled/expired - polling stopped')
      } else if (steamStatus === 'active') {
        setTradeStatus('active')
        // Continue polling for active trades
      } else {
        // For any other status, keep polling
        console.log('Unknown status, continuing to poll:', steamStatus)
      }
    } catch (error) {
      console.error('Error checking trade status:', error)
      // Ne pas arrêter le polling en cas d'erreur réseau temporaire
    }
  }

  // Force refresh trade status
  const forceRefresh = async () => {
    if (!tradeId) return
    
    setIsRefreshing(true)
    try {
      // Get access token for secure authentication
      const token = await getPrivyAccessToken()
      if (!token) {
        console.error("No access token available")
        return
      }

      const response = await fetch(`http://localhost:3333/api/trade/${tradeId}/resync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Force refresh result:', data)
        
        // Update status based on resync result
        if (data.success && data.currentStatus) {
          const newStatus = data.currentStatus.toLowerCase()
          console.log('Updated status from resync:', newStatus)
          
          if (newStatus === 'accepted') {
            setTradeStatus('accepted')
            setPollingActive(false)
            localStorage.removeItem('activeTradeData')
          } else if (newStatus === 'in_escrow') {
            setTradeStatus('in_escrow')
            setPollingActive(false)
          } else if (['declined', 'canceled', 'expired'].includes(newStatus)) {
            setTradeStatus(newStatus === 'expired' ? 'canceled' : newStatus as any)
            setPollingActive(false)
            localStorage.removeItem('activeTradeData')
          }
        }
      }
      
      // Also run regular status check
      await checkTradeStatus()
    } catch (error) {
      console.error('Error force refreshing trade:', error)
      // Still try regular check as fallback
      await checkTradeStatus()
    } finally {
      setIsRefreshing(false)
    }
  }
  
  // Enhanced polling using force refresh every second
  useEffect(() => {
    if (!pollingActive || !tradeId) {
      console.log('Polling not active:', { pollingActive, tradeId })
      return
    }
    
    console.log('Starting enhanced force-refresh polling for trade:', tradeId)
    
    const enhancedStatusCheck = async () => {
      setIsRefreshing(true)
      try {
        // Get access token for secure authentication
        const token = await getPrivyAccessToken()
        if (!token) {
          console.error("No access token available")
          return
        }

        // Try force refresh first
        const response = await fetch(`http://localhost:3333/api/trade/${tradeId}/resync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Enhanced polling - resync result:', data)
          
          // Update status based on resync result
          if (data.success && data.currentStatus) {
            const newStatus = data.currentStatus.toLowerCase()
            console.log('Enhanced polling - updated status:', newStatus)
            
            if (newStatus === 'accepted') {
              setTradeStatus('accepted')
              setPollingActive(false)
              localStorage.removeItem('activeTradeData')
              return // Stop polling
            } else if (newStatus === 'in_escrow') {
              setTradeStatus('in_escrow')
              setPollingActive(false)
              return // Stop polling
            } else if (['declined', 'canceled', 'expired'].includes(newStatus)) {
              setTradeStatus(newStatus === 'expired' ? 'canceled' : newStatus as any)
              setPollingActive(false)
              localStorage.removeItem('activeTradeData')
              return // Stop polling
            }
          }
        }
      } catch (error) {
        console.error('Error in enhanced polling:', error)
      } finally {
        setIsRefreshing(false)
      }
    }

    // Initial check
    enhancedStatusCheck()
    
    // Set up polling interval
    const interval = setInterval(enhancedStatusCheck, 2000) // Poll every 2 seconds
    
    return () => clearInterval(interval)
  }, [pollingActive, tradeId, getPrivyAccessToken])

  // Initial load
  useEffect(() => {
    if (tradeId) {
      checkTradeStatus()
      setIsLoading(false)
    }
  }, [tradeId])

  // Ensure polling stops for final states
  useEffect(() => {
    const finalStates = ['accepted', 'declined', 'canceled', 'error']
    if (finalStates.includes(tradeStatus)) {
      console.log('Trade is in final state:', tradeStatus, '- ensuring polling is stopped')
      setPollingActive(false)
    }
  }, [tradeStatus])
  
  // Removed auto-open Steam trade page
  
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

  const handleGoToProfile = () => {
    router.push('/profile')
  }
  
  const handleOpenTrade = () => {
    if (tradeUrl) {
      window.open(tradeUrl, '_blank')
    }
  }

  // Handle escrow decision
  const handleEscrowDecision = async (decision: 'accept' | 'decline') => {
    if (!tradeId) return

    try {
      // Get access token for secure authentication
      const token = await getPrivyAccessToken()
      if (!token) {
        console.error("No access token available")
        return
      }

      const response = await fetch(`http://localhost:3333/api/trade/${tradeId}/escrow-decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ decision })
      })

      if (!response.ok) {
        throw new Error('Failed to process escrow decision')
      }

      const data = await response.json()
      
      if (data.success) {
        // Refresh the trade status
        await checkTradeStatus()
        
        if (decision === 'decline') {
          // If declined, go back to borrow page
          setTimeout(() => {
            router.push('/borrow')
          }, 2000)
        }
      } else {
        console.error('Escrow decision failed:', data.error)
      }
    } catch (error) {
      console.error('Error handling escrow decision:', error)
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
                {tradeStatus === 'accepted' ? 'Trade Completed!' : 'Trade in Progress'}
              </h1>
              <p className="text-[#a1a1c5]">
                {tradeStatus === 'accepted'
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
                {(tradeStatus === 'waiting' || tradeStatus === 'active') && (
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
                    
                    {/* Removed duplicate Open Trade Button */}
                  </div>
                )}
                
                {/* Success State */}
                {tradeStatus === 'accepted' && (
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

                {/* Escrow State - Awaiting User Decision */}
                {tradeStatus === 'in_escrow' && (
                  <div className="text-center space-y-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Trade in Steam Escrow</h3>
                        <p className="text-[#a1a1c5] text-sm max-w-md mb-4">
                          Your trade is in Steam escrow for {escrowInfo?.escrowDays || 15} days. 
                          This happens when Steam Mobile Authenticator is not enabled or hasn't been active long enough.
                        </p>
                        {escrowInfo?.escrowEndDate && (
                          <p className="text-[#a1a1c5] text-xs mb-4">
                            Items will be transferred on: {new Date(escrowInfo.escrowEndDate).toLocaleDateString()}
                          </p>
                        )}
                        <div className="bg-[#161e2e] border border-[#23263a] rounded-lg p-4 mb-4">
                          <h4 className="text-white font-medium mb-2">Your Options:</h4>
                          <ul className="text-[#a1a1c5] text-sm space-y-1 mb-4">
                            <li>• <strong>Accept:</strong> Wait {escrowInfo?.escrowDays || 15} days and get your loan when items transfer</li>
                            <li>• <strong>Decline:</strong> Cancel this trade and try again after enabling Steam Mobile Authenticator</li>
                          </ul>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                              variant="outline"
                              onClick={() => handleEscrowDecision('decline')}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              Decline Escrow
                            </Button>
                            <Button
                              onClick={() => handleEscrowDecision('accept')}
                              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                            >
                              Accept {escrowInfo?.escrowDays || 15}-Day Wait
                            </Button>
                          </div>
                        </div>
                        <a 
                          href="https://help.steampowered.com/en/faqs/view/2816-BE67-5B69-0FEC" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#6366f1] hover:text-[#7c3aed] text-sm"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Learn about Steam Mobile Authenticator
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Escrow Pending State - User Accepted */}
                {tradeStatus === 'escrow_pending' && (
                  <div className="text-center space-y-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Escrow Trade Accepted</h3>
                        <p className="text-[#a1a1c5] text-sm max-w-md mb-4">
                          You've accepted the escrow trade. Your USDC will be automatically sent when Steam transfers the items.
                        </p>
                        {escrowInfo?.escrowEndDate && (
                          <div className="bg-[#161e2e] border border-[#23263a] rounded-lg p-4">
                            <p className="text-white font-medium">Expected completion:</p>
                            <p className="text-[#a1a1c5] text-sm">
                              {new Date(escrowInfo.escrowEndDate).toLocaleDateString()} 
                              ({escrowInfo.escrowDays || 15} days remaining)
                            </p>
                          </div>
                        )}
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
                {(tradeStatus === 'waiting' || tradeStatus === 'active') && (
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
                    <Button
                      variant="outline"
                      onClick={handleGoToProfile}
                      className="border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee] hover:text-white"
                    >
                      Go to Profile
                    </Button>
                  </>
                )}
                
                {(tradeStatus === 'accepted' || tradeStatus === 'declined' || tradeStatus === 'canceled' || tradeStatus === 'error') && (
                  <>
                    <Button
                      onClick={handleReturnToBorrow}
                      className="bg-gradient-to-r from-[#6366f1] to-[#22d3ee] hover:from-[#4f46e5] hover:to-[#0ea5e9]"
                    >
                      Return to Borrow
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGoToProfile}
                      className="border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee] hover:text-white"
                    >
                      Go to Profile
                    </Button>
                  </>
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

export default function TradeProcessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col text-white">
        <main className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
          <p className="mt-4 text-[#a1a1c5]">Loading...</p>
        </main>
      </div>
    }>
      <TradeProcessContent />
    </Suspense>
  )
}