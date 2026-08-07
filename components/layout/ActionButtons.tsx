"use client";

import Link from "next/link";
import { User } from "lucide-react";

type ActionButtonsProps = {
  scrolled: boolean;
};

export default function ActionButtons({
  scrolled,
}: ActionButtonsProps) {
  return (
    <div className="hidden items-center gap-4 lg:flex">

      {/* My Account */}

      <Link
        href="/account"
        className={`
          group
          flex
          items-center
          gap-2
          rounded-full
          border
          px-5
          py-3
          text-sm
          font-medium
          transition-all
          duration-300
          backdrop-blur-xl

          ${
            scrolled
              ? "border-black/10 bg-white/60 text-[#1A1A1A] hover:bg-white"
              : "border-white/20 bg-white/10 text-white hover:bg-white/20"
          }
        `}
      >
        <User
          size={18}
          className="transition-transform duration-300 group-hover:scale-110"
        />

        <span>My Account</span>
      </Link>

      {/* Book Now */}

      <Link
        href="/booking"
        className="
          rounded-full
          bg-[#C49A45]
          px-7
          py-3
          text-sm
          font-semibold
          uppercase
          tracking-[0.18em]
          text-white
          shadow-lg
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:scale-105
          hover:bg-[#B78D35]
          hover:shadow-[0_12px_30px_rgba(196,154,69,.35)]
        "
      >
        Book Now
      </Link>

    </div>
  );
}