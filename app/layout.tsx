import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import "./privy-overrides.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { PrivyProvider } from "@/components/auth/privy-provider"
import { Toaster } from "sonner"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Huch - CS2 Skin Loans",
  description: "Lend money, backed with CS2 skins. Huch."
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} bg-[#0f0f13] text-white`}>
        <PrivyProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </PrivyProvider>
      </body>
    </html>
  )
}
