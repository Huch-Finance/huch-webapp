"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, AlertTriangleIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Loan {
  id: string
  borrowId: string
  amount: number
  interestRate?: number
  totalToRepay?: number
  remainingAmount?: number
  totalRepaid?: number
  status: string
  createdAt: string
  isExpired?: boolean
  daysRemaining?: number
  hoursRemaining?: number
  trade?: {
    items?: Array<{
      marketHashName: string
      iconUrl: string
    }>
  }
  tradeStatus?: string
}

interface LoanSummaryProps {
  loans: Loan[]
  onRepayClick: (loan: Loan) => void
  getStatusColor: (loan: Loan) => string
  getTimeColor: (loan: Loan) => string
  formatTimeRemaining: (loan: Loan) => string
}

export function LoanSummary({ 
  loans, 
  onRepayClick, 
  getStatusColor, 
  getTimeColor, 
  formatTimeRemaining 
}: LoanSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Calculate summary stats
  const activeLoans = loans.filter(loan => 
    loan.status === 'active' && !(loan.remainingAmount !== undefined && loan.remainingAmount <= 0.01)
  )
  
  const totalBorrowed = loans.reduce((sum, loan) => sum + loan.amount, 0)
  const totalRemaining = loans.reduce((sum, loan) => sum + (loan.remainingAmount || 0), 0)
  const totalRepaid = loans.reduce((sum, loan) => sum + (loan.totalRepaid || 0), 0)
  
  const hasOverdue = activeLoans.some(loan => loan.isExpired)
  const nearExpiry = activeLoans.filter(loan => !loan.isExpired && loan.daysRemaining !== undefined && loan.daysRemaining <= 3)
  
  if (loans.length === 0) return null
  
  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="group relative overflow-hidden backdrop-blur-md border bg-gradient-to-br from-blue-950/20 via-blue-900/10 to-purple-900/10 border-blue-400/20 hover:border-blue-400/30 transition-all duration-300">
        <CardContent className="relative p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Summary Stats */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-poppins">
                  Active Loans Summary
                </h3>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400 font-poppins">Total Borrowed</div>
                  <div className="text-xl font-semibold text-white font-poppins">
                    ${totalBorrowed.toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 font-poppins">Remaining</div>
                  <div className={cn(
                    "text-xl font-semibold font-poppins",
                    totalRemaining > 0 ? "text-red-300" : "text-green-300"
                  )}>
                    ${totalRemaining.toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 font-poppins">Total Repaid</div>
                  <div className="text-xl font-semibold text-green-300 font-poppins">
                    ${totalRepaid.toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 font-poppins">Active Loans</div>
                  <div className="text-xl font-semibold text-cyan-300 font-poppins">
                    {activeLoans.length}
                  </div>
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex flex-wrap gap-2">
                {hasOverdue && (
                  <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-900/30 text-red-400 border border-red-500/30 flex items-center gap-1.5 shadow-lg font-poppins">
                    <AlertTriangleIcon size={12} className="animate-pulse" />
                    {activeLoans.filter(loan => loan.isExpired).length} Overdue
                  </div>
                )}
                {nearExpiry.length > 0 && (
                  <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-500/30 flex items-center gap-1.5 shadow-lg font-poppins">
                    <Clock size={12} />
                    {nearExpiry.length} Expiring Soon
                  </div>
                )}
              </div>
            </div>
            
            {/* Toggle Button */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-white border border-gray-600/30 hover:border-gray-500/50 px-6"
              >
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                <span className="ml-2">
                  {isExpanded ? 'Hide' : 'Show'} Details
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Individual Loans (Expanded View) */}
      {isExpanded && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          {loans.map((loan) => (
            <Card 
              key={loan.id} 
              className={`group relative overflow-hidden backdrop-blur-md border transition-all duration-300 hover:scale-[1.01] ${
                loan.tradeStatus === 'in_escrow' || loan.tradeStatus === 'escrow_pending'
                  ? 'bg-orange-900/10 border-orange-500/30 hover:border-orange-500/40'
                  : 'bg-blue-950/15 hover:bg-blue-950/20 border-blue-400/20 hover:border-blue-400/30'
              }`}
            >
              <CardContent className="relative p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {loan.trade?.items?.[0] && (
                      <img 
                        src={loan.trade.items[0].iconUrl} 
                        alt={loan.trade.items[0].marketHashName}
                        className="w-12 h-12 object-contain rounded-lg border border-white/10 bg-black/20"
                      />
                    )}
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-poppins">
                          ${loan.amount.toFixed(2)} USDC
                        </span>
                        {loan.interestRate !== undefined && (
                          <span className="text-xs text-amber-300 font-medium font-poppins">
                            {loan.interestRate}% APR
                          </span>
                        )}
                      </div>
                      {loan.remainingAmount !== undefined && (
                        <div className="text-sm text-gray-400 font-poppins">
                          Remaining: <span className={cn(
                            "font-semibold",
                            loan.remainingAmount > 0 ? "text-red-300" : "text-green-300"
                          )}>
                            ${loan.remainingAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {loan.trade?.items?.[0] && (
                        <div className="text-sm text-gray-300 truncate font-poppins">
                          {loan.trade.items[0].marketHashName}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border backdrop-blur-sm font-poppins ${getStatusColor(loan)} shadow-lg`}>
                        {loan.status === 'fully_repaid' || loan.status === 'repaid' ? 'REPAID' :
                         loan.remainingAmount !== undefined && loan.remainingAmount <= 0.01 ? '100% PAID' :
                         loan.isExpired && loan.status === 'active' ? 'EXPIRED' : 
                         loan.status.toUpperCase()}
                      </div>
                      {loan.status === 'active' && !(loan.remainingAmount !== undefined && loan.remainingAmount <= 0.01) && (
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium font-poppins ${getTimeColor(loan)} bg-gray-900/50 backdrop-blur-sm border border-gray-600/30 flex items-center gap-1.5 shadow-lg`}>
                          {loan.isExpired ? (
                            <AlertTriangleIcon size={12} className="animate-pulse" />
                          ) : loan.daysRemaining !== undefined && loan.daysRemaining <= 1 ? (
                            <AlertTriangleIcon size={12} className="animate-pulse" />
                          ) : (
                            <Clock size={12} />
                          )}
                          {formatTimeRemaining(loan)}
                        </div>
                      )}
                    </div>
                    
                    {loan.status === 'active' && loan.remainingAmount && loan.remainingAmount > 0.01 && (
                      <Button
                        size="sm"
                        className={cn(
                          "relative font-medium px-4 py-2 rounded-lg border shadow-lg backdrop-blur-md transition-all duration-300 font-poppins",
                          loan.isExpired
                            ? "bg-gray-700/50 text-gray-400 border-gray-600/50 cursor-not-allowed opacity-50"
                            : "bg-white/10 hover:bg-white/15 text-white border-white/20 hover:border-white/30 hover:shadow-xl hover:scale-105"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!loan.isExpired) {
                            onRepayClick(loan);
                          }
                        }}
                        disabled={loan.isExpired}
                        title={loan.isExpired ? "Cannot repay expired loans" : undefined}
                      >
                        Repay
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}