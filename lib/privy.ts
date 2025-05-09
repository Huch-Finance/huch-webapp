//là je t'ai mis la clé en dur sinon avec les .env on va jamais s'en sortir
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
}

export type AuthStatus = "authenticated" | "unauthenticated" | "loading"
