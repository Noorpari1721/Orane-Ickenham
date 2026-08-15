"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Mail,
  Phone,
  Sparkles,
  User,
} from "lucide-react";

import { useBooking } from "@/context/BookingContext";
import { serviceCategories } from "@/data/services";

export default function Step7Review() {
  const { booking, updateBooking, nextStep } = useBooking();

  const category = serviceCategories.find(
    (item) => item.id === booking.category
  );

  const categoryTitle = category?.title || "Not selected";

  const formattedDate = booking.date
    ? booking.date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not selected";

  const editStep = (step: number) => {
    updateBooking({
      step,
      editingReview: true,
    });
  };

  const customerName =
    `${booking.customer.firstName} ${booking.customer.lastName}`.trim();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Six
        </p>

        <h2 className="mt-4 text-4xl font-light text-white md:text-5xl">
          Review Your Booking
        </h2>

        <p className="mt-4 text-white/60">
          Please check your selections before completing your booking.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="overflow-hidden rounded-[28px] border border-[#D4AF37]/20 bg-white/5 shadow-[0_0_45px_rgba(212,175,55,.08)]"
      >
        <div className="flex items-center justify-between gap-6 border-b border-white/10 p-7">
          <div className="flex items-start gap-4">
            <div className="mt-1 rounded-full bg-[#D4AF37]/10 p-3 text-[#D4AF37]">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Category
              </p>

              <p className="mt-2 text-xl font-light text-white">
                {categoryTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => editStep(1)}
            className="shrink-0 rounded-full border border-[#D4AF37]/30 px-5 py-2.5 text-sm text-[#D4AF37] transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Change
          </button>
        </div>

        <div className="flex items-center justify-between gap-6 p-7">
          <div className="flex items-start gap-4">
            <div className="mt-1 rounded-full bg-[#D4AF37]/10 p-3 text-[#D4AF37]">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Service
              </p>

              <p className="mt-2 text-xl font-light text-white">
                {booking.service?.name || "Not selected"}
              </p>

              {booking.service && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/50">
                  <span>{booking.service.duration}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-[#D4AF37]">
                    £{Number(booking.service.price).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => editStep(2)}
            className="shrink-0 rounded-full border border-[#D4AF37]/30 px-5 py-2.5 text-sm text-[#D4AF37] transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Change
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="rounded-[28px] border border-white/10 bg-white/5 p-7"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
          Appointment Details
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="flex items-start justify-between gap-4">
            <ReviewItem
              icon={<CalendarDays size={18} />}
              label="Date"
              value={formattedDate}
            />

            <button
              type="button"
              onClick={() => editStep(3)}
              className="shrink-0 rounded-full border border-[#D4AF37]/30 px-4 py-2 text-xs text-[#D4AF37] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              Change
            </button>
          </div>

          <ReviewItem
            icon={<Clock3 size={18} />}
            label="Duration"
            value={booking.service?.duration || "Not selected"}
          />

          <div className="flex items-start justify-between gap-4">
            <ReviewItem
              icon={<Clock3 size={18} />}
              label="Time"
              value={booking.time || "Not selected"}
            />

            <button
              type="button"
              onClick={() => editStep(4)}
              className="shrink-0 rounded-full border border-[#D4AF37]/30 px-4 py-2 text-xs text-[#D4AF37] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              Change
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16 }}
        className="rounded-[28px] border border-white/10 bg-white/5 p-7"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Your Details
          </p>

          <button
            type="button"
            onClick={() => editStep(5)}
            className="shrink-0 rounded-full border border-[#D4AF37]/30 px-4 py-2 text-xs text-[#D4AF37] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Change
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <ReviewItem
            icon={<User size={18} />}
            label="Name"
            value={customerName || "Not provided"}
          />

          <ReviewItem
            icon={<Mail size={18} />}
            label="Email"
            value={booking.customer.email || "Not provided"}
          />

          <ReviewItem
            icon={<Phone size={18} />}
            label="Phone"
            value={booking.customer.phone || "Not provided"}
          />

          {booking.customer.notes.trim() && (
            <ReviewItem
              icon={<FileText size={18} />}
              label="Special Requests"
              value={booking.customer.notes}
            />
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.22 }}
        className="rounded-[28px] border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-7"
      >
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Appointment Total
            </p>

            <p className="mt-2 text-sm text-white/50">
              {booking.service?.name || "Service"}
            </p>
          </div>

          <p className="text-3xl font-light text-[#D4AF37]">
            £{booking.service
              ? Number(booking.service.price).toFixed(2)
              : "0.00"}
          </p>
        </div>
      </motion.div>

      <div className="rounded-[24px] border border-[#D4AF37]/15 bg-[#D4AF37]/5 p-6">
        <p className="text-sm leading-6 text-white/60">
          Please review your details carefully. You can change your category,
          service, date, time, or customer details before continuing.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={nextStep}
          className="group flex items-center gap-3 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-8 py-4 text-sm uppercase tracking-[0.2em] text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,.12)] transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 hover:shadow-[0_0_40px_rgba(212,175,55,.25)]"
        >
          Continue to Payment

          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
}

function ReviewItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 shrink-0 text-[#D4AF37]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          {label}
        </p>

        <p className="mt-1 break-words text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
