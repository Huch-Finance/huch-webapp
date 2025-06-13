"use client"

import { useState } from "react"
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { useSolanaWallets, useSignTransaction } from "@privy-io/react-auth/solana"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { 
  sendSPLToken, 
  transferUSDCToVault, 
  getTransactionStatus,
  getUSDCMint 
} from "@/lib/solana-utils"

interface TransactionResult {
  success: boolean
  signature?: string
  error?: string
}

export function useSPLTransactions() {
  const { wallets } = useSolanaWallets()
  const { signTransaction } = useSignTransaction()
  const { profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  )

  /**
   * Send USDC to another address
   */
  const sendUSDC = async (
    recipientAddress: string,
    amount: number
  ): Promise<TransactionResult> => {
    if (!wallets[0]) {
      const error = "No wallet connected"
      setError(error)
      toast.error(error)
      return { success: false, error }
    }

    setIsLoading(true)
    setError(null)

    try {
      const recipient = new PublicKey(recipientAddress)
      const signature = await sendSPLToken(
        connection,
        wallets[0],
        recipient,
        amount,
        getUSDCMint()
      )

      toast.success(`USDC sent successfully! Transaction: ${signature.slice(0, 8)}...`)
      
      return { 
        success: true, 
        signature 
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send USDC"
      setError(errorMessage)
      toast.error(errorMessage)
      
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Send USDC to vault for borrowing
   */
  const depositToVault = async (
    vaultAddress: string,
    amount: number
  ): Promise<TransactionResult> => {
    if (!wallets[0]) {
      const error = "No wallet connected"
      setError(error)
      toast.error(error)
      return { success: false, error }
    }

    setIsLoading(true)
    setError(null)

    try {
      const vault = new PublicKey(vaultAddress)
      const signature = await transferUSDCToVault(
        connection,
        wallets[0],
        vault,
        amount
      )

      toast.success(`Deposited ${amount} USDC to vault! Transaction: ${signature.slice(0, 8)}...`)
      
      return { 
        success: true, 
        signature 
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to deposit to vault"
      setError(errorMessage)
      toast.error(errorMessage)
      
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Check transaction status
   */
  const checkTransactionStatus = async (signature: string) => {
    try {
      const status = await getTransactionStatus(connection, signature)
      return status
    } catch (err: any) {
      console.error("Error checking transaction status:", err)
      return { confirmed: false, error: err.message }
    }
  }

  /**
   * Repay loan with USDC - hybrid approach using SPL transfer + smart contract update
   */
  const repayLoan = async (
    amount: number,
    loanId: string
  ): Promise<TransactionResult> => {
    if (!wallets[0]) {
      const error = "No wallet connected"
      setError(error)
      toast.error(error)
      return { success: false, error }
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Starting loan repayment:', { amount, loanId })
      
      if (!profile?.id) {
        throw new Error('User not authenticated')
      }

      // Step 1: Get transaction data from backend
      const response = await fetch('http://localhost:3333/solana/prepare-repay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Privy-Id': profile.id,
        },
        body: JSON.stringify({
          amount,
          loanId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to prepare repay transaction')
      }

      const result = await response.json()
      console.log('Backend instruction data:', result)

      if (!result.success || !result.instructionData) {
        throw new Error('Failed to get instruction data from backend')
      }

      const instrData = result.instructionData
      const userPublicKey = new PublicKey(wallets[0].address)
      
      console.log('Using Anchor-built instruction with program ID:', instrData.programId)

      // Step 2: Use the Anchor-built instruction from backend
      const repayInstruction = new TransactionInstruction({
        keys: instrData.keys.map(key => ({
          pubkey: new PublicKey(key.pubkey),
          isSigner: key.isSigner,
          isWritable: key.isWritable
        })),
        programId: new PublicKey(instrData.programId),
        data: Buffer.from(instrData.data),
      })

      // Step 3: Build transaction with Anchor instruction
      const transaction = new Transaction()
      console.log('Adding Anchor-built repay instruction')
      transaction.add(repayInstruction)

      // Set required fields
      console.log('Getting latest blockhash...')
      const { blockhash } = await connection.getLatestBlockhash('confirmed')
      transaction.recentBlockhash = blockhash
      transaction.feePayer = userPublicKey

      console.log('Transaction ready:', {
        recentBlockhash: transaction.recentBlockhash,
        feePayer: transaction.feePayer?.toBase58(),
        instructions: transaction.instructions.length,
        amount: instrData.amount,
        instructionType: 'Anchor-built repayPartial'
      })

      // Step 5: Sign with Privy
      const signedTransaction = await signTransaction({
        transaction,
        connection,
        uiOptions: {
          title: "Repay Loan",
          description: `Repaying ${amount} USDC to vault`,
          buttonText: "Sign Transaction"
        }
      })

      console.log('Transaction signed successfully!')

      // Step 6: Send to network
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      await connection.confirmTransaction(signature, 'confirmed')

      console.log('Repay transaction confirmed:', signature)

      toast.success(`Loan repaid successfully! Amount: ${amount} USDC`)
      toast.success(`Transaction: ${signature.slice(0, 8)}...`)
      toast.info('Smart contract updated loan state on blockchain')
      
      return { 
        success: true, 
        signature
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to repay loan"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Repay loan error:', err)
      
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Test function to send your custom SPL token to yourself
   */
  const testUSDCTransfer = async (amount: number = 0.01): Promise<TransactionResult> => {
    if (!wallets[0]) {
      const error = "No wallet connected"
      setError(error)
      toast.error(error)
      return { success: false, error }
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Testing with custom SPL token...')
      console.log('Wallet address:', wallets[0].address)
      console.log('Token mint:', getUSDCMint().toBase58())
      
      // Send your custom SPL token to yourself (testing)
      const signature = await sendSPLToken(
        connection,
        wallets[0],
        new PublicKey(wallets[0].address), // Send to self
        amount,
        getUSDCMint() // Ton token SPL personnalisé
      )

      toast.success(`Custom SPL token transfer successful! ${amount} tokens`)
      toast.success(`Transaction: ${signature.slice(0, 8)}...`)
      console.log('Full signature:', signature)
      
      return { 
        success: true, 
        signature 
      }
    } catch (err: any) {
      const errorMessage = err.message || "SPL token transfer failed"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error("SPL transfer error:", err)
      
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendUSDC,
    depositToVault,
    repayLoan,
    testUSDCTransfer,
    checkTransactionStatus,
    isLoading,
    error,
    isWalletConnected: !!wallets[0],
    walletAddress: wallets[0]?.address
  }
}