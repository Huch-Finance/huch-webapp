"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Trophy, Home } from "lucide-react"
import { AuthButton } from "@/components/auth/auth-button"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { profile, isAuthenticated } = useAuth()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f13]/80 backdrop-blur-md border-b border-[#2A2A2A]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="Huch" width={40} height={40} />
            <span className="text-xl font-bold ml-2">Huch.</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {profile?.admin && (
              <Link href="/admin" className="text-gray-300 hover:text-[#5D5FEF] transition-colors">
                Admin
              </Link>
            )}
            <Link href="/borrow" className="text-gray-300 hover:text-[#5D5FEF] transition-colors">
              Borrow
            </Link>
            <Link href="/ranking" className="text-gray-300 hover:text-[#5D5FEF] transition-colors">
              Ranking
            </Link>
            {/* Dropdown menu */}
            <AuthButton />
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-gray-300">
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0f0f13] border-b border-[#2A2A2A] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {profile?.admin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-gray-300 hover:text-[#5D5FEF] py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home size={18} />
                Admin
              </Link>
            )}
            <Link
              href="/borrow"
              className="flex items-center gap-2 text-gray-300 hover:text-[#5D5FEF] py-2 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Trophy size={18} />
              Borrow
            </Link>
            <Link
              href="/ranking"
              className="flex items-center gap-2 text-gray-300 hover:text-[#5D5FEF] py-2 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Trophy size={18} />
              Ranking
            </Link>
            {/* Dropdown menu */}
            <div className="pt-2">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
