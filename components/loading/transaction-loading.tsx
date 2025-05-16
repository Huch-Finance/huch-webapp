"use client"

import { useState, useEffect } from "react"
import { Wallet } from "lucide-react"

interface TransactionLoadingProps {
  onComplete: () => void
}

// Loading animation for the transaction
export function TransactionLoading({ onComplete }: TransactionLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [isStuck, setIsStuck] = useState(false)
  const [statusText, setStatusText] = useState("Initializing transaction...")

  useEffect(() => {
    const timer1 = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 45) {
            return prev + 1
          }
          clearInterval(interval)
          return prev
        })
      }, 20)

      return () => clearInterval(interval)
    }, 300)

    const timer2 = setTimeout(() => {
      setIsStuck(true)
      setStatusText("Verifying collateral...")
    }, 1500)

    const timer3 = setTimeout(() => {
      setIsStuck(false)
      setStatusText("Processing loan...")
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 100) {
            return prev + 1
          }
          clearInterval(interval)
          setStatusText("Transaction complete!")
          return 100
        })
      }, 15)

      return () => clearInterval(interval)
    }, 3500)

    const timer4 = setTimeout(() => {
      onComplete()
    }, 5000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      <div className="relative">
        <div
          className={`w-20 h-20 border-4 border-t-[#5D5FEF] border-r-[#5D5FEF]/40 border-b-[#5D5FEF]/20 border-l-[#5D5FEF]/60 rounded-full ${isStuck ? "animate-pulse" : "animate-spin"}`}
          style={{ animationDuration: isStuck ? "1s" : "2s" }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-[#5D5FEF] font-bold">{progress}%</div>
        <div
          className="absolute -inset-2 rounded-full bg-[#5D5FEF]/10 animate-pulse"
          style={{ animationDuration: "3s" }}
        ></div>
      </div>

      <div className="w-full max-w-md space-y-3">
        <div className="text-center mb-2">
          <span className={`text-sm font-medium ${isStuck ? "text-yellow-400 animate-pulse" : "text-white"}`}>
            {statusText}
          </span>
        </div>

        <div className="relative h-3 w-full bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full bg-[#5D5FEF] transition-all ${isStuck ? "animate-pulse" : ""}`}
            style={{ width: `${progress}%`, transitionDuration: isStuck ? "0s" : "0.3s" }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-400 text-sm animate-pulse" style={{ animationDuration: "3s" }}>
        <Wallet size={16} />
        <p>Preparing your funds...</p>
      </div>
    </div>
  )
}
