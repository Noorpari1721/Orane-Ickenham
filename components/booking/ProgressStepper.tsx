"use client";

import { useEffect, useRef } from "react";
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

  const activeStepRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeStepRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [booking.step]);

  return (
    <div
      className="
        overflow-x-auto
        overscroll-x-contain
        scrollbar-thin
        scrollbar-track-transparent
        scrollbar-thumb-white/10
        [-ms-overflow-style:none]
        [scrollbar-width:thin]
      "
    >
      <div
        className="
          flex
          min-w-[620px]
          items-start
          px-2
          sm:min-w-0
          sm:px-0
        "
      >
        {steps.map((step, index) => {
          const number = index + 1;

          const completed = booking.step > number;
          const active = booking.step === number;

          return (
            <div
              key={step}
              ref={active ? activeStepRef : undefined}
              className="flex min-w-[84px] flex-1 items-start"
            >
              <div className="flex min-w-0 flex-col items-center">
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
                  className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    text-sm
                    transition-all
                    duration-500
                    sm:h-12
                    sm:w-12
                    sm:text-base
                    ${
                      completed
                        ? "border-[#D4AF37] bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,.20)]"
                        : active
                        ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]"
                        : "border-white/20 bg-white/5 text-white/40"
                    }
                  `}
                >
                  {completed ? <Check size={17} /> : number}
                </motion.div>

                <span
                  className={`
                    mt-2
                    whitespace-nowrap
                    text-[9px]
                    uppercase
                    tracking-[0.12em]
                    transition
                    sm:mt-3
                    sm:text-xs
                    sm:tracking-[0.2em]
                    ${
                      active
                        ? "text-[#D4AF37]"
                        : completed
                        ? "text-white"
                        : "text-white/40"
                    }
                  `}
                >
                  {step}
                </span>
              </div>

              {index !== steps.length - 1 && (
                <div className="mx-2 mt-5 h-[2px] min-w-[18px] flex-1 overflow-hidden rounded-full bg-white/10 sm:mx-3 sm:mt-6">
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
    </div>
  );
}