"use client";

import { motion } from "framer-motion";

import {
  Sparkles,
  CalendarDays,
  Clock3,
  User,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { useBooking } from "@/context/BookingContext";

export default function BookingSummary() {
  const { booking } = useBooking();

  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: .5 }}
      className="sticky top-28 rounded-[34px] border border-white/10 bg-gradient-to-b from-white/8 to-white/5 p-8 backdrop-blur-3xl"
    >
      <p className="text-xs uppercase tracking-[0.45em] text-[#D4AF37]">
        YOUR EXPERIENCE
      </p>

      <div className="mt-8 space-y-7">

        <SummaryItem
          icon={<Sparkles size={18} />}
          title="Category"
          value={booking.category || "Select a category"}
        />

        <SummaryItem
          icon={<Sparkles size={18} />}
          title="Treatment"
          value={booking.service?.name || "Select a treatment"}
        />

        <SummaryItem
          icon={<User size={18} />}
          title="Specialist"
          value={booking.staff?.name || "Choose a specialist"}
        />

        <SummaryItem
          icon={<CalendarDays size={18} />}
          title="Date"
          value={
            booking.date
              ? booking.date.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : "Choose a date"
          }
        />

        <SummaryItem
          icon={<Clock3 size={18} />}
          title="Time"
          value={booking.time || "Choose a time"}
        />

      </div>

      <div className="my-8 h-px bg-white/10" />

      <div className="flex justify-between">

        <div>

          <p className="text-sm uppercase tracking-[0.25em] text-white/50">
            Duration
          </p>

          <p className="mt-2 text-white">
            {booking.service?.duration || "--"}
          </p>

        </div>

        <div className="text-right">

          <p className="text-sm uppercase tracking-[0.25em] text-white/50">
            Total
          </p>

          <motion.p
            key={booking.service?.price}
            initial={{ scale: .8 }}
            animate={{ scale: 1 }}
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
      <div className="mt-1 text-[#D4AF37]">
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
    <div className="flex items-center gap-3 text-white/70">
      <CheckCircle2
        size={18}
        className="text-[#D4AF37]"
      />
      {text}
    </div>
  );
}