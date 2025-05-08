import Image from "next/image"

export function Footer() {
  return (
    <footer className="py-8 border-t border-[#2A2A2A] bg-[#0f0f13]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center">
            <Image src="/logo.svg" alt="Huch" width={30} height={30} />
            <span className="text-xl font-bold ml-2">Huch.</span>
          </div>
          <div className="text-sm text-gray-400">© 2025 Huch. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
