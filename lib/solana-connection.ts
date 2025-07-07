import { Connection, ConnectionConfig } from '@solana/web3.js'

/**
 * Centralized Solana connection management
 * Prevents WebSocket errors from multiple connection instances
 */
class SolanaConnectionManager {
  private static instance: SolanaConnectionManager
  private connection: Connection | null = null
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
      // Use HTTP-only connection to avoid WebSocket issues
      this.connection = new Connection(
        "https://api.devnet.solana.com",
        this.connectionConfig
      )

      // Add error handling for connection issues
      this.connection.on = this.connection.on || (() => {})
      
      console.log('Created new Solana connection (HTTP-only)')
    }
    return this.connection
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

// Export convenience function
export const getSolanaConnection = () => solanaConnection.getConnection()