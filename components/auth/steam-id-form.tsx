"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Info, Copy, Check, HelpCircle } from "lucide-react"
import Link from "next/link"

interface SteamIDFormProps {
  onSubmit: (steamID: string) => void
}

export function SteamIDForm({ onSubmit }: SteamIDFormProps) {
  const [steamID, setSteamID] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [copied, setCopied] = useState(false)

  //validate steamID
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!steamID) {
      setError("Please enter your SteamID")
      return
    }
    const steamIDRegex = /^STEAM_[0-5]:[01]:\d+$|^\d{17}$/
    if (!steamIDRegex.test(steamID)) {
      setError("Invalid SteamID format. Please check your input.")
      return
    }
    setError(null)
    onSubmit(steamID)
  }

  const copyExampleID = () => {
    navigator.clipboard.writeText("STEAM_0:1:12345678")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-[#2A2A2A] mb-8 bg-[#1E1E1E]">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Connect your <span className="text-[#5D5FEF]">Steam account</span>
        </CardTitle>
        <CardDescription>Enter your SteamID to access your CS2 inventory and start borrowing.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="steamID" className="text-sm font-medium">
                SteamID
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-[#5D5FEF]"
                onClick={() => setShowHelp(!showHelp)}
              >
                <HelpCircle size={16} className="mr-1" />
                How to find?
              </Button>
            </div>
            <Input
              id="steamID"
              placeholder="STEAM_0:1:12345678 or 76561198012345678"
              value={steamID}
              onChange={(e) => setSteamID(e.target.value)}
              className="bg-[#2A2A2A] border-[#2A2A2A]"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showHelp && (
            <div className="bg-[#2A2A2A]/50 p-4 rounded-lg space-y-3 text-sm animate-appear">
              <h3 className="font-medium">How to find your SteamID</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Log in to your Steam account</li>
                <li>
                  Go to your <span className="text-[#5D5FEF]">Profile</span>
                </li>
                <li>
                  Click on <span className="text-[#5D5FEF]">Account Details</span>
                </li>
                <li>
                  Your SteamID is in the <span className="text-[#5D5FEF]">Account Information</span> section
                </li>
              </ol>

              <div className="flex items-center justify-between bg-black/30 p-2 rounded-md">
                <code className="text-xs text-gray-400">STEAM_0:1:12345678</code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-[#5D5FEF]"
                  onClick={copyExampleID}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Info size={14} className="text-[#5D5FEF]" />
                <span>
                  You can also use a site like{" "}
                  <Link href="https://steamid.io" target="_blank" className="text-[#5D5FEF] hover:underline">
                    steamid.io
                  </Link>{" "}
                  to find your SteamID.
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Info size={14} />
            <span>Your SteamID is needed to access your inventory and allow you to use your skins as collateral.</span>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild className="text-[#5D5FEF] border-[#5D5FEF] hover:bg-[#5D5FEF]/20">
          <Link href="/" className="flex items-center gap-1">
            <ExternalLink size={14} />
            Verify on Steam
          </Link>
        </Button>
        <Button onClick={handleSubmit} className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white">
          Connect my account
        </Button>
      </CardFooter>
    </Card>
  )
}
