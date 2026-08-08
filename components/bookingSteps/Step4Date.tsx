"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion } from "framer-motion";

import { useBooking } from "@/context/BookingContext";
import LuxuryButton from "@/components/ui/LuxuryButton";

const DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Step3Date() {
  const {
    booking,
    setDate,
    previousStep,
    nextStep,
  } = useBooking();

  const today = useMemo(() => startOfDay(new Date()), []);

  const initialDate = booking.date
    ? startOfDay(booking.date)
    : today;

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(
      initialDate.getFullYear(),
      initialDate.getMonth(),
      1
    )
  );

  const selectedDate = booking.date
    ? startOfDay(booking.date)
    : null;

  const firstDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1
  );

  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0
  ).getDate();

  const mondayOffset = (firstDay.getDay() + 6) % 7;

  const calendarDays = [
    ...Array(mondayOffset).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => index + 1
    ),
  ];

  const canGoPrevious =
    visibleMonth.getFullYear() > today.getFullYear() ||
    (visibleMonth.getFullYear() === today.getFullYear() &&
      visibleMonth.getMonth() > today.getMonth());

  const handlePreviousMonth = () => {
    if (!canGoPrevious) return;

    setVisibleMonth(
      new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() - 1,
        1
      )
    );
  };

  const handleNextMonth = () => {
    setVisibleMonth(
      new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() + 1,
        1
      )
    );
  };

  const handleSelectDate = (day: number) => {
    const date = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day
    );

    if (date < today) return;

    setDate(date);
  };

  return (
    <div>
      {/* Heading */}
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.4em] text-[#D4AF37]">
          Step 4
        </p>

        <h2 className="mt-3 text-4xl font-light text-white md:text-5xl">
          Choose Your Date
        </h2>

        <p className="mt-4 max-w-2xl text-white/50">
          Select a convenient date for your luxury treatment.
        </p>
      </div>

      {/* Calendar */}
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
        {/* Month Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePreviousMonth}
            disabled={!canGoPrevious}
            aria-label="Previous month"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-[#D4AF37]/50 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-20"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center">
            <p className="text-2xl font-light text-white">
              {MONTHS[visibleMonth.getMonth()]}
            </p>

            <p className="mt-1 text-sm text-white/40">
              {visibleMonth.getFullYear()}
            </p>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekdays */}
        <div className="mb-3 grid grid-cols-7 gap-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs uppercase tracking-[0.15em] text-white/30"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-square"
                />
              );
            }

            const date = new Date(
              visibleMonth.getFullYear(),
              visibleMonth.getMonth(),
              day
            );

            const disabled = date < today;

            const selected =
              selectedDate !== null &&
              isSameDay(date, selectedDate);

            const isToday = isSameDay(date, today);

            return (
              <motion.button
                key={day}
                type="button"
                disabled={disabled}
                onClick={() => handleSelectDate(day)}
                whileHover={
                  disabled ? undefined : { scale: 1.05 }
                }
                whileTap={
                  disabled ? undefined : { scale: 0.95 }
                }
                className={`relative aspect-square rounded-2xl border text-sm transition-all duration-300 ${
                  selected
                    ? "border-[#D4AF37] bg-[#D4AF37] text-black shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
                    : disabled
                    ? "cursor-not-allowed border-transparent text-white/15"
                    : "border-white/5 bg-white/[0.03] text-white/70 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 hover:text-white"
                }`}
              >
                {day}

                {isToday && !selected && (
                  <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#D4AF37]" />
                )}

                {selected && (
                  <span className="absolute right-1.5 top-1.5">
                    <Check size={11} />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Date */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35">
            Selected Date
          </p>

          <p className="mt-2 text-lg text-[#D4AF37]">
            {selectedDate
              ? selectedDate.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Please select a date"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <LuxuryButton
          onClick={previousStep}
          variant="glass"
        >
          â† Back
        </LuxuryButton>

        <LuxuryButton
          onClick={nextStep}
          disabled={!booking.date}
        >
          Continue â†’
        </LuxuryButton>
      </div>
    </div>
  );
}
