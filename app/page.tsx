"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SolanaTransfer } from "@/components/SolanaTransfer";
import { Footer } from "@/components/organism/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Image
            src="/awp.webp"
            alt="AWP Sniper Rifle"
            width={400}
            height={400}
            className="object-contain"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-4 md:py-8 px-4 flex-grow mb-12">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            How it <span className="gradient-text">works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-white rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-4">
                Step 1: Connect Wallet
              </h3>
              <p className="text-gray-600">
                Connect your wallet to start trading.
              </p>
            </motion.div>
            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-white rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-4">
                Step 2: Choose Asset
              </h3>
              <p className="text-gray-600">
                Select the asset you want to trade.
              </p>
            </motion.div>
            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-white rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-4 pt-4 overflow-hidden">
                Step 3: Start Trading
              </h3>
              <p className="text-gray-600">
                Begin trading with your chosen asset.
              </p>
              <SolanaTransfer />
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
