"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { usePrivy } from "@privy-io/react-auth"
import { CyberpunkContainer } from "@/components/layout/cyberpunk-container"

interface AuthRequiredProps {
  children: ReactNode
  title?: string
  description?: string
}

export function AuthRequired({
  children,
  title = "Connect your account",
  description = "You need to connect your account to access this feature. Connect your wallet or sign in to continue.",
}: AuthRequiredProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const { login } = usePrivy()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-appear">
        <div className="w-12 h-12 border-4 border-t-[#5D5FEF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <CyberpunkContainer className="max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center py-12 animate-appear">
          <div className="w-20 h-20 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-6">
            <Wallet size={32} className="text-[#5D5FEF]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            <span className="text-[#5D5FEF]">{title}</span>
          </h2>
          <p className="text-gray-400 text-center max-w-md mb-8">{description}</p>
          <Button onClick={login} className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white px-6 py-6 h-auto text-lg">
            <Wallet className="mr-2" />
            Connect Account
          </Button>
        </div>
      </CyberpunkContainer>
    )
  }

  return <>{children}</>
}
