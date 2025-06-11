"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, Trophy, User, LogOut, Settings, Menu, X, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLogin } from "@privy-io/react-auth";
import Image from "next/image";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { logout, profile } = useAuth();
  const { login } = useLogin();

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
      iconSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/ba0d2e40a26d9aad3177c934d7697d1b490f6151?placeholderIfAbsent=true",
    },
    {
      name: "Ranking",
      href: "/ranking",
      icon: Trophy,
      iconSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/691d969a723a11d0b84423c62387278ffb806c49?placeholderIfAbsent=true",
    },
    ...(profile?.admin ? [
      {
        name: "Admin",
        href: "/admin",
        icon: Settings,
        iconSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/admin-icon?placeholderIfAbsent=true",
      },
      {
        name: "Trade",
        href: "/trade",
        icon: CreditCard,
        iconSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/trade-icon?placeholderIfAbsent=true",
      }
    ] : []),
    {
      name: "Your profile",
      href: "/profile",
      icon: User,
      iconSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/7b2ea1e28ce75fd35e035da9d09a2ac3dae1390d?placeholderIfAbsent=true",
      isProfile: true,
    },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 lg:hidden flex items-center justify-center w-14 h-14 bg-slate-900 bg-opacity-70 backdrop-blur-sm border border-white border-opacity-10 rounded-xl text-white hover:bg-opacity-90 transition-all duration-200"
      >
        {/* Grain texture overlay for button */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[.05] rounded-xl"
          style={{
            backgroundImage: "url('/grainbg.avif')",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="relative z-20">
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`
          fixed top-4 right-4 w-80 max-w-[90vw] bg-slate-900 bg-opacity-40 hover:bg-opacity-70 backdrop-blur-sm border border-white border-opacity-10 rounded-xl z-40 lg:hidden
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        `}
      >
        {/* Grain texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[.05] rounded-xl"
          style={{
            backgroundImage: "url('/grainbg.avif')",
            backgroundRepeat: "repeat",
          }}
        />

        <div className="relative z-20 p-6 pt-6 group">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
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
                      className="flex items-center gap-4 p-4 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-5 transition-colors relative group/item"
                      onClick={() => {
                        login();
                        closeMenu();
                      }}
                    >
                      <img
                        src={item.iconSrc}
                        className="object-contain shrink-0 w-8 h-8 rounded-full"
                        alt="Login"
                      />
                      <span className="text-white text-lg">Login</span>
                    </div>
                  );
                }

                // Logged in: show profile + dropdown
                return (
                  <div key={item.name} className="space-y-2">
                    <div
                      className="flex items-center gap-4 p-4 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-5 transition-colors relative group/item"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    >
                      {/* Blue indicator */}
                      <div className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full shadow-sm h-8 w-[6px] z-10 transition-all duration-200 ${
                        isActive 
                          ? 'bg-indigo-500 opacity-100' 
                          : 'bg-indigo-500 opacity-0 group-hover/item:opacity-100'
                      }`} />
                      
                      <img
                        src={profile?.avatar || item.iconSrc}
                        className="object-cover shrink-0 w-8 h-8 rounded-full border border-white/10"
                        alt="Profile"
                      />
                      <span className="text-white text-lg flex-1">
                        {profile?.username || item.name}
                      </span>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                          profileDropdownOpen ? "-rotate-90" : "rotate-90"
                        }`}
                      />
                    </div>

                    {/* Profile Dropdown */}
                    {profileDropdownOpen && (
                      <div className="ml-6 space-y-1 group/submenu">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors relative group/subitem"
                          onClick={closeMenu}
                        >
                          <div className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full shadow-sm h-6 w-[4px] z-10 transition-all duration-200 ${
                            pathname === "/profile" 
                              ? 'bg-indigo-500 opacity-100' 
                              : 'bg-indigo-500 opacity-0 group-hover/subitem:opacity-100'
                          }`} />
                          <User className="w-5 h-5 text-gray-300" />
                          <span className="text-white">Profile</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors relative group/subitem"
                          onClick={closeMenu}
                        >
                          <div className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full shadow-sm h-6 w-[4px] z-10 transition-all duration-200 ${
                            pathname === "/settings" 
                              ? 'bg-indigo-500 opacity-100' 
                              : 'bg-indigo-500 opacity-0 group-hover/subitem:opacity-100'
                          }`} />
                          <Settings className="w-5 h-5 text-gray-300" />
                          <span className="text-white">Settings</span>
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            closeMenu();
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-900/40 text-red-400 transition-colors w-full text-left"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Log out</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              // Default nav item
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors relative group/item"
                  onClick={closeMenu}
                >
                  {/* Blue indicator */}
                  <div className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full shadow-sm h-8 w-[6px] z-10 transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-500 opacity-100' 
                      : 'bg-indigo-500 opacity-0 group-hover/item:opacity-100'
                  }`} />
                  
                  {item.isLogo ? (
                    <Image
                      src={item.iconSrc}
                      alt={item.name}
                      width={32}
                      height={32}
                      className="shrink-0"
                    />
                  ) : (
                    <img
                      src={item.iconSrc}
                      className="object-contain shrink-0 w-8 h-8"
                      alt={item.name}
                    />
                  )}
                  <span className="text-white text-lg">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}