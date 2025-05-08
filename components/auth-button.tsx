"use client"

import { useState, useEffect } from "react"
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Wallet, Settings, ChevronDown } from "lucide-react"
import Link from "next/link"
import { isPrivyConfigured } from "@/lib/privy"

interface UserMetadata {
  username?: string;
}

export function AuthButton() {
  // If Privy is not configured, display a dummy connect button
  const [privyReady, setPrivyReady] = useState(false)
  const { login, logout, authenticated, user, ready } = usePrivy()
  const { wallets } = useSolanaWallets()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    setPrivyReady(ready)
  }, [ready])

  if (!isPrivyConfigured) {
    return (
      <Button
        onClick={() =>
          alert("Authentication is not configured. Please add NEXT_PUBLIC_PRIVY_APP_ID to your environment variables.")
        }
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        Connect
      </Button>
    )
  }

  // If Privy is loading, display a loading state
  if (!privyReady) {
    return (
      <Button disabled className="bg-[#2A2A2A] text-gray-400">
        Loading...
      </Button>
    )
  }

  // If the user is not authenticated, display the connect button
  if (!authenticated) {
    return (
      <Button onClick={login} className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white">
        Connect
      </Button>
    )
  }

  // Get user information
  const username = user?.email?.address?.split('@')[0] || "User"
  const displayName = username
  const shortAddress = wallets?.[0]?.address
    ? `${wallets[0].address.substring(0, 6)}...${wallets[0].address.substring(
        wallets[0].address.length - 4,
        wallets[0].address.length,
      )}`
    : null

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      // Clean up local data if needed
      localStorage.removeItem("steamID")
      window.location.href = "/"
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Display dropdown menu for authenticated user
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-[#5D5FEF] text-white hover:bg-[#5D5FEF]/20">
          <span className="mr-2">{displayName}</span>
          {shortAddress && <span className="text-xs text-gray-400 mr-2">{shortAddress}</span>}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#1a1a1f] border-[#2A2A2A]">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#2A2A2A]" />
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer hover:bg-[#2A2A2A]">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer hover:bg-[#2A2A2A]">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator className="bg-[#2A2A2A]" />
        <DropdownMenuItem
          className="cursor-pointer hover:bg-[#2A2A2A] text-red-400"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
