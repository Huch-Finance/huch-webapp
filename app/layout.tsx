import type React from "react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "./privy-overrides.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { PrivyProvider } from "@/components/auth/privy-provider";
import { Sidebar } from "@/components/organism/sidebar";
import { MobileMenu } from "@/components/organism/hamburger";
import { Footer } from "@/components/organism/footer";
import { Toaster } from "sonner";
import { BeamsBackground } from "@/components/bg/beams-background";
import { ActiveTradeIndicator } from "@/components/trade/active-trade-indicator";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Huch.",
  description: "Lend money, backed with CS2 skins. Huch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className={`${poppins.variable} font-poppins text-white relative`}>
        {/* Background image */}
        <img
          src="/background.png"
          alt=""
          className="fixed inset-0 w-full h-full object-cover -z-10"
          aria-hidden="true"
        />
        {/* <BeamsBackground /> */}
        <PrivyProvider>
          <Sidebar />
          <MobileMenu />
          <ActiveTradeIndicator />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={false}
            disableTransitionOnChange
          >
            <main className="">{children}</main>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
          {/* <Footer/> */}
        </PrivyProvider>
      </body>
    </html>
  );
}
