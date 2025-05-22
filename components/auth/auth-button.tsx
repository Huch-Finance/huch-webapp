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
import { useAuth } from "@/hooks/use-auth"

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

  const { profile } = useAuth()

  if (!isPrivyConfigured) {
    return (
      <Button
        onClick={() =>
          alert("Authentication is not configured. Please add NEXT_PUBLIC_PRIVY_APP_ID to your environment variables.")
        }
        className="bg-gradient-to-br from-gray-100 to-gray-300 text-black font-semibold rounded-full px-4 py-2 sm:px-3 text-xs sm:text-sm shadow-md hover:from-gray-200 hover:to-gray-400 transition-all duration-200"
      >
        Connect
      </Button>
    )
  }

  // If Privy is loading, display a loading state
  if (!privyReady) {
    return (
      <Button disabled className="bg-[#2A2A2A] text-gray-400 rounded-full px-4 py-2 sm:px-3 text-xs sm:text-sm">
        Loading...
      </Button>
    )
  }

  // If the user is not authenticated, display the connect button
  if (!authenticated) {
    return (
      <Button
        onClick={login}
        className="bg-gradient-to-br from-gray-100 to-gray-300 text-black font-semibold rounded-full px-4 py-2 sm:px-3 text-xs sm:text-sm shadow-md hover:from-gray-200 hover:to-gray-400 transition-all duration-200"
      >
        Connect
      </Button>
    )
  }

  // Get user information
  const username = profile?.username || "User"
  const displayName = profile?.username
  const profilePicture = profile?.avatar || "/avatars/logo-black.svg" // Default avatar if no profile picture

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
        <div className="relative group w-full sm:w-auto">
          <div className="absolute inset-0 -m-2 rounded-full
            hidden sm:block
            bg-gray-100
            opacity-40 filter blur-lg pointer-events-none
            transition-all duration-300 ease-out
            group-hover:opacity-60 group-hover:blur-xl group-hover:-m-3"></div>
          <Button
            variant="outline"
            className="relative z-10 border-none bg-gradient-to-br from-gray-100 to-gray-300 text-black font-semibold rounded-full px-4 py-2 sm:px-3 text-xs sm:text-sm flex items-center shadow-md hover:from-gray-200 hover:to-gray-400 transition-all duration-200"
          >
            <img
              src={profilePicture}
              alt="Profile"
              className="w-6 h-6 rounded-full mr-2"
            />
            <span>{displayName}</span>
            <ChevronDown size={16} className="ml-2" />
          </Button>
        </div>
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
