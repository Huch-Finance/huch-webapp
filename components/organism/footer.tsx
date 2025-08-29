import Image from "next/image"

export function Footer() {
  return (
    <footer className="mt-auto py-4 border-t border-[#2A2A2A] bg-[#0f0f13]/50 lg:ml-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center">
            <Image src="/logo.svg" alt="Huch" width={24} height={24} />
            <span className="text-sm font-medium ml-2">Huch.</span>
          </div>
          <div className="text-xs text-gray-500">© 2025 Huch. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}