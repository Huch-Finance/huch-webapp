import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'

export const USDC_MINT_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
export const USDC_DECIMALS = 6

export async function ensureTokenAccount(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey = USDC_MINT_MAINNET,
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
    const tokenAccount = await getAssociatedTokenAddress(USDC_MINT_MAINNET, wallet)
    
    const balance = await connection.getTokenAccountBalance(tokenAccount)
    return Number(balance.value.uiAmount || 0)
  } catch (error) {
    console.error('Error getting USDC balance:', error)
    return 0
  }
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