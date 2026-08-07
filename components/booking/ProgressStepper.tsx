"use client";

import { Check } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

const steps = [
  "Service",
  "Treatment",
  "Staff",
  "Date",
  "Time",
  "Details",
  "Review",
  "Payment",
];

export default function ProgressStepper() {
  const { booking } = useBooking();

  return (
    <div className="mb-10">

      <div className="flex items-center justify-between">

        {steps.map((step, index) => {

          const number = index + 1;

          const completed = booking.step > number;
          const active = booking.step === number;

          return (
            <div
              key={step}
              className="flex flex-1 items-center"
            >

              <div className="flex flex-col items-center">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500

                  ${
                    completed
                      ? "bg-[#D4AF37] border-[#D4AF37] text-black"
                      : active
                      ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,.45)]"
                      : "border-white/20 bg-white/5 text-white/40"
                  }`}
                >

                  {completed ? (
                    <Check size={18} />
                  ) : (
                    number
                  )}

                </div>

                <span
                  className={`mt-3 text-xs tracking-[0.2em] uppercase transition

                  ${
                    active
                      ? "text-[#D4AF37]"
                      : completed
                      ? "text-white"
                      : "text-white/40"
                  }`}
                >
                  {step}
                </span>

              </div>

              {index !== steps.length - 1 && (

                <div className="mx-3 h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">

                  <div
                    className={`h-full bg-[#D4AF37] transition-all duration-700

                    ${
                      booking.step > number
                        ? "w-full"
                        : "w-0"
                    }`}
                  />

                </div>

              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}