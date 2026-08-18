"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useBooking } from "@/context/BookingContext";
import ProgressStepper from "./ProgressStepper";
import BookingSummary from "./BookingSummary";
import NavigationButtons from "./NavigationButtons";

interface BookingShellProps {
  children: ReactNode;
}

export default function BookingShell({
  children,
}: BookingShellProps) {
  const { booking } = useBooking();

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#080808]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#D4AF37]/10 blur-[180px]" />

        <div className="absolute left-1/2 top-1/3 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#D4AF37]/[0.035] blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-8">
        <div
          data-booking-container="true"
          className="
            relative
            overflow-clip
            rounded-[38px]
            border
            border-white/10
            bg-white/[0.035]
            shadow-[0_30px_100px_rgba(0,0,0,.50)]
            backdrop-blur-3xl
          "
        >
          <div className="rounded-t-[38px] border-b border-white/10 px-9 py-6">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.45em] text-[#D4AF37]">
                  ORANE ICKENHAM
                </p>

                <h1 className="mt-2 text-3xl font-light text-white">
                  Luxury Booking Experience
                </h1>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <NavigationButtons />

                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 rgba(212,175,55,0)",
                      "0 0 22px rgba(212,175,55,.16)",
                      "0 0 0 rgba(212,175,55,0)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 7,
                    ease: "easeInOut",
                  }}
                  className="
                    rounded-full
                    border
                    border-[#D4AF37]/25
                    bg-[#D4AF37]/10
                    px-5
                    py-2.5
                  "
                >
                  <span className="text-sm text-[#D4AF37]">
                    Step {booking.step} / 7
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 px-9 py-6">
            <ProgressStepper />
          </div>

          <div
            data-booking-scroll-area="true"
            className={`
              relative
              grid
              items-start
              ${
                booking.step === 7
                  ? "lg:grid-cols-1"
                  : "lg:grid-cols-[minmax(0,2fr)_380px]"
              }
            `}
          >
            <div className="min-w-0 border-r border-white/10 p-9">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {children}
              </motion.div>
            </div>

            {booking.step !== 7 && (
              <div
                className="
                  relative
                  self-stretch
                  bg-black/20
                  px-8
                  pb-8
                  pt-8
                "
              >
                <div className="sticky top-8">
                  <BookingSummary />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
