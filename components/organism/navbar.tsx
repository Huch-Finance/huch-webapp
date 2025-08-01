"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { AuthButton } from "@/components/auth/auth-button";

/*
const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const defaultTextColor = "text-gray-300";
  const hoverTextColor = "text-white";
  const textSizeClass = "text-sm";

  return (
    <Link
      href={href}
      className={`group relative inline-block overflow-hidden min-h-[2em] flex items-center justify-center px-3 ${textSizeClass}`}
      style={{ height: "2em" }}
    >
      <div className="flex flex-col transition-transform duration-400 ease-out group-hover:-translate-y-1/2">
        <span className={`${defaultTextColor} py-1`}>{children}</span>
        <span className={`${hoverTextColor} py-1`}>{children}</span>
      </div>
    </Link>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState("rounded-full");
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { profile } = useAuth();

  const toggleMenu = () => setIsOpen((v) => !v);

  useEffect(() => {
    if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current);

    if (isOpen) {
      setHeaderShapeClass("rounded-xl");
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass("rounded-full");
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current);
    };
  }, [isOpen]);

  const logoElement = (
    <Image src="/logo.svg" alt="Huch Logo" width={28} height={28} />
  );

  const navLinksData = [
    ...(profile?.admin ? [{ label: "Admin", href: "/admin" }] : []),
    { label: "Home", href: "/" },
    { label: "Borrow", href: "/borrow" },
    { label: "Ranking", href: "/ranking" },
    { label: "Trade", href: "/trade" },
  ];

  return (
    <header
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center pl-6 pr-6 py-3 backdrop-blur-sm
      ${headerShapeClass} border border-[#FFFFFF] bg-[#0F0F2A] border-opacity-10 bg-opacity-70 w-full max-w-xl sm:max-w-2xl lg:max-w-3xl transition-[border-radius] duration-0 ease-in-out rounded-inherit overflow-hidden`}
    >
      {/* Overlay grain *//*}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-[.05] rounded-inherit w-full h-full"
        style={{
          backgroundImage: "url('/grainbg.avif')",
          backgroundRepeat: "repeat"
        }}
      />
      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8 relative z-20">
        <Link href="/" className="flex items-center">
          {logoElement}
        </Link>

        <nav className="hidden sm:flex items-center space-x-6 sm:space-x-8 text-sm">
          {navLinksData.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative inline-flex items-center justify-center min-h-[2em] px-3 text-gray-300 hover:text-white transition-colors"
              style={{ height: "2em" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          <AuthButton />
        </div>

        <button
          className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-300 focus:outline-none"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          )}
        </button>
      </div>

      <div
        className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
        ${isOpen ? "max-h-[1000px] opacity-100 pt-4" : "max-h-0 opacity-0 pt-0 pointer-events-none"}`}
      >
        <nav className="flex flex-col items-center space-y-4 text-base w-full">
          {navLinksData.map((link) => (
            <Link key={link.href} href={link.href} className="text-gray-300 hover:text-white transition-colors w-full text-center" onClick={() => setIsOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-center space-y-4 mt-4 w-full">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
*/

export function Navbar() {
  return null;
}