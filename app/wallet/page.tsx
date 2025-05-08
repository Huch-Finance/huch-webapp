"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CyberpunkContainer } from "@/components/cyberpunk-container"
import { ArrowDown, ArrowUp, Clock, DollarSign, ExternalLink, History, WalletIcon } from "lucide-react"
import Link from "next/link"
// Autres imports...
import { Footer } from "@/components/footer"

// Mocked transaction data
const TRANSACTIONS = [
  {
    id: 1,
    type: "loan",
    amount: 750,
    date: "2025-04-25T14:30:00",
    status: "completed",
    description: "Loan #1234 - AWP Dragon Lore",
  },
  {
    id: 2,
    type: "repayment",
    amount: -320,
    date: "2025-04-20T09:15:00",
    status: "completed",
    description: "Repayment for Loan #1122",
  },
  {
    id: 3,
    type: "deposit",
    amount: 500,
    date: "2025-04-15T16:45:00",
    status: "completed",
    description: "Deposit from Coinbase",
  },
  {
    id: 4,
    type: "withdrawal",
    amount: -200,
    date: "2025-04-10T11:20:00",
    status: "completed",
    description: "Withdrawal to Metamask",
  },
  {
    id: 5,
    type: "loan",
    amount: 300,
    date: "2025-04-05T13:10:00",
    status: "completed",
    description: "Loan #1089 - Karambit Fade",
  },
]

// Mocked active loans data
const ACTIVE_LOANS = [
  {
    id: 1234,
    amount: 750,
    collateral: "AWP Dragon Lore",
    startDate: "2025-04-25T14:30:00",
    dueDate: "2025-05-02T14:30:00",
    interestRate: 2,
    repaymentAmount: 765,
    status: "active",
  },
]

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("overview")

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "loan":
        return <ArrowDown className="text-green-400" />
      case "repayment":
        return <ArrowUp className="text-red-400" />
      case "deposit":
        return <ArrowDown className="text-green-400" />
      case "withdrawal":
        return <ArrowUp className="text-red-400" />
      default:
        return <History className="text-gray-400" />
    }
  }

  // Calculate days remaining until due date
  const getDaysRemaining = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-[#0f0f13] to-[#1a1a1f] relative z-10">
      <div className="scanlines"></div>
      <Navbar />

      <section className="pt-24 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">
            Your <span className="text-[#5D5FEF] neon-text">Wallet</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <CyberpunkContainer className="md:col-span-2">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-400">Available Balance</h2>
                  <div className="text-3xl font-bold text-[#5D5FEF]">150.25 USDC</div>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white">
                    <ArrowDown size={16} className="mr-2" />
                    Deposit
                  </Button>
                  <Button variant="outline" className="border-[#5D5FEF] text-[#5D5FEF] hover:bg-[#5D5FEF]/20">
                    <ArrowUp size={16} className="mr-2" />
                    Withdraw
                  </Button>
                </div>
              </div>
            </CyberpunkContainer>

            <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Wallet Address</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5D5FEF]">
                    <ExternalLink size={16} />
                  </Button>
                </div>
                <div className="p-2 bg-[#2A2A2A] rounded-md font-mono text-xs text-gray-400 truncate">
                  0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full bg-[#1E1E1E] p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white">
                <WalletIcon size={16} className="mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white"
              >
                <History size={16} className="mr-2" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="loans" className="data-[state=active]:bg-[#5D5FEF] data-[state=active]:text-white">
                <DollarSign size={16} className="mr-2" />
                Active Loans
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {TRANSACTIONS.slice(0, 3).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{transaction.description}</div>
                              <div className="text-xs text-gray-400">{formatDate(transaction.date)}</div>
                            </div>
                          </div>
                          <div className={`font-medium ${transaction.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount} USDC
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#2A2A2A] text-center">
                      <Button
                        variant="ghost"
                        className="text-[#5D5FEF] hover:bg-[#5D5FEF]/10"
                        onClick={() => setActiveTab("transactions")}
                      >
                        View All Transactions
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active Loans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ACTIVE_LOANS.length > 0 ? (
                      <div className="space-y-4">
                        {ACTIVE_LOANS.map((loan) => (
                          <div key={loan.id} className="p-3 bg-[#2A2A2A] rounded-lg">
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">Loan #{loan.id}</div>
                              <div className="text-[#5D5FEF] font-bold">{loan.amount} USDC</div>
                            </div>
                            <div className="text-sm text-gray-400 mb-3">Collateral: {loan.collateral}</div>
                            <div className="flex justify-between text-sm">
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{getDaysRemaining(loan.dueDate)} days remaining</span>
                              </div>
                              <div>{loan.repaymentAmount} USDC to repay</div>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white text-sm h-8">
                                Repay Loan
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 rounded-full bg-[#2A2A2A] mx-auto mb-3 flex items-center justify-center">
                          <DollarSign className="text-gray-400" />
                        </div>
                        <h3 className="font-medium mb-1">No Active Loans</h3>
                        <p className="text-sm text-gray-400 mb-4">You don't have any active loans at the moment.</p>
                        <Link href="/emprunter">
                          <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white">Get a Loan</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <CyberpunkContainer>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <h3 className="font-bold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/emprunter">
                        <Button className="w-full bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white">
                          <DollarSign size={16} className="mr-2" />
                          New Loan
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full border-[#5D5FEF] text-[#5D5FEF] hover:bg-[#5D5FEF]/20"
                      >
                        <ArrowDown size={16} className="mr-2" />
                        Deposit
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-[#5D5FEF] text-[#5D5FEF] hover:bg-[#5D5FEF]/20"
                      >
                        <ArrowUp size={16} className="mr-2" />
                        Withdraw
                      </Button>
                      <Link href="/settings">
                        <Button variant="outline" className="w-full border-[#2A2A2A] text-gray-300 hover:text-white">
                          <WalletIcon size={16} className="mr-2" />
                          Settings
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <h3 className="font-bold mb-4">Wallet Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between p-2 bg-[#2A2A2A] rounded-md">
                        <span className="text-gray-400">Total Borrowed</span>
                        <span className="font-medium">750 USDC</span>
                      </div>
                      <div className="flex justify-between p-2 bg-[#2A2A2A] rounded-md">
                        <span className="text-gray-400">Total Repaid</span>
                        <span className="font-medium">200 USDC</span>
                      </div>
                      <div className="flex justify-between p-2 bg-[#2A2A2A] rounded-md">
                        <span className="text-gray-400">Current Debt</span>
                        <span className="font-medium">765 USDC</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CyberpunkContainer>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {TRANSACTIONS.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-xs text-gray-400">{formatDate(transaction.date)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${transaction.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount} USDC
                          </div>
                          <div className="text-xs text-gray-400 capitalize">{transaction.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Loans Tab */}
            <TabsContent value="loans" className="space-y-6">
              <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Active Loans</CardTitle>
                </CardHeader>
                <CardContent>
                  {ACTIVE_LOANS.length > 0 ? (
                    <div className="space-y-6">
                      {ACTIVE_LOANS.map((loan) => (
                        <div key={loan.id} className="p-4 bg-[#2A2A2A] rounded-lg">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Loan #{loan.id}</h3>
                            <div className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium">
                              Active
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-400">Loan Amount</div>
                              <div className="font-bold text-[#5D5FEF]">{loan.amount} USDC</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Interest Rate</div>
                              <div className="font-medium">{loan.interestRate}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Start Date</div>
                              <div className="font-medium">{new Date(loan.startDate).toLocaleDateString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Due Date</div>
                              <div className="font-medium">{new Date(loan.dueDate).toLocaleDateString()}</div>
                            </div>
                          </div>

                          <div className="p-3 bg-[#1E1E1E] rounded-lg mb-4">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-400">Collateral</span>
                              <span className="font-medium">{loan.collateral}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Repayment Amount</span>
                              <span className="font-bold">{loan.repaymentAmount} USDC</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Time Remaining</span>
                              <span className="text-[#5D5FEF] font-bold">
                                {getDaysRemaining(loan.dueDate)} days left
                              </span>
                            </div>
                            <div className="h-2 bg-[#1E1E1E] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#5D5FEF]"
                                style={{
                                  width: `${
                                    ((new Date(loan.dueDate).getTime() - Date.now()) /
                                      (new Date(loan.dueDate).getTime() - new Date(loan.startDate).getTime())) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white">Repay Loan</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-[#2A2A2A] mx-auto mb-4 flex items-center justify-center">
                        <DollarSign size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No Active Loans</h3>
                      <p className="text-gray-400 mb-6">You don't have any active loans at the moment.</p>
                      <Link href="/emprunter">
                        <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white">Get a Loan</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </main>
  )
}
