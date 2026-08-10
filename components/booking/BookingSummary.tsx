"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  CalendarDays,
  Clock3,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { useBooking } from "@/context/BookingContext";
import { serviceCategories } from "@/data/services";

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
        sticky
        top-8
        w-full
        overflow-hidden
        rounded-[34px]
        border
        border-[#D4AF37]/30
        bg-gradient-to-b
        from-white/10
        via-white/5
        to-black/20
        p-6
        shadow-[0_0_35px_rgba(212,175,55,.14),0_25px_70px_rgba(0,0,0,.35)]
        backdrop-blur-3xl
        lg:p-8
      "
    >
      <div className="relative z-10">

        <div className="flex items-center gap-3">
          <Sparkles
            size={17}
            className="shrink-0 text-[#D4AF37]"
          />

          <p className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">
            Your Experience
          </p>
        </div>

        <h3 className="mt-2 text-2xl font-light text-white">
          Booking Summary
        </h3>

        <div className="mt-8 space-y-6">

      <SummaryItem
        icon={<Sparkles size={18} />}
        title="Category"
        value={
          booking.category
            ? formatCategoryName(booking.category)
            : "Select a category"
        }
      />

      <SummaryItem
        icon={<Sparkles size={18} />}
        title="Service"
        value={
          booking.service?.name ||
          "Select a service"
        }
      />

      <SummaryItem
        icon={<Sparkles size={18} />}
        title="Duration"
        value={
          booking.service?.duration ||
          "--"
        }
      />

      <SummaryItem
        icon={<User size={18} />}
        title="Specialist"
        value={
          booking.staff?.name ||
          "Choose a specialist"
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
    <div className="my-7 h-px bg-white/10" />

        <div className="flex items-end justify-between gap-5">

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">
              Total
            </p>

            <p className="mt-1 text-xs text-white/40">
              Treatment price
            </p>
          </div>

          <motion.p
            key={booking.service?.price ?? "empty"}
            initial={{
              scale: 0.85,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{ duration: 0.35 }}
            className="whitespace-nowrap text-3xl font-light text-[#D4AF37]"
          >
            {"\u00A3"}{booking.service?.price ?? 0}
          </motion.p>

        </div>

        <div className="my-7 h-px bg-white/10" />

        <div className="space-y-4 text-sm">
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
      className="flex min-w-0 gap-4"
    >
      <div className="shrink-0 text-[#D4AF37]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">
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
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#D4AF37]/30 text-xs text-[#D4AF37]">
        ?
      </span>

      <span className="text-white/70">
        {text}
      </span>
    </div>
  );
}