"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  CalendarDays,
  Clock3,
} from "lucide-react";
import type { ReactNode } from "react";
import { useBooking } from "@/context/BookingContext";
import { serviceCategories } from "@/data/services";

function getDurationMinutes(
  duration: unknown
) {
  if (
    typeof duration === "number" &&
    Number.isFinite(duration)
  ) {
    return Math.max(
      0,
      Math.round(duration)
    );
  }

  const raw =
    String(duration ?? "")
      .toLowerCase()
      .trim();

  if (!raw) {
    return 0;
  }

  const hoursMatch =
    raw.match(
      /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/
    );

  const minutesMatch =
    raw.match(
      /(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/
    );

  let totalMinutes = 0;

  if (hoursMatch) {
    totalMinutes +=
      Number(hoursMatch[1]) * 60;
  }

  if (minutesMatch) {
    totalMinutes +=
      Number(minutesMatch[1]);
  }

  if (
    !hoursMatch &&
    !minutesMatch
  ) {
    const numeric =
      Number.parseFloat(raw);

    if (
      Number.isFinite(numeric)
    ) {
      totalMinutes = numeric;
    }
  }

  return Math.max(
    0,
    Math.round(totalMinutes)
  );
}

function formatCategoryName(categoryId: string) {
  const category = serviceCategories.find(
    (item) => item.id === categoryId
  );

  if (category?.title) {
    return category.title;
  }

  return categoryId
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}

export default function BookingSummary() {
  const { booking } = useBooking();

  const selectedServices =
    booking.services?.length
      ? booking.services
      : booking.service
        ? [booking.service]
        : [];

  const totalDuration =
    selectedServices.reduce(
      (total, service) =>
        total +
        getDurationMinutes(
          service.duration
        ),
      0
    );
  const totalPrice =
    selectedServices.reduce(
      (total, service) =>
        total + Number(service.price ?? 0),
      0
    );

  const selectedServiceCategory =
    serviceCategories.find((category) =>
      category.services.some(
        (service) =>
          service.id === booking.service?.id
      )
    );

  const categoryId =
    booking.category ||
    selectedServiceCategory?.id ||
    "";

  const formattedDate = booking.date
    ? booking.date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Choose a date";

  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        w-full
        overflow-hidden
        rounded-[26px]
        border
        border-[#D4AF37]/30
        bg-gradient-to-b
        from-white/10
        via-white/5
        to-black/20
        p-5
        shadow-[0_0_35px_rgba(212,175,55,.14),0_25px_70px_rgba(0,0,0,.35)]
        backdrop-blur-3xl
        sm:rounded-[30px]
        sm:p-6
        lg:rounded-[34px]
        lg:p-8
      "
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <Sparkles
            size={17}
            className="shrink-0 text-[#D4AF37]"
          />

          <p className="text-[10px] uppercase tracking-[0.28em] text-[#D4AF37] sm:text-xs sm:tracking-[0.35em]">
            Your Experience
          </p>
        </div>

        <h3 className="mt-2 text-xl font-light text-white sm:text-2xl">
          Booking Summary
        </h3>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:space-y-6">

          <SummaryItem
            icon={<Sparkles size={18} />}
            title="Services"
            value={
              selectedServices.length > 0
                ? selectedServices
                    .map((service) => service.name)
                    .join(", ")
                : "Select a service"
            }
          />

          <SummaryItem
            icon={<Sparkles size={18} />}
            title="Duration"
            value={
              totalDuration > 0
                ? `${totalDuration} minutes`
                : "--"
            }
          />

          <SummaryItem
            icon={<CalendarDays size={18} />}
            title="Date"
            value={formattedDate}
          />

          <SummaryItem
            icon={<Clock3 size={18} />}
            title="Time"
            value={
              booking.time ||
              "Choose a time"
            }
          />
        </div>

        <div className="my-6 h-px bg-white/10 sm:my-7" />

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/50 sm:text-xs sm:tracking-[0.25em]">
              Total
            </p>

            <p className="mt-1 text-xs text-white/40">
              Treatment price
            </p>
          </div>

          <motion.p
            key={totalPrice}
            initial={{
              scale: 0.85,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{ duration: 0.35 }}
            className="whitespace-nowrap text-2xl font-light text-[#D4AF37] sm:text-3xl"
          >
            {"\u00A3"}{totalPrice}
          </motion.p>
        </div>

        <div className="my-6 h-px bg-white/10 sm:my-7" />

        <div className="grid grid-cols-1 gap-3 text-sm sm:space-y-4">
          <Feature text="Instant confirmation" />
          <Feature text="Secure online booking" />
          <Feature text="Free cancellation policy" />
        </div>
      </div>
    </motion.aside>
  );
}

function SummaryItem({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <motion.div
      layout
      className="flex min-w-0 gap-3 sm:gap-4"
    >
      <div className="shrink-0 pt-0.5 text-[#D4AF37]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 sm:text-xs sm:tracking-[0.25em]">
          {title}
        </p>

        <p className="mt-1 break-words text-sm leading-6 text-white sm:text-base">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

function Feature({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 text-xs text-[#D4AF37]">
        {"\u2713"}
      </span>

      <span className="text-white/70">
        {text}
      </span>
    </div>
  );
}










