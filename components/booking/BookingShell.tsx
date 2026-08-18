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
    <main className="relative min-h-screen overflow-x-clip bg-[#080808] pt-20 md:pt-0">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#D4AF37]/10 blur-[180px]" />

        <div className="absolute left-1/2 top-1/3 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#D4AF37]/[0.035] blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        <div
          data-booking-container="true"
          className="
            relative
            overflow-clip
            rounded-[24px]
            border
            border-white/10
            bg-white/[0.035]
            shadow-[0_30px_100px_rgba(0,0,0,.50)]
            backdrop-blur-3xl
            sm:rounded-[30px]
            lg:rounded-[38px]
          "
        >

          {/* =====================================================
              BOOKING HEADER
          ===================================================== */}

          <div
            className="
              rounded-t-[24px]
              border-b
              border-white/10
              px-4
              py-5
              sm:rounded-t-[30px]
              sm:px-6
              sm:py-6
              lg:rounded-t-[38px]
              lg:px-9
            "
          >
            <div
              className="
                flex flex-col gap-4 sm:flex-row
                sm:items-center
                sm:justify-between
                sm:gap-6
              "
            >
              <div className="min-w-0 max-w-full overflow-hidden">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#D4AF37] sm:text-sm sm:tracking-[0.45em]">
                  ORANE ICKENHAM
                </p>

                <h1 className="mt-2 text-2xl font-light leading-tight text-white sm:text-3xl">
                  Luxury Booking Experience
                </h1>
              </div>

              <div className="flex w-full min-w-0 shrink-0 items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
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
                    px-3 py-1.5 sm:px-5 sm:py-2.5
                  "
                >
                  <span className="text-xs text-[#D4AF37] sm:text-sm">
                    Step {booking.step} / 7
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* =====================================================
              PROGRESS STEPPER
          ===================================================== */}

          <div className="border-b border-white/10 px-3 py-4 sm:px-6 sm:py-5 lg:px-9 lg:py-6">
            <div className="overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-none">
              <div className="min-w-[680px] lg:min-w-0">
                <ProgressStepper />
              </div>
            </div>
          </div>

          {/* =====================================================
              CONTENT + SUMMARY
          ===================================================== */}

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

            {/* Main booking content */}

            <div
              className="
                min-w-0
                border-b
                border-white/10
                px-4 py-5 sm:p-6 lg:border-b-0
                lg:border-r
                lg:p-9
              "
            >
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

            {/* Booking summary */}

            {booking.step !== 7 && (
              <div
                className="
                  relative
                  self-stretch
                  bg-black/20
                  px-4 pb-6 pt-6 sm:px-6
                  sm:pb-8
                  sm:pt-8
                  lg:px-8
                  lg:pb-8
                  lg:pt-8
                "
              >
                <div className="lg:sticky lg:top-8">
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