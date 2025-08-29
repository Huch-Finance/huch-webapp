import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'

export interface NFT {
  id: string
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  owner: string
  collection?: string | null
}

export interface NFTResponse {
  nfts: NFT[]
  wallet: string
  total: number
  message?: string
}

export function useNFTs() {
  const { user } = useAuth()
  const [nfts, setNFTs] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNFTs = async (allNFTs = false) => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const endpoint = allNFTs ? '/api/user/nfts/all' : '/api/user/nfts'
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}${endpoint}`, {
        headers: {
          'X-Privy-Id': user.id,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch NFTs')
      }

      const data: NFTResponse = await response.json()
      
      if (data.message && !data.nfts.length) {
        // User has no wallet
        setNFTs([])
        setError(data.message)
      } else {
        setNFTs(data.nfts)
      }
    } catch (err) {
      console.error('Error fetching NFTs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch NFTs')
      setNFTs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCollectionNFTs = () => fetchNFTs(false)
  const fetchAllNFTs = () => fetchNFTs(true)

  useEffect(() => {
    if (user?.wallet) {
      fetchCollectionNFTs()
    }
  }, [user?.wallet])

  return {
    nfts,
    loading,
    error,
    refetch: fetchCollectionNFTs,
    fetchAllNFTs,
    walletAddress: user?.wallet,
  }
}