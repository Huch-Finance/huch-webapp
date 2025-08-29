import { PublicKey, Transaction } from '@solana/web3.js'
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction, 
  createTransferInstruction,
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID 
} from '@solana/spl-token'
import { getSolanaConnection, solanaConnection } from './solana-connection'

export const USDC_MINT_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

// HUCH TOKEN SPL - Adresse mainnet du token HUCH
export const HUCH_TOKEN_MINT_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // Remplace par l'adresse mainnet de ton token HUCH

export const USDC_DECIMALS = 6

// Utiliser mainnet pour toutes les opérations
export const getUSDCMint = () => {
  return USDC_MINT_MAINNET
}

// Fonction pour utiliser le token HUCH sur mainnet
export const getHuchTokenMint = () => {
  return HUCH_TOKEN_MINT_MAINNET
}

export async function ensureTokenAccount(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey = getUSDCMint(),
  payer: PublicKey
): Promise<{ tokenAccount: PublicKey; instruction?: any }> {
  const tokenAccount = await getAssociatedTokenAddress(mint, owner)
  
  try {
    // Check if the account exists
    const accountInfo = await connection.getAccountInfo(tokenAccount)
    
    if (!accountInfo) {
      // Account doesn't exist, create instruction to create it
      const instruction = createAssociatedTokenAccountInstruction(
        payer,
        tokenAccount,
        owner,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
      
      return { tokenAccount, instruction }
    }
    
    return { tokenAccount }
  } catch (error) {
    console.error('Error checking token account:', error)
    throw error
  }
}

export async function getUSDCBalance(
  connection: Connection,
  walletAddress: string
): Promise<number> {
  try {
    const wallet = new PublicKey(walletAddress)
    const tokenAccount = await getAssociatedTokenAddress(getUSDCMint(), wallet)
    
    const balance = await connection.getTokenAccountBalance(tokenAccount)
    return Number(balance.value.uiAmount || 0)
  } catch (error) {
    console.error('Error getting USDC balance:', error)
    return 0
  }
}

export async function getUSDCBalanceWithFallback(walletAddress: string): Promise<number> {
  const maxRetries = 4
  let lastError: any = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const connection = getSolanaConnection()
      const wallet = new PublicKey(walletAddress)
      const tokenAccount = await getAssociatedTokenAddress(getUSDCMint(), wallet)
      
      const balance = await connection.getTokenAccountBalance(tokenAccount)
      console.log(`Successfully got USDC balance on attempt ${attempt + 1}`)
      return Number(balance.value.uiAmount || 0)
    } catch (error: any) {
      lastError = error
      console.error(`USDC balance fetch failed on attempt ${attempt + 1}:`, error.message)
      
      // If rate limited or forbidden, switch endpoint and try again
      if (error.message?.includes('403') || error.message?.includes('429') || error.message?.includes('Access forbidden')) {
        console.log('Rate limited or access forbidden, switching endpoint...')
        solanaConnection.resetConnection()
        continue
      }
      
      // For other errors, wait a bit before retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        solanaConnection.resetConnection()
      }
    }
  }

  console.error('All Solana endpoints failed for USDC balance:', lastError?.message)
  return 0
}

export function formatUSDC(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('$', '')
}

export function usdcToSmallestUnit(amount: number): number {
  return Math.floor(amount * Math.pow(10, USDC_DECIMALS))
}

export function smallestUnitToUsdc(amount: number): number {
  return amount / Math.pow(10, USDC_DECIMALS)
}

/**
 * Send SPL tokens using Privy wallet
 * @param connection Solana connection
 * @param sender Sender's wallet (Privy wallet)
 * @param recipient Recipient's public key
 * @param amount Amount in UI units (e.g., 1.5 USDC)
 * @param mint Token mint address (defaults to USDC)
 * @returns Transaction signature
 */
export async function sendSPLToken(
  _connection: any, // Deprecated parameter - using centralized connection
  sender: any, // Privy wallet object
  recipient: PublicKey,
  amount: number,
  mint: PublicKey = getUSDCMint()
): Promise<string> {
  // Use centralized connection to prevent WebSocket errors
  const connection = getSolanaConnection()
  if (!sender?.address) {
    throw new Error('Sender wallet not connected')
  }

  const senderPubkey = new PublicKey(sender.address)
  const amountInSmallestUnit = usdcToSmallestUnit(amount)

  console.log('SendSPLToken Debug:')
  console.log('- Sender:', senderPubkey.toBase58())
  console.log('- Recipient:', recipient.toBase58())
  console.log('- Mint:', mint.toBase58())
  console.log('- Amount (UI):', amount)
  console.log('- Amount (smallest unit):', amountInSmallestUnit)

  // Get associated token accounts
  const senderTokenAccount = await getAssociatedTokenAddress(mint, senderPubkey)
  const recipientTokenAccount = await getAssociatedTokenAddress(mint, recipient)

  console.log('- Sender token account:', senderTokenAccount.toBase58())
  console.log('- Recipient token account:', recipientTokenAccount.toBase58())

  const transaction = new Transaction()

  // Check if SENDER token account exists, create if not
  const senderAccountInfo = await connection.getAccountInfo(senderTokenAccount)
  if (!senderAccountInfo) {
    console.log('Creating sender token account...')
    const createSenderAccountInstruction = createAssociatedTokenAccountInstruction(
      senderPubkey,
      senderTokenAccount,
      senderPubkey,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
    transaction.add(createSenderAccountInstruction)
  } else {
    console.log('Sender token account exists')
    // Check balance
    try {
      const balance = await connection.getTokenAccountBalance(senderTokenAccount)
      console.log('- Sender token balance:', balance.value.uiAmount, 'tokens')
      
      if (!balance.value.uiAmount || balance.value.uiAmount < amount) {
        throw new Error(`Insufficient token balance. You have ${balance.value.uiAmount || 0} tokens, need ${amount}`)
      }
    } catch (balanceError) {
      console.error('Error checking balance:', balanceError)
    }
  }

  // Check if recipient token account exists, create if not
  const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount)
  if (!recipientAccountInfo) {
    console.log('Creating recipient token account...')
    const createRecipientAccountInstruction = createAssociatedTokenAccountInstruction(
      senderPubkey,
      recipientTokenAccount,
      recipient,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
    transaction.add(createRecipientAccountInstruction)
  } else {
    console.log('Recipient token account exists')
  }

  // Create transfer instruction
  const transferInstruction = createTransferInstruction(
    senderTokenAccount,
    recipientTokenAccount,
    senderPubkey,
    amountInSmallestUnit,
    [],
    TOKEN_PROGRAM_ID
  )
  transaction.add(transferInstruction)

  // Get latest blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = senderPubkey

  console.log('Transaction instructions:', transaction.instructions.length)

  // Sign and send transaction using Privy
  const signedTransaction = await sender.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signedTransaction.serialize())
  
  // Confirm transaction
  await connection.confirmTransaction(signature, 'confirmed')
  
  return signature
}

/**
 * Transfer USDC to vault using Privy wallet
 * @param connection Solana connection
 * @param userWallet Privy wallet object
 * @param vaultAddress Vault's public key
 * @param amount Amount in USDC
 * @returns Transaction signature
 */
export async function transferUSDCToVault(
  connection: Connection,
  userWallet: any,
  vaultAddress: PublicKey,
  amount: number
): Promise<string> {
  return sendSPLToken(connection, userWallet, vaultAddress, amount)
}

/**
 * Get transaction status with user-friendly error messages
 * @param connection Solana connection
 * @param signature Transaction signature
 * @returns Transaction status object
 */
export async function getTransactionStatus(
  connection: Connection,
  signature: string
): Promise<{
  confirmed: boolean
  error?: string
  details?: any
}> {
  try {
    const status = await connection.getSignatureStatus(signature)
    
    if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
      return { confirmed: true }
    }
    
    if (status.value?.err) {
      return { 
        confirmed: false, 
        error: 'Transaction failed',
        details: status.value.err
      }
    }
    
    return { confirmed: false }
  } catch (error) {
    return { 
      confirmed: false, 
      error: 'Failed to check transaction status',
      details: error
    }
  }
}