import { Connection, ConnectionConfig } from '@solana/web3.js'

/**
 * Centralized Solana connection management
 * Prevents WebSocket errors from multiple connection instances
 */
class SolanaConnectionManager {
  private static instance: SolanaConnectionManager
  private connection: Connection | null = null
  private currentEndpointIndex: number = 0
  private endpoints: string[] = [
    "https://rpc.ankr.com/solana",
    "https://solana-mainnet.g.alchemy.com/v2/demo",
    "https://api.mainnet-beta.solana.com",
    "https://solana-api.projectserum.com"
  ]
  private connectionConfig: ConnectionConfig = {
    commitment: 'confirmed',
    // Disable WebSocket connections to prevent ws errors
    wsEndpoint: undefined,
    httpHeaders: {
      'Content-Type': 'application/json',
    },
    // Add fetch configuration for better error handling
    fetchMiddleware: (url, options, fetch) => {
      console.log('Solana RPC Request:', url)
      return fetch(url, {
        ...options,
        timeout: 30000, // 30 second timeout
      }).catch(error => {
        console.error('Solana RPC Error:', error)
        // Reset connection on persistent errors
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          console.log('Network error detected, will reset connection on next request')
          this.connection = null
        }
        throw new Error(`Solana RPC failed: ${error.message || 'Network error'}`)
      })
    }
  }

  private constructor() {}

  static getInstance(): SolanaConnectionManager {
    if (!SolanaConnectionManager.instance) {
      SolanaConnectionManager.instance = new SolanaConnectionManager()
    }
    return SolanaConnectionManager.instance
  }

  getConnection(): Connection {
    if (!this.connection) {
      // Use custom RPC URL if provided, otherwise use fallback endpoints
      const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || this.endpoints[this.currentEndpointIndex]
      
      // Use HTTP-only connection to avoid WebSocket issues
      this.connection = new Connection(rpcUrl, this.connectionConfig)

      // Add error handling for connection issues
      this.connection.on = this.connection.on || (() => {})
      
      console.log(`Created new Solana connection (HTTP-only) using: ${rpcUrl}`)
    }
    return this.connection
  }

  /**
   * Try next endpoint in case of rate limiting or errors
   */
  private switchToNextEndpoint(): void {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.endpoints.length
    this.connection = null
    console.log(`Switching to next Solana endpoint: ${this.endpoints[this.currentEndpointIndex]}`)
  }

  /**
   * Get balance with automatic fallback
   */
  async getBalanceWithFallback(publicKey: any): Promise<number | null> {
    const maxRetries = this.endpoints.length
    let lastError: any = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const connection = this.getConnection()
        const balance = await connection.getBalance(publicKey)
        console.log(`Successfully got balance on attempt ${attempt + 1}`)
        return balance
      } catch (error: any) {
        lastError = error
        console.error(`Balance fetch failed on attempt ${attempt + 1}:`, error.message)
        
        // If rate limited or forbidden, try next endpoint
        if (error.message?.includes('403') || error.message?.includes('429') || error.message?.includes('Access forbidden')) {
          console.log('Rate limited or access forbidden, switching endpoint...')
          this.switchToNextEndpoint()
          continue
        }
        
        // For other errors, wait a bit before retry
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          this.resetConnection()
        }
      }
    }

    console.error('All Solana endpoints failed:', lastError?.message)
    return null
  }

  /**
   * Reset connection in case of persistent errors
   */
  resetConnection(): void {
    if (this.connection) {
      console.log('Resetting Solana connection')
      this.connection = null
    }
  }

  /**
   * Test connection with error handling
   */
  async testConnection(): Promise<boolean> {
    try {
      const connection = this.getConnection()
      const slot = await connection.getSlot()
      console.log('Solana connection test successful, current slot:', slot)
      return true
    } catch (error) {
      console.error('Solana connection test failed:', error)
      this.resetConnection()
      return false
    }
  }
}

// Export singleton instance
export const solanaConnection = SolanaConnectionManager.getInstance()

// Export convenience functions
export const getSolanaConnection = () => solanaConnection.getConnection()
export const getSolanaBalanceWithFallback = (publicKey: any) => solanaConnection.getBalanceWithFallback(publicKey)