"use client";

import Link from "next/link";
import MyAccountButton from "./MyAccountButton";

type ActionButtonsProps = {
  scrolled: boolean;
};

export default function ActionButtons({
  scrolled,
}: ActionButtonsProps) {
  return (
    <>
      {/* My Account */}

      <MyAccountButton
        variant="home"
        scrolled={scrolled}
      />

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
    </>
  );
}