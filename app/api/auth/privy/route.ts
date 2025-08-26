import { NextRequest, NextResponse } from 'next/server'
import { PrivyApi } from '@privy-io/server-auth'

// Initialize Privy API (you'll need to add your app secret to environment variables)
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET

if (!PRIVY_APP_SECRET) {
  console.warn('PRIVY_APP_SECRET not found in environment variables')
}

const privy = new PrivyApi({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cm9jucpzl050yl20mzx8tiq6i",
  appSecret: PRIVY_APP_SECRET || ""
})

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
    if (PRIVY_APP_SECRET) {
      try {
        const user = await privy.verifyAuthToken(accessToken)
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
    } else {
      // If no app secret, just return success for development
      console.log('Development mode: skipping token verification')
      return NextResponse.json({
        success: true,
        message: 'User registered successfully (dev mode)'
      })
    }
  } catch (error) {
    console.error('Error in privy auth route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}