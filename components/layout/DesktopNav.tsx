"use client";

import Link from "next/link";
import { User } from "lucide-react";

import Logo from "./Logo";
import BookingNavLinks from "./BookingNavLinks";

export default function DesktopNav() {
  return (
    <div className="hidden lg:flex items-center justify-between w-full">

      {/* Left */}
      <Logo />

      {/* Center */}
      <nav className="flex items-center gap-10">
        <BookingNavLinks />
      </nav>

      {/* Right */}
      <div className="flex items-center gap-5">

        <Link
          href="/account"
          className="
            flex
            items-center
            gap-2
            text-sm
            font-medium
            tracking-wide
            text-white/80
            transition
            duration-300
            hover:text-[#D4AF37]
          "
        >
          <User size={18} />
          My Account
        </Link>

      </div>

    </div>
  );
}