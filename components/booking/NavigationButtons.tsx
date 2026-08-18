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
        group
        inline-flex
        shrink-0
        items-center
        gap-1.5
        rounded-full
        border
        border-white/15
        bg-white/5
        px-3.5
        py-2
        text-xs
        font-medium
        text-white/75
        shadow-[0_8px_30px_rgba(0,0,0,.25)]
        backdrop-blur-xl
        transition-all
        duration-300
        sm:gap-2
        sm:px-5
        sm:py-2.5
        sm:text-sm
        hover:border-[#D4AF37]/60
        hover:bg-[#D4AF37]/10
        hover:text-[#D4AF37]
        hover:shadow-[0_8px_30px_rgba(212,175,55,.15)]
        active:scale-95
      "
    >
      <ArrowLeft
        size={15}
        className="transition-transform duration-300 group-hover:-translate-x-1 sm:h-4 sm:w-4"
      />

      <span>Back</span>
    </button>
  );
}