"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Award, Clock, CreditCard, ExternalLink, Gift, History, Trophy, Wallet, Settings } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"

// Mocked user data
const USER = {
  username: "HuchFan.",
  points: 320,
  rank: 14,
  badge: "Bronze",
  wallet: {
    usdc: 150.25,
    coins: 320,
  },
  loans: [
    {
      id: 1,
      date: "27/05/2025",
      amount: 50,
      skin: "AK-47 | Redline",
      status: "active",
      dueDate: "06/05/2025",
      points: 50,
    },
    {
      id: 2,
      date: "15/04/2025",
      amount: 200,
      skin: "Desert Eagle | Blaze",
      status: "repaid",
      dueDate: "22/04/2025",
      points: 200,
    },
    {
      id: 3,
      date: "02/04/2025",
      amount: 70,
      skin: "USP-S | Kill Confirmed",
      status: "repaid",
      dueDate: "09/04/2025",
      points: 70,
    },
  ],
  badges: [
    { id: 1, name: "Weekly Challenge Completed", icon: "🏆", date: "28/04/2025" },
    { id: 2, name: "First Loan", icon: "🎯", date: "02/04/2025" },
    { id: 3, name: "Top 100 Global", icon: "🌟", date: "20/04/2025" },
  ],
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState("wallet")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#5D5FEF]/20 text-[#5D5FEF] border-[#5D5FEF]"
      case "repaid":
        return "bg-green-500/20 text-green-500 border-green-500"
      case "overdue":
        return "bg-red-500/20 text-red-500 border-red-500"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400"
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-[#0f0f13] to-[#1a1a1f]">
      <Navbar />

      <section className="pt-24 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Profile Card */}
            <Card className="border-muted bg-[#1E1E1E] md:w-1/3">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-muted overflow-hidden mb-4">
                    <img src="/avatars/logo-black.svg" alt="Profile" className="w-full h-full object-cover bg-black" />
                  </div>

                  <h2 className="text-xl font-bold mb-1">{USER.username}</h2>

                  <div className="flex items-center gap-1 mb-4">
                    <Award className="text-amber-600" />
                    <span className="text-amber-600">{USER.badge}</span>
                  </div>

                  <div className="w-full bg-muted rounded-lg p-3 flex justify-between mb-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Rank</div>
                      <div className="font-bold">#{USER.rank}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Points</div>
                      <div className="font-bold text-[#5D5FEF]">{USER.points}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Loans</div>
                      <div className="font-bold">{USER.loans.length}</div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full border-[#5D5FEF] text-[#5D5FEF] hover:bg-[#5D5FEF]/20">
                    <ExternalLink size={16} className="mr-2" />
                    View on Steam
                  </Button>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link href="/wallet">
                      <Button variant="outline" className="w-full border-[#2A2A2A] text-gray-300 hover:text-white">
                        <CreditCard size={16} className="mr-2" />
                        Manage Wallet
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button variant="outline" className="w-full border-[#2A2A2A] text-gray-300 hover:text-white">
                        <Settings size={16} className="mr-2" />
                        Account Settings
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Card */}
            <Card className="border-muted bg-[#1E1E1E] flex-1">
              <Tabs defaultValue="wallet" value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="pb-0">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger
                      value="wallet"
                      className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white"
                    >
                      <Wallet size={16} className="mr-2" />
                      Wallet
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white"
                    >
                      <History size={16} className="mr-2" />
                      History
                    </TabsTrigger>
                    <TabsTrigger
                      value="badges"
                      className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white"
                    >
                      <Gift size={16} className="mr-2" />
                      Badges
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-6">
                  <TabsContent value="wallet" className="mt-0 animate-appear">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-muted bg-[#1E1E1E]">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <CreditCard className="text-[#5D5FEF]" />
                                <span className="font-medium">USDC</span>
                              </div>
                              <div className="text-xs text-gray-400">Solana</div>
                            </div>
                            <div className="text-2xl font-bold">{USER.wallet.usdc} USDC</div>
                          </CardContent>
                        </Card>

                        <Card className="border-muted bg-[#1E1E1E]">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Trophy className="text-[#5D5FEF]" />
                                <span className="font-medium">Huch Coins</span>
                              </div>
                              <div className="text-xs text-gray-400">Points</div>
                            </div>
                            <div className="text-2xl font-bold">{USER.wallet.coins}</div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white font-bold">
                          <Wallet className="mr-2" />
                          Deposit Funds
                        </Button>
                        <Button
                          variant="outline"
                          className="border-muted text-gray-400 hover:text-white hover:border-white"
                        >
                          <CreditCard className="mr-2" />
                          Withdraw Funds
                        </Button>
                      </div>

                      <div className="p-4 bg-muted rounded-lg border border-muted">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="text-[#5D5FEF]" />
                          <span className="font-medium">Next Due Date</span>
                        </div>

                        {USER.loans.find((loan) => loan.status === "active") ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Loan:</span>
                              <span>{USER.loans.find((loan) => loan.status === "active")?.skin}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Amount to repay:</span>
                              <span className="font-bold">
                                {(USER.loans.find((loan) => loan.status === "active")?.amount || 0) * 1.05} $
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Due date:</span>
                              <span className="text-[#5D5FEF]">
                                {USER.loans.find((loan) => loan.status === "active")?.dueDate}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400">No active loans</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-0 animate-appear">
                    <div className="space-y-4">
                      {USER.loans.map((loan) => (
                        <Card key={loan.id} className="border-muted bg-[#1E1E1E]">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="font-medium">{loan.skin}</div>
                                <div className="text-sm text-gray-400">{loan.date}</div>
                              </div>
                              <Badge className={`${getStatusColor(loan.status)}`}>
                                {loan.status === "active" ? "Active" : loan.status === "repaid" ? "Repaid" : "Overdue"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <div className="text-gray-400">Amount</div>
                                <div className="font-medium">{loan.amount} $</div>
                              </div>
                              <div>
                                <div className="text-gray-400">Due Date</div>
                                <div className="font-medium">{loan.dueDate}</div>
                              </div>
                              <div>
                                <div className="text-gray-400">Points</div>
                                <div className="font-medium text-[#5D5FEF]">+{loan.points}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {USER.loans.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-400">No loan history</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="badges" className="mt-0 animate-appear">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {USER.badges.map((badge) => (
                        <Card
                          key={badge.id}
                          className="border-muted bg-[#1E1E1E] hover:border-[#5D5FEF] transition-colors"
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                              {badge.icon}
                            </div>
                            <div>
                              <div className="font-medium">{badge.name}</div>
                              <div className="text-sm text-gray-400">Obtained on {badge.date}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {USER.badges.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No badges earned</p>
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
