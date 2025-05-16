import type React from "react"

interface CyberpunkContainerProps {
  children: React.ReactNode
  className?: string
}

export function CyberpunkContainer({ children, className = "" }: CyberpunkContainerProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-0.5 bg-[#5D5FEF]/20 rounded-lg blur opacity-30"></div>
      <div className="relative bg-[#1E1E1E] rounded-lg border border-[#5D5FEF]/30 p-4">{children}</div>
    </div>
  )
}
