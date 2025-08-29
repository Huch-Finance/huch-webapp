import { NextRequest, NextResponse } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'

// Initialize Privy API (you'll need to add your app secret to environment variables)
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cm9jucpzl050yl20mzx8tiq6i"

if (!PRIVY_APP_SECRET) {
  console.warn('PRIVY_APP_SECRET not found in environment variables')
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json()
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      )
    }

    // Verify the access token with Privy
    if (!PRIVY_APP_SECRET) {
      console.error('PRIVY_APP_SECRET is required for production')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    try {
      const client = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET)
      const user = await client.verifyAuthToken(accessToken)
      console.log('User verified:', user.userId)
      
      // Here you would typically save user data to your database
      // For now, we'll just return success
      return NextResponse.json({
        success: true,
        userId: user.userId,
        message: 'User registered successfully'
      })
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error in privy auth route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}