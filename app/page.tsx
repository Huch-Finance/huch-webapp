"use client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { motion } from "framer-motion"
import { Footer } from "@/components/footer"

export default function Home() {
  const { isAuthenticated, login } = useAuth()

  return (
    <main className="min-h-screen flex flex-col bg-[#0f0f13]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-4 md:pt-32 md:pb-6 px-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-[#1a1a1f] rounded-full px-4 py-2 text-sm text-white"
              >
                <img src="/solana-sol-logo.png" alt="Solana" className="h-4 w-4" />
                <span>Built on Solana</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-6xl font-medium leading-tight tracking-tight text-white"
              >
                Play on, <br/><span className="gradient-text">Cash out</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-xl text-gray-300"
              >
                Use your CS2 skins as collateral
                <br />
                and keep your gaming inventory
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {isAuthenticated ? (
                  <Link href="/borrow">
                    <Button className="bg-[#5D5FEF] hover:bg-[#4A4CDF] transition-colors text-white px-6 py-3 rounded-lg font-medium">
                      Borrow Now
                      <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={login}
                    className="bg-[#5D5FEF] hover:bg-[#4A4CDF] transition-colors text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Connect Wallet
                    <ArrowRight className="ml-2" />
                  </Button>
                )}
              </motion.div>
            </div>

            <div className="lg:block hidden relative h-[600px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[500px] h-[500px]">
                  {/* Background Logo */}
                  <Image
                    src="/logo.svg"
                    alt="Background Logo"
                    width={500}
                    height={500}
                    className="absolute top-0 left-0 w-full h-full"
                  />

                  {/* La modif pour l'awp comme tu le voulais, tu peux t'amuser à la pivoter mais en soit je la trouve bien comme ca */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    className="absolute top-[30%] left-[10%] transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: "400px",
                      height: "400px",
                      zIndex: 10,
                      transform: "translate(-50%, -50%) rotate(25deg)",
                    }}
                  >
                    <Image src="/awp.webp" alt="AWP Sniper Rifle" width={400} height={400} className="object-contain" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Avec dégradé qui part du bas de la page */}
      <section className="py-4 md:py-8 px-4 flex-grow mb-12">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            How it <span className="gradient-text">works</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-[#1a1a1f] p-6 rounded-lg gradient-border hover:bg-[#1a1a1f]/80 transition-colors duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-[#5D5FEF]/20 flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-[#5D5FEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-4">1. Connect your wallet</h3>
              <p className="text-gray-400 text-center">
                Connect with your email, wallet or social account to get started.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-[#1a1a1f] p-6 rounded-lg gradient-border hover:bg-[#1a1a1f]/80 transition-colors duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-[#5D5FEF]/20 flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-[#5D5FEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-4">2. Choose a skin as collateral</h3>
              <p className="text-gray-400 text-center">
                Select one or more skins from your inventory as collateral for your loan.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-[#1a1a1f] p-6 rounded-lg gradient-border hover:bg-[#1a1a1f]/80 transition-colors duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-[#5D5FEF]/20 flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-[#5D5FEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-4">3. Borrow and earn rewards</h3>
              <p className="text-gray-400 text-center">
                Receive your loan instantly in USDC and earn points to climb the Huch ranking.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
