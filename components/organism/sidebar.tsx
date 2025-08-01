"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, Trophy, User, LogOut, Settings, ArrowLeftRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useRef } from "react";
import { useLogin } from "@privy-io/react-auth";
import Image from "next/image";

export function Sidebar() {
  const pathname = usePathname();
  const { logout, profile } = useAuth();
  const [profileHover, setProfileHover] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const { login } = useLogin();
  
  // Debug logging
  console.log('[Sidebar] Profile:', profile);
  console.log('[Sidebar] Is admin?', profile?.admin);

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      iconSrc: "/logo.svg",
      isLogo: true,
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
    ...(profile?.admin
      ? [
          {
            name: "Admin",
            href: "/admin",
            icon: Settings,
            iconSrc:
              "https://cdn.builder.io/api/v1/image/assets/TEMP/admin-icon?placeholderIfAbsent=true",
          },
          {
            name: "Trade",
            href: "/trade",
            icon: ArrowLeftRight,
            iconSrc:
              "https://cdn.builder.io/api/v1/image/assets/TEMP/trade-icon?placeholderIfAbsent=true",
          },
        ]
      : []),
    {
      name: "Your profile",
      href: "/profile",
      icon: User,
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/7b2ea1e28ce75fd35e035da9d09a2ac3dae1390d?placeholderIfAbsent=true",
      isProfile: true,
    },
  ];

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block group/sidebar">
      <div className="overflow-visible relative py-5 text-sm font-semibold rounded-xl border border-solid bg-slate-900 bg-opacity-40 group-hover/sidebar:bg-opacity-70 border-white border-opacity-10 w-[70px] group-hover/sidebar:w-auto group-hover/sidebar:min-w-[160px] group-hover/sidebar:max-w-[280px] transition-all duration-300 ease-in-out">
        {/* Grain texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[.05] rounded-xl"
          style={{
            backgroundImage: "url('/grainbg.avif')",
            backgroundRepeat: "repeat",
          }}
        />

        <div className="relative z-20 space-y-2.5 group">
          {navigationItems.map((item) => {
            // For the profile item, consider both /profile and /settings as active
            const isProfileActive =
              item.isProfile &&
              (pathname.startsWith("/profile") || pathname.startsWith("/settings"));

            const isActive =
              isProfileActive ||
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            if (item.isProfile) {
              // Not logged in: show Login
              if (!profile) {
                return (
                  <div
                    key="login"
                    className="flex overflow-hidden gap-2.5 items-center py-3.5 w-full transition-colors relative cursor-pointer group/item"
                    onClick={login}
                  >
                    <div className="flex items-center gap-2.5 ml-4 mr-4">
                      <img
                        src={item.iconSrc}
                        className="object-contain shrink-0 w-8 aspect-square rounded-full"
                        alt="Login"
                      />
                      <div className="self-stretch my-auto bg-clip-text text-white whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 ease-in-out">
                        Login
                      </div>
                    </div>
                  </div>
                );
              }

              // Logged in: show profile + submenu
              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => {
                    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                    setProfileHover(true);
                  }}
                  onMouseLeave={() => {
                    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                    hoverTimeout.current = setTimeout(() => setProfileHover(false), 120);
                  }}
                >
                  <Link
                    href={item.href}
                    className="flex overflow-hidden gap-2.5 items-center py-3.5 w-full transition-colors relative group/item"
                  >
                    {/* Blue indicator - fades when hovering other items */}
                    <div
                      className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full shadow-sm h-[36px] w-[8px] z-10 transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-500 opacity-100 group-hover:opacity-40 group-hover/item:!opacity-100"
                          : "bg-indigo-500 opacity-0 group-hover/item:opacity-100"
                      }`}
                    />

                    <div className="flex items-center gap-2.5 ml-4 mr-4">
                      <img
                        src={profile?.avatar || item.iconSrc}
                        className="object-cover shrink-0 w-8 h-8 rounded-full border border-white/10"
                        alt="Profile"
                      />
                      <div className="self-stretch my-auto bg-clip-text text-white whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 ease-in-out overflow-hidden text-ellipsis">
                        {profile?.username || item.name}
                      </div>
                    </div>
                  </Link>
                  {/* Submenu */}
                  <div
                    className={`
                      absolute left-[calc(100%-12px)] top-1/2 -translate-y-1/2 min-w-[120px] border border-white border-opacity-10 rounded-lg shadow-lg py-2 px-2 flex flex-col gap-1 transition-all duration-200 bg-slate-900 bg-opacity-40 hover:bg-opacity-70
                      ${profileHover ? "opacity-100 pointer-events-auto translate-x-0" : "opacity-0 pointer-events-none -translate-x-2"}
                    `}
                    style={{
                      backgroundRepeat: "repeat",
                      backdropFilter: "blur(2px)",
                      WebkitBackdropFilter: "blur(2px)",
                    }}
                  >
                    {/* Grain texture overlay */}
                    <div
                      className="pointer-events-none absolute inset-0 z-10 opacity-[.05] rounded-lg"
                      style={{
                        backgroundImage: "url('/grainbg.avif')",
                        backgroundRepeat: "repeat",
                      }}
                    />

                    <div className="relative z-20 group/submenu">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-2 py-2 rounded text-white text-sm relative group/subitem"
                      >
                        <div
                          className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full shadow-sm h-[24px] w-[4px] z-10 transition-all duration-200 ${
                            pathname === "/profile"
                              ? "bg-indigo-500 opacity-100 group-hover/submenu:opacity-40 group-hover/subitem:!opacity-100"
                              : "bg-indigo-500 opacity-0 group-hover/subitem:opacity-100"
                          }`}
                        />
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-2 py-2 rounded text-white text-sm relative group/subitem"
                      >
                        <div
                          className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full shadow-sm h-[24px] w-[4px] z-10 transition-all duration-200 ${
                            pathname === "/settings"
                              ? "bg-indigo-500 opacity-100 group-hover/submenu:opacity-40 group-hover/subitem:!opacity-100"
                              : "bg-indigo-500 opacity-0 group-hover/subitem:opacity-100"
                          }`}
                        />
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 px-2 py-2 rounded hover:bg-red-900/40 text-red-400 text-sm transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // Default nav item
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex overflow-hidden gap-2.5 items-center py-3.5 w-full transition-colors relative group/item"
              >
                {/* Blue indicator - fades when hovering other items */}
                <div
                  className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full shadow-sm h-[36px] w-[8px] z-10 transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-500 opacity-100 group-hover:opacity-40 group-hover/item:!opacity-100"
                      : "bg-indigo-500 opacity-0 group-hover/item:opacity-100"
                  }`}
                />

                <div className="flex items-center gap-2.5 ml-4 mr-4">
                  {item.isLogo ? (
                    <Image
                      src={item.iconSrc}
                      alt={item.name}
                      width={32}
                      height={32}
                      className="shrink-0"
                    />
                  ) : item.name === "Trade" ? (
                    <ArrowLeftRight className="object-contain shrink-0 w-8 h-8 text-white" />
                  ) : (
                    <img
                      src={item.iconSrc}
                      className="object-contain shrink-0 w-8 aspect-square"
                      alt={item.name}
                    />
                  )}
                  <div className="self-stretch my-auto bg-clip-text text-white whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 ease-in-out">
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