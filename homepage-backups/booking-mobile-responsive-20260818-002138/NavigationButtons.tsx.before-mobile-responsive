"use client";

import { ArrowLeft } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

export default function NavigationButtons() {
  const { booking, previousStep } = useBooking();

  if (booking.step <= 1) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={previousStep}
      className="
        group flex items-center gap-2
        rounded-full
        border border-white/15
        bg-white/5
        px-5 py-2.5
        text-sm font-medium
        text-white/75
        shadow-[0_8px_30px_rgba(0,0,0,.25)]
        backdrop-blur-xl
        transition-all duration-300
        hover:border-[#D4AF37]/60
        hover:bg-[#D4AF37]/10
        hover:text-[#D4AF37]
        hover:shadow-[0_8px_30px_rgba(212,175,55,.15)]
        active:scale-95
      "
    >
      <ArrowLeft
        size={16}
        className="transition-transform duration-300 group-hover:-translate-x-1"
      />

      <span>Back</span>
    </button>
  );
}

