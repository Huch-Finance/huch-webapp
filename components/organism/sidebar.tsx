"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, Trophy, User } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/ef9b89828f190a1474a3f8bca941244fc53d28ba?placeholderIfAbsent=true",
    },
    {
      name: "Borrow",
      href: "/borrow",
      icon: CreditCard,
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/ba0d2e40a26d9aad3177c934d7697d1b490f6151?placeholderIfAbsent=true",
    },
    {
      name: "Ranking",
      href: "/ranking",
      icon: Trophy,
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/691d969a723a11d0b84423c62387278ffb806c49?placeholderIfAbsent=true",
    },
    {
      name: "Your profile",
      href: "/profile",
      icon: User,
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/7b2ea1e28ce75fd35e035da9d09a2ac3dae1390d?placeholderIfAbsent=true",
    },
  ];

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block group">
      <div className="overflow-hidden relative py-5 text-sm font-semibold rounded-xl border border-solid bg-slate-900 bg-opacity-40 group-hover:bg-opacity-70 border-white border-opacity-10 w-[80px] group-hover:w-[200px] transition-all duration-300 ease-in-out">
        {/* Grain texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[.05]"
          style={{
            backgroundImage: "url('/grainbg.avif')",
            backgroundRepeat: "repeat",
          }}
        />

        <div className="relative z-20 space-y-2.5">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex overflow-hidden gap-2.5 items-center py-3.5 w-full transition-colors hover:bg-white hover:bg-opacity-5 relative ${
                  isActive ? "bg-white bg-opacity-10" : ""
                }`}
              >
                {/* Blue indicator - only show for active page, thicker and on left edge */}
                {isActive && (
                  <div className="flex shrink-0 absolute left-0 top-1/2 transform -translate-y-1/2 bg-indigo-500 rounded-r-full shadow-sm h-[25px] w-[6px]" />
                )}

                <div className="flex items-center gap-2.5 ml-4">
                  <img
                    src={item.iconSrc}
                    className="object-contain shrink-0 w-8 aspect-square"
                    alt={item.name}
                  />

                  {/* Text that appears on hover */}
                  <div className="self-stretch my-auto bg-clip-text text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                    {item.name}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
