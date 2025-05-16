"use client"

import type React from "react"

import { PrivyProvider as PrivyClientProvider } from "@privy-io/react-auth"
import { PRIVY_APP_ID, isPrivyConfigured } from "@/lib/privy"

interface PrivyProviderProps {
  children: React.ReactNode
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  if (!isPrivyConfigured) {
    return <>{children}</>
  }

  const config = {
    appId: PRIVY_APP_ID,
    loginMethods: ["email", "wallet", "google"],
    embedded: {
      solana: {
          createOnLogin: 'users-without-wallets',
      },
    },
    appearance: {
      theme: "dark",
      accentColor: "#5D5FEF",
      logo: "/logo.svg",
      showWalletLoginFirst: true,
      variables: {
        colorBackground: "#0f0f13",
        colorText: "#ffffff",
        colorTextSecondary: "#a0a0a0",
        colorTextTertiary: "#6c6c6c",
        colorBorder: "#2A2A2A",
        borderWidth: "1px",
        borderRadius: "8px",
        fontFamily: "Inter, sans-serif",
      },
    },
    additionalMetadata: [
      {
        name: "steamId",
        displayName: "Steam ID",
        description: "Your Steam ID to access your CS2 inventory",
        required: false,
      },
      {
        name: "username",
        displayName: "Username",
        description: "Your display name on Huch",
        required: true,
      },
    ],
  }

  return <PrivyClientProvider {...config}>{children}</PrivyClientProvider>
}
