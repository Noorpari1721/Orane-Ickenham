"use client";

import Link from "next/link";
import { Phone } from "lucide-react";

type ActionButtonsProps = {
  scrolled: boolean;
};

export default function ActionButtons({
  scrolled,
}: ActionButtonsProps) {
  return (
    <>
      {/* Call Salon */}

      <a
        href="tel:01895217151"
        aria-label="Call Orane Ickenham"
        className={`
          group
          flex
          shrink-0
          items-center
          gap-2
          rounded-full
          border
          px-4
          py-2.5
          text-sm
          font-semibold
          uppercase
          tracking-[0.13em]
          text-[#D4AF37]
          backdrop-blur-2xl
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:scale-[1.03]
          hover:border-[#D4AF37]
          active:scale-95
          ${
            scrolled
              ? `
                border-[#D4AF37]/70
                bg-black/[0.72]
                shadow-[0_10px_30px_rgba(0,0,0,.48)]
                backdrop-blur-2xl
                backdrop-saturate-150
                hover:bg-black/[0.82]
                hover:shadow-[0_10px_30px_rgba(212,175,55,.22)]
              `
              : `
                border-[#D4AF37]/60
                bg-black/10
                shadow-[0_8px_25px_rgba(0,0,0,.12)]
                backdrop-blur-md
                hover:bg-[#D4AF37]/10
                hover:shadow-[0_10px_30px_rgba(212,175,55,.18)]
              `
          }
        `}
      >
        <Phone
          size={16}
          strokeWidth={1.8}
          className="
            transition-transform
            duration-300
            group-hover:rotate-[-8deg]
            group-hover:scale-110
          "
        />

        <span>Call Salon</span>
      </a>

      {/* Book Now */}

      <Link
        href="/booking"
        className="
          shrink-0
          rounded-full
          bg-[#C49A45]
          px-6
          py-2.5
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
    </>
  );
}

