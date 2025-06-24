"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoanExpirationInfoProps {
  borrowId: string
  privyId?: string
  className?: string
}

interface ExpirationData {
  borrowId: string
  startTime: string
  endTime: string
  duration: number
  remainingDays: number
  remainingHours: number
  isOverdue: boolean
  status: {
    active?: boolean
    repaid?: boolean
    liquidated?: boolean
  }
}

export function LoanExpirationInfo({ borrowId, privyId, className }: LoanExpirationInfoProps) {
  const [expirationData, setExpirationData] = useState<ExpirationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!borrowId || !privyId) return

    const fetchExpirationData = async () => {
      try {
        const response = await fetch(`http://localhost:3333/solana/loan-expiration/${borrowId}`, {
          headers: {
            'X-Privy-Id': privyId
          }
        })

        if (response.ok) {
          const data = await response.json()
          setExpirationData(data.expiration)
        }
      } catch (error) {
        console.error('Error fetching expiration data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpirationData()
  }, [borrowId, privyId])

  if (loading || !expirationData) {
    return null
  }

  const getStatusColor = () => {
    if (expirationData.status.liquidated) return "text-red-500"
    if (expirationData.status.repaid) return "text-green-500"
    if (expirationData.isOverdue) return "text-red-500"
    if (expirationData.remainingDays <= 3) return "text-yellow-500"
    return "text-cyan-400"
  }

  const getStatusIcon = () => {
    if (expirationData.status.liquidated) return <XCircle className="w-4 h-4" />
    if (expirationData.status.repaid) return <CheckCircle className="w-4 h-4" />
    if (expirationData.isOverdue) return <AlertTriangle className="w-4 h-4" />
    return <Clock className="w-4 h-4" />
  }

  const getStatusText = () => {
    if (expirationData.status.liquidated) return "Liquidated"
    if (expirationData.status.repaid) return "Repaid"
    if (expirationData.isOverdue) return "Overdue"
    if (expirationData.remainingDays === 0) {
      return `${expirationData.remainingHours}h left`
    }
    return `${expirationData.remainingDays}d left`
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant="outline" 
        className={cn("flex items-center gap-1 border-cyan-400/20", getStatusColor())}
      >
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </Badge>
    </div>
  )
}