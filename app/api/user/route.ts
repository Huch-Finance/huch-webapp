import { NextRequest, NextResponse } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'

// Initialize Privy API
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET

if (!PRIVY_APP_SECRET) {
  console.warn('PRIVY_APP_SECRET not found in environment variables')
}

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cm9jucpzl050yl20mzx8tiq6i",
  PRIVY_APP_SECRET || ""
)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the access token with Privy
    if (PRIVY_APP_SECRET) {
      try {
        const tokenClaims = await privy.verifyAuthToken(accessToken)
        const user = await privy.getUserById(tokenClaims.userId)
        
        // Extract email and wallet from linked accounts
        const email = user.linkedAccounts.find(account => account.type === 'email')?.address || null
        const wallet = user.linkedAccounts.find(account => account.type === 'wallet')
        
        const userData = {
          id: user.id,
          email: email,
          walletAddress: wallet?.address || null,
          steamId: null, // You would fetch this from your database
          createdAt: user.createdAt.toISOString(),
        }
        
        return NextResponse.json({
          success: true,
          user: userData
        })
      } catch (error) {
        console.error('Token verification failed:', error)
        return NextResponse.json(
          { error: 'Invalid access token' },
          { status: 401 }
        )
      }
    } else {
      // If no app secret, return mock data for development
      console.log('Development mode: returning mock user data')
      return NextResponse.json({
        success: true,
        user: {
          id: 'dev-user-id',
          email: 'dev@example.com',
          walletAddress: null,
          steamId: null,
          createdAt: new Date().toISOString()
        }
      })
    }
  } catch (error) {
    console.error('Error in user route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7)
    const userData = await request.json()

    // Verify the access token with Privy
    if (PRIVY_APP_SECRET) {
      try {
        const tokenClaims = await privy.verifyAuthToken(accessToken)
        
        // Here you would typically create user data in your database
        console.log('Creating user:', tokenClaims.userId, 'with data:', userData)
        
        return NextResponse.json({
          success: true,
          message: 'User created successfully',
          userId: tokenClaims.userId
        })
      } catch (error) {
        console.error('Token verification failed:', error)
        return NextResponse.json(
          { error: 'Invalid access token' },
          { status: 401 }
        )
      }
    } else {
      // Development mode
      console.log('Development mode: mock user creation')
      return NextResponse.json({
        success: true,
        message: 'User created successfully (dev mode)',
        userId: 'dev-user-id'
      })
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7)
    const updateData = await request.json()

    // Verify the access token with Privy
    if (PRIVY_APP_SECRET) {
      try {
        const tokenClaims = await privy.verifyAuthToken(accessToken)
        
        // Here you would typically update user data in your database
        console.log('Updating user:', tokenClaims.userId, 'with data:', updateData)
        
        return NextResponse.json({
          success: true,
          message: 'User updated successfully'
        })
      } catch (error) {
        console.error('Token verification failed:', error)
        return NextResponse.json(
          { error: 'Invalid access token' },
          { status: 401 }
        )
      }
    } else {
      // Development mode
      console.log('Development mode: mock user update')
      return NextResponse.json({
        success: true,
        message: 'User updated successfully (dev mode)'
      })
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}