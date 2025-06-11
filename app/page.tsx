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
    </main>
  );
}
