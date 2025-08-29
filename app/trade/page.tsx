"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, ThumbsUp, ThumbsDown, Wifi } from "lucide-react";
import TradingViewWidget from "@/components/trade/TradingViewWidget";
import { Footer } from "@/components/organism/footer";

export default function TradingInterface() {
  const { profile, isLoading } = useAuth();

  // All hooks must be called before any return/conditional
  const [selectedTab, setSelectedTab] = useState("long");
  const [price, setPrice] = useState("108414");
  const [quantity, setQuantity] = useState("");
  const [reduceOnly, setReduceOnly] = useState(false);
  const [tpSl, setTpSl] = useState(false);

  const orderBookData = {
    asks: [
      { amount: "0.73957", priceUsd: "107,973", priceBtc: "0.00954" },
      { amount: "0.01088", priceUsd: "107,089", priceBtc: "0.00954" },
      { amount: "0.00379", priceUsd: "107,102", priceBtc: "0.00954" },
      { amount: "13.36167", priceUsd: "107,114", priceBtc: "1.16275" },
      { amount: "0.00954", priceUsd: "107,127", priceBtc: "0.01088" },
    ],
    bids: [
      { amount: "0.01088", priceUsd: "107,139", priceBtc: "0.00954" },
      { amount: "0.00954", priceUsd: "107,152", priceBtc: "0.00954" },
      { amount: "12.00180", priceUsd: "107,155", priceBtc: "9.90716" },
      { amount: "0.00954", priceUsd: "107,177", priceBtc: "0.01088" },
      { amount: "0.01088", priceUsd: "107,189", priceBtc: "11.35701" },
    ],
  };

  const degenFeedData = [
    {
      id: 1,
      user: "no one",
      avatar: "/placeholder.svg?height=32&width=32",
      type: "LONG",
      token: "CAR",
      price: "$0.04697",
      leverage: "10x",
      time: "6 hours ago",
      likes: 0,
      dislikes: 0,
    },
    {
      id: 2,
      user: "no one",
      avatar: "/placeholder.svg?height=32&width=32",
      type: "LONG",
      token: "RAI",
      price: "$0.9592",
      leverage: "10x",
      time: "7 hours ago",
      likes: 0,
      dislikes: 0,
    },
    {
      id: 3,
      user: "Eights",
      avatar: "/placeholder.svg?height=32&width=32",
      type: "LONG",
      token: "ETH",
      price: "$3,247",
      leverage: "5x",
      time: "8 hours ago",
      likes: 2,
      dislikes: 0,
    },
  ];

  // Now you can safely return conditionally
  if (isLoading || profile === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#111] text-white">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
      </div>
    );
  }

  if (!profile?.admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#111] text-white">
        <h2 className="text-2xl font-bold mb-4">Coming soon...</h2>
        <p className="text-[#a1a1c5] text-sm mb-4">
          Trading will be available soon for all users.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-[20px]">
      {/* Top Header */}
      {/* Removing the entire top header section */}

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-100px)]">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chart Placeholder */}
          <div
            className="flex-1 m-2 sm:m-4 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600"
            style={{ backgroundColor: "#0a0a2e" }}
          >
            <div className="w-full h-full min-h-[250px] sm:min-h-[350px]">
              <TradingViewWidget />
            </div>
          </div>

          {/* Bottom Tabs - Scrollable on mobile */}
          <div className="border-t border-gray-800 p-2 sm:p-4">
            <Tabs defaultValue="positions" className="w-full">
              <div className="overflow-x-auto">
                <TabsList className="bg-gray-800 border-gray-700 flex w-max lg:w-full">
                  <TabsTrigger
                    value="positions"
                    className="data-[state=active]:bg-blue-600 text-xs sm:text-sm whitespace-nowrap"
                  >
                    Positions(0)
                  </TabsTrigger>
                  <TabsTrigger
                    value="orders"
                    className="data-[state=active]:bg-blue-600 text-xs sm:text-sm whitespace-nowrap"
                  >
                    Open Orders(0)
                  </TabsTrigger>
                  <TabsTrigger
                    value="twap"
                    className="data-[state=active]:bg-blue-600 text-xs sm:text-sm whitespace-nowrap"
                  >
                    TWAP
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-blue-600 text-xs sm:text-sm whitespace-nowrap"
                  >
                    Trade History
                  </TabsTrigger>
                  <TabsTrigger
                    value="funding"
                    className="data-[state=active]:bg-blue-600 text-xs sm:text-sm whitespace-nowrap"
                  >
                    Funding Payments
                  </TabsTrigger>
                  <TabsTrigger
                    value="balance"
                    className="data-[state=active]:bg-blue-600 text-xs sm:text-sm whitespace-nowrap"
                  >
                    Balance
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="positions" className="mt-4">
                <div className="text-center text-gray-400 py-8 text-sm">
                  No open positions
                </div>
              </TabsContent>

              <TabsContent value="orders" className="mt-4">
                <div className="text-center text-gray-400 py-8 text-sm">
                  No open orders
                </div>
              </TabsContent>

              <TabsContent value="twap" className="mt-4">
                <div className="text-center text-gray-400 py-8 text-sm">
                  TWAP orders
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="text-center text-gray-400 py-8 text-sm">
                  Trade history will appear here
                </div>
              </TabsContent>

              <TabsContent value="funding" className="mt-4">
                <div className="text-center text-gray-400 py-8 text-sm">
                  Funding payment history
                </div>
              </TabsContent>

              <TabsContent value="balance" className="mt-4">
                <div className="text-center text-gray-400 py-8 text-sm">
                  Account balance details
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - Full width on mobile, sidebar on desktop */}
        <div className="w-full lg:w-80 lg:border-l border-gray-800 flex flex-col lg:max-h-none max-h-96 lg:overflow-visible overflow-y-auto">
          {/* Trading Panel */}
          <Card className="bg-gray-800 border-gray-700 m-2 sm:m-4 mb-2">
            <CardHeader className="pb-3">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                  <TabsTrigger
                    value="short"
                    className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm"
                  >
                    Short
                  </TabsTrigger>
                  <TabsTrigger
                    value="long"
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-xs sm:text-sm"
                  >
                    Long
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span>Limit Order</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>

              <div className="text-xs text-gray-400">Available: 0.00 USD</div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="price" className="text-xs sm:text-sm text-gray-300">
                    Price
                  </Label>
                  <div className="flex mt-1">
                    <Input
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white rounded-r-none text-sm"
                    />
                    <div className="bg-gray-700 border border-l-0 border-gray-600 px-2 sm:px-3 py-2 rounded-r text-xs sm:text-sm text-gray-300">
                      USD
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity" className="text-xs sm:text-sm text-gray-300">
                    Quantity
                  </Label>
                  <div className="flex mt-1">
                    <Input
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Amount"
                      className="bg-gray-700 border-gray-600 text-white rounded-r-none text-sm"
                    />
                    <div className="bg-gray-700 border border-l-0 border-gray-600 px-2 sm:px-3 py-2 rounded-r text-xs sm:text-sm text-gray-300">
                      BTC
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notional" className="text-xs sm:text-sm text-gray-300">
                    Notional Total
                  </Label>
                  <div className="flex mt-1">
                    <Input
                      id="notional"
                      placeholder="USD"
                      className="bg-gray-700 border-gray-600 text-white rounded-r-none text-sm"
                    />
                    <div className="bg-gray-700 border border-l-0 border-gray-600 px-2 sm:px-3 py-2 rounded-r text-xs sm:text-sm text-gray-300">
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reduce-only"
                    checked={reduceOnly}
                    onCheckedChange={setReduceOnly}
                    className="border-gray-600"
                  />
                  <Label
                    htmlFor="reduce-only"
                    className="text-xs sm:text-sm text-gray-300"
                  >
                    Reduce only
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tp-sl"
                    checked={tpSl}
                    onCheckedChange={setTpSl}
                    className="border-gray-600"
                  />
                  <Label htmlFor="tp-sl" className="text-xs sm:text-sm text-gray-300">
                    TP/SL
                  </Label>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Share your trade on Degen Feed (Optional)
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
                Connect wallet
              </Button>

              <div className="text-xs text-gray-400">Margin Details</div>
            </CardContent>
          </Card>

          {/* Degen Feed */}
          <Card className="bg-gray-800 border-gray-700 mx-2 sm:mx-4 mb-2 sm:mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Degen Feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {degenFeedData.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={trade.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gray-600 text-xs">
                      {trade.user.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-300">
                        {trade.user}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs px-1 py-0 ${
                          trade.type === "LONG"
                            ? "bg-green-600/20 text-green-400 border-green-600"
                            : "bg-red-600/20 text-red-400 border-red-600"
                        }`}
                      >
                        {trade.type}
                      </Badge>
                      <span className="text-xs font-medium">{trade.token}</span>
                      <span className="text-xs text-gray-400">
                        {trade.price}
                      </span>
                      <span className="text-xs text-purple-400">
                        {trade.leverage}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{trade.time}</div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-600"
                    >
                      <ThumbsUp className="w-3 h-3 text-gray-400" />
                    </Button>
                    <span className="text-xs text-gray-500">{trade.likes}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-600"
                    >
                      <ThumbsDown className="w-3 h-3 text-gray-400" />
                    </Button>
                    <span className="text-xs text-gray-500">
                      {trade.dislikes}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="border-t border-gray-800 p-2 px-4">
        <div className="flex items-center space-x-2">
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">Online</span>
        </div>
      </div>
      <Footer />
    </div>
  );
}
