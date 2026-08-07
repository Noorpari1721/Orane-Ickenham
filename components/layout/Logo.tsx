"use client";

import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center"
    >
      <span
        className="
          text-3xl
          font-light
          tracking-[0.35em]
          text-[#F5E6C8]
          transition-all
          duration-300
          group-hover:text-[#D4AF37]
        "
      >
        ORANE
      </span>
    </Link>
  );
}