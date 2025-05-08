"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, Trophy, Wallet } from "lucide-react"
import Link from "next/link"
import { TransactionLoading } from "@/components/transaction-loading"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  loanAmount: number
  skinNames: string[]
  loanDuration: number
}

export function SuccessModal({ isOpen, onClose, loanAmount, skinNames, loanDuration }: SuccessModalProps) {
  const [points, setPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const targetPoints = Math.round(loanAmount / 10) // 1 point for every 10€

  useEffect(() => {
    if (isOpen && !isLoading) {
      const interval = setInterval(() => {
        setPoints((prev) => {
          if (prev < targetPoints) {
            return prev + 1
          }
          clearInterval(interval)
          return prev
        })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [isOpen, targetPoints, isLoading])

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  // Reset loading state when modal is reopened
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setPoints(0)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1E1E1E] border-[#5D5FEF] max-w-md">
        {isLoading ? (
          <TransactionLoading onComplete={handleLoadingComplete} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold">
                <span className="text-[#5D5FEF]">Congratulations!</span>
              </DialogTitle>
            </DialogHeader>

            <div className="py-6">
              <div className="w-20 h-20 rounded-full bg-[#5D5FEF]/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-[#5D5FEF]" />
              </div>

              <p className="text-center text-lg mb-6">
                Your loan has been <span className="font-bold text-[#5D5FEF]">approved</span>!
              </p>

              <div className="bg-[#2A2A2A] p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Amount received:</span>
                  <span className="font-bold">{loanAmount} $</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Collateral:</span>
                  <span>{skinNames.length} skins</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Duration:</span>
                  <span>{loanDuration} days</span>
                </div>
                {skinNames.length <= 3 && <div className="mt-1 text-sm text-gray-400">{skinNames.join(", ")}</div>}
                {skinNames.length > 3 && (
                  <div className="mt-1 text-sm text-gray-400">
                    {skinNames.slice(0, 2).join(", ")} and {skinNames.length - 2} others
                  </div>
                )}
              </div>

              <div className="bg-black/50 p-4 rounded-lg border border-[#5D5FEF] mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="text-[#5D5FEF]" />
                  <span className="font-bold">Huch points earned</span>
                </div>

                <div className="relative h-6 bg-[#2A2A2A] rounded-full overflow-hidden mb-2">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#5D5FEF] transition-all duration-1000 ease-out"
                    style={{ width: `${(points / targetPoints) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-sm">
                  <span>0</span>
                  <span className="font-bold text-[#5D5FEF]">+{points} points</span>
                  <span>{targetPoints}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/wallet">
                  <Button variant="outline" className="w-full border-[#5D5FEF] text-[#5D5FEF] hover:bg-[#5D5FEF]/20">
                    <Wallet className="mr-2" />
                    View my wallet
                  </Button>
                </Link>

                <Link href="/ranking">
                  <Button className="w-full bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white font-bold">
                    <Trophy className="mr-2" />
                    View my ranking
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
