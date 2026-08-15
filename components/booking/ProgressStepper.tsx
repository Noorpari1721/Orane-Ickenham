"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

const steps = [
  "Service",
  "Treatment",
  "Date",
  "Time",
  "Details",
  "Review",
  "Payment",
];

export default function ProgressStepper() {
  const { booking } = useBooking();

  return (
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
              <motion.div
                animate={
                  active
                    ? {
                        boxShadow: [
                          "0 0 0 rgba(212,175,55,0)",
                          "0 0 24px rgba(212,175,55,.38)",
                          "0 0 0 rgba(212,175,55,0)",
                        ],
                      }
                    : undefined
                }
                transition={{
                  duration: 3,
                  repeat: active ? Infinity : 0,
                  repeatDelay: 7,
                  ease: "easeInOut",
                }}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500 ${
                  completed
                    ? "border-[#D4AF37] bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,.20)]"
                    : active
                    ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]"
                    : "border-white/20 bg-white/5 text-white/40"
                }`}
              >
                {completed ? (
                  <Check size={18} />
                ) : (
                  number
                )}
              </motion.div>

              <span
                className={`mt-3 text-xs uppercase tracking-[0.2em] transition ${
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
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      booking.step > number
                        ? "100%"
                        : "0%",
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,.35)]"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
