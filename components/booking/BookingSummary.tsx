"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  CalendarDays,
  Clock3,
  User,
} from "lucide-react";
import { useRef } from "react";
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
  const containerRef = useRef<HTMLElement>(null);

  const { scrollY } = useScroll();

  /*
    The summary moves with the page scroll.
    The movement is deliberately limited so the card remains
    inside the booking container.
  */
  const y = useTransform(
    scrollY,
    [0, 900],
    [0, 260],
    {
      clamp: true,
    }
  );

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
      ref={containerRef}
      style={{ y }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1 }}
      transition={{
        opacity: { duration: 0.5 },
      }}
      className="relative overflow-hidden rounded-[34px] border border-[#D4AF37]/30 bg-gradient-to-b from-white/10 via-white/5 to-black/20 p-8 shadow-[0_0_35px_rgba(212,175,55,.14),0_25px_70px_rgba(0,0,0,.35)] backdrop-blur-3xl"
    >
      {/* Golden glow */}
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-[#D4AF37]/10 blur-[80px]" />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <Sparkles
            size={17}
            className="text-[#D4AF37]"
          />

          <p className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">
            Your Experience
          </p>
        </div>

        <h3 className="mt-2 text-2xl font-light text-white">
          Booking Summary
        </h3>

        <div className="mt-8 space-y-7">
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

        <div className="my-8 h-px bg-white/10" />

        <div className="flex justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">
              Duration
            </p>

            <p className="mt-2 text-white">
              {booking.service?.duration || "--"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">
              Total
            </p>

            <motion.p
              key={booking.service?.price}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="mt-2 text-3xl font-light text-[#D4AF37]"
            >
              £{booking.service?.price ?? 0}
            </motion.p>
          </div>
        </div>

        <div className="my-8 h-px bg-white/10" />

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
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <motion.div
      layout
      className="flex gap-4"
    >
      <div className="text-[#D4AF37]">
        {icon}
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">
          {title}
        </p>

        <p className="mt-1 text-white">
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
    <div className="flex items-center gap-3 text-white/60">
      <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
      <span>{text}</span>
    </div>
  );
}
