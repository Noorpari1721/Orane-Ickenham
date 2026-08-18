"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";

type MyAccountButtonProps = {
  variant?: "home" | "booking";
  scrolled?: boolean;
};

export default function MyAccountButton({
  variant = "home",
  scrolled = false,
}: MyAccountButtonProps) {
  if (variant === "booking") {
    return (
      <Link
        href="/account"
        aria-label="My Account"
        className="
          group
          flex
          shrink-0
          items-center
          gap-1.5
          rounded-full
          px-1.5
          py-2
          text-sm
          font-medium
          tracking-wide
          sm:gap-3
          sm:px-4
          sm:py-2.5
          sm:text-lg
          text-white/80
          transition-all
          duration-500
          hover:-translate-y-0.5
          hover:bg-white/10
          hover:text-[#D4AF37]
          hover:shadow-[0_0_30px_rgba(212,175,55,.28)]
          hover:[text-shadow:0_0_18px_rgba(212,175,55,.35)]
        "
      >
        <UserRound
          size={18}
          aria-hidden="true"
          className="
            h-[18px]
            w-[18px]
            shrink-0
            transition-all
            duration-500
            sm:h-[21px]
            sm:w-[21px]
            group-hover:scale-110
            group-hover:rotate-3
            group-hover:drop-shadow-[0_0_9px_rgba(212,175,55,.6)]
          "
        />

        <span>My Account</span>
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      aria-label="My Account"
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
      <UserRound
        size={18}
        aria-hidden="true"
        className="
          transition-transform
          duration-300
          group-hover:scale-110
        "
      />

      <span>My Account</span>
    </Link>
  );
}