"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";

export default function BookingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const glassPill =
    "flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white/80 transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]";

  return (
    <header
      className={`
        fixed
        left-0
        right-0
        top-0
        z-50
        transition-all
        duration-500
        ${
          scrolled
            ? "h-[72px] border-b border-white/10 bg-[#070707]/90 shadow-2xl backdrop-blur-xl"
            : "h-[84px] border-b border-white/5 bg-[#070707]/80 backdrop-blur-md"
        }
      `}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-10">

        {/* Logo */}
        <Link
          href="/"
          aria-label="Orane Ickenham Home"
          className="group flex items-center"
        >
          <span className="text-2xl font-semibold tracking-[0.28em] text-white transition duration-300 group-hover:text-[#D4AF37]">
            ORANE
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-3">

          {/* Home */}
          <Link
            href="/"
            className={glassPill}
          >
            Home
          </Link>

          {/* My Account */}
          <button
            type="button"
            className={glassPill}
          >
            <UserRound size={15} />
            <span>My Account</span>
          </button>

        </nav>
      </div>
    </header>
  );
}
