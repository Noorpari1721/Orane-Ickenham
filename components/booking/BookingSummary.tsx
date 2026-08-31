"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  CalendarDays,
  Clock3,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import type { ReactNode } from "react";

import { useBooking } from "@/context/BookingContext";
import { serviceCategories } from "@/data/services";
import { getSelectedCategoryTitle } from "@/components/booking/bookingCategoryUtils";

function getDurationMinutes(duration: unknown) {
  if (
    typeof duration === "number" &&
    Number.isFinite(duration)
  ) {
    return Math.max(0, Math.round(duration));
  }

  const raw = String(duration ?? "")
    .toLowerCase()
    .trim();

  if (!raw) {
    return 0;
  }

  const hoursMatch = raw.match(
    /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/
  );

  const minutesMatch = raw.match(
    /(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/
  );

  let totalMinutes = 0;

  if (hoursMatch) {
    totalMinutes += Number(hoursMatch[1]) * 60;
  }

  if (minutesMatch) {
    totalMinutes += Number(minutesMatch[1]);
  }

  if (!hoursMatch && !minutesMatch) {
    const numeric = Number.parseFloat(raw);

    if (Number.isFinite(numeric)) {
      totalMinutes = numeric;
    }
  }

  return Math.max(0, Math.round(totalMinutes));
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
  const {
    booking,
    previousStep,
    nextStep,
  } = useBooking();

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
        getDurationMinutes(service.duration),
      0
    );

  const totalPrice =
    selectedServices.reduce(
      (total, service) =>
        total + Number(service.price ?? 0),
      0
    );
  const selectedCategoryTitle = getSelectedCategoryTitle(
    selectedServices,
    booking.category
  );

  const formattedDate = booking.date
    ? booking.date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Choose a date";

  const isFirstStep = booking.step === 1;
  const isLastStep = booking.step >= 7;

  const hasCustomerDetails = Boolean(
    booking.customer.firstName.trim() &&
    booking.customer.lastName.trim() &&
    booking.customer.email.trim() &&
    booking.customer.phone.trim()
  );

  const consultationComplete = Boolean(
    booking.consultationCompleted ||
    booking.consultationStatus === "salon" ||
    booking.consultationStatus === "existing-unchanged"
  );

  const canContinue =
    booking.step === 1
      ? selectedServices.length > 0
      : booking.step === 2
        ? Boolean(booking.date)
        : booking.step === 3
          ? Boolean(booking.time)
          : booking.step === 4
            ? Boolean(
                hasCustomerDetails &&
                booking.consultationStatus
              )
            : booking.step === 5
              ? consultationComplete
              : booking.step === 6
                ? true
                : false;

  const handleContinue = () => {
    if (!canContinue) {
      window.dispatchEvent(
        new CustomEvent("booking-continue")
      );
      return;
    }

    nextStep();
  };

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

        {/* HEADER */}
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

        {/* SUMMARY DETAILS */}
        <div className="mt-7 space-y-6">

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

        {/* TOTAL */}
        <div className="my-7 h-px bg-white/10" />

        <div className="flex items-center justify-between gap-4">

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/70 sm:text-xs sm:tracking-[0.25em]">
              Total
            </p>

            <p className="mt-1 text-xs text-white/75">
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
            className="shrink-0 whitespace-nowrap text-2xl font-light text-[#D4AF37] sm:text-3xl"
          >
            {"\u00A3"}{totalPrice}
          </motion.p>

        </div>

        {/* FEATURES */}
        <div className="my-7 h-px bg-white/10" />

        <div className="space-y-4">

          <Feature text="Instant confirmation" />

          <Feature text="Secure online booking" />

          <Feature text="Free cancellation policy" />

        </div>

        {/* NAVIGATION */}
        {!isLastStep && (
          <>
            <div className="my-7 h-px bg-white/10" />

            <div
              data-summary-navigation="true"
              className={`grid gap-3 ${
                isFirstStep
                  ? "grid-cols-1"
                  : "grid-cols-2"
              }`}
            >

              {!isFirstStep && (
                <button
                  type="button"
                  onClick={previousStep}
                  className="
                    inline-flex
                    min-w-0
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    border
                    border-white/10
                    bg-white/[0.025]
                    px-3
                    py-3
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-white/65
                    transition-all
                    duration-300
                    hover:border-[#D4AF37]/50
                    hover:bg-[#D4AF37]/5
                    hover:text-[#D4AF37]
                    sm:px-4
                    sm:text-xs
                  "
                >
                  <ArrowLeft
                    size={14}
                    className="shrink-0"
                  />

                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleContinue}
                className="
                  group
                  inline-flex
                  min-w-0
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#D4AF37]
                  px-3
                  py-3
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-black
                  shadow-[0_8px_24px_rgba(212,175,55,.18)]
                  transition-all
                  duration-300
                  hover:bg-[#e2c45a]
                  hover:shadow-[0_10px_30px_rgba(212,175,55,.28)]
                  sm:px-4
                  sm:text-xs
                "
              >
                <span>Continue</span>

                <ArrowRight
                  size={14}
                  className="
                    shrink-0
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </button>

            </div>
          </>
        )}

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

      <div className="min-w-0 flex-1">
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

      <span className="text-sm text-white/70">
        {text}
      </span>
    </div>
  );
}
