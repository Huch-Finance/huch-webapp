"use client"

import { useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useWallets } from "@privy-io/react-auth"
import * as solanaWeb3 from "@solana/web3.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Wallet, Send } from "lucide-react"

interface SolanaTransferProps {
  className?: string
}

export function SolanaTransfer({ className = "" }: SolanaTransferProps) {
  const { signTransaction } = usePrivy()
  const { wallets } = useWallets()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const handleTransfer = async () => {
    try {
      setLoading(true)

      if (!recipient || !amount) {
        throw new Error("Please fill in all fields")
      }

      const wallet = wallets.find((w) => w.blockchain === "solana")
      if (!wallet) {
        throw new Error("No Solana wallet connected")
      }

      const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl("mainnet-beta"),
        "confirmed"
      )

      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: new solanaWeb3.PublicKey(wallet.address),
          toPubkey: new solanaWeb3.PublicKey(recipient),
          lamports: solanaWeb3.LAMPORTS_PER_SOL * parseFloat(amount),
        })
      )

      const signedTransaction = await signTransaction({
        transaction: transaction.serialize(),
        blockchain: "solana",
      })

      const signature = await connection.sendRawTransaction(signedTransaction)

      if (signature) {
        toast.success(`Transaction successful! Signature: ${signature}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Wallet className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold">Solana Transfer</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient Address</Label>
        <Input
          id="recipient"
          type="text"
          placeholder="Enter recipient's Solana address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (SOL)</Label>
        <Input
          id="amount"
          type="number"
          step="0.001"
          min="0"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <Button
        onClick={handleTransfer}
        disabled={loading || !recipient || !amount}
        className="w-full"
      >
        {loading ? "Sending..." : "Send SOL"}
        <Send className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}