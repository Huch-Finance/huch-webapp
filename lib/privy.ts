export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cm9jucpzl050yl20mzx8tiq6i"
export const isPrivyConfigured = !!PRIVY_APP_ID

export type UserProfile = {
  id: string
  email?: string
  wallet?: string
  steamId?: string
  username?: string
  avatar?: string
  tradeLink?: string
  admin?: boolean
}

export type AuthStatus = "authenticated" | "unauthenticated" | "loading"
