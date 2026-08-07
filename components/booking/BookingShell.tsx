"use client";

import { ReactNode } from "react";

import { useBooking } from "@/context/BookingContext";

import ProgressStepper from "./ProgressStepper";
import BookingSummary from "./BookingSummary";

interface BookingShellProps {
  children: ReactNode;
}

export default function BookingShell({
  children,
}: BookingShellProps) {
  const { booking } = useBooking();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0D0D0D]">

      {/* Background */}

      <div className="absolute inset-0">

        <div className="absolute -top-60 -left-40 h-[520px] w-[520px] rounded-full bg-[#D4AF37]/10 blur-[170px]" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#B8924A]/10 blur-[180px]" />

      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-14">

        {/* Glass Container */}

        <div className="overflow-hidden rounded-[42px] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,.45)]">

          {/* Header */}

          <div className="border-b border-white/10 px-10 py-8">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm uppercase tracking-[0.45em] text-[#D4AF37]">
                  ORANE ICKENHAM
                </p>

                <h1 className="mt-2 text-4xl font-light text-white">
                  Luxury Booking Experience
                </h1>

              </div>

              <div className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-6 py-3">

                <span className="text-[#D4AF37]">
                  Step {booking.step} / 8
                </span>

              </div>

            </div>

          </div>

          {/* Progress */}

          <div className="border-b border-white/10 px-10 py-8">

            <ProgressStepper />

          </div>

          {/* Main Layout */}

          <div className="grid lg:grid-cols-[2fr_380px]">

            {/* Left */}

            <div className="border-r border-white/10 p-10">

              {children}

            </div>

            {/* Right */}

            <div className="bg-black/10 p-8">

              <BookingSummary />

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}