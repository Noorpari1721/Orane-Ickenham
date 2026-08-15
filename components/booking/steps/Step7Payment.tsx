"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Mail,
  Phone,
  Sparkles,
  User,
} from "lucide-react";

import { useBooking } from "@/context/BookingContext";

export default function Step7Payment() {
  const { booking, previousStep } = useBooking();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formattedDate = booking.date
    ? booking.date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not selected";

  const fullName =
    `${booking.customer.firstName} ${booking.customer.lastName}`.trim() ||
    "Not provided";

  const price = Number(booking.service?.price ?? 0);

  const handlePayment = async () => {
    if (isLoading) return;

    setError("");

    if (!booking.service) {
      setError("Please select a service before continuing.");
      return;
    }

    if (!booking.date || !booking.time) {
      setError("Please select your appointment date and time.");
      return;
    }

    if (
      !booking.customer.firstName.trim() ||
      !booking.customer.lastName.trim()
    ) {
      setError("Please provide your full name before continuing.");
      return;
    }

    if (!booking.customer.email.trim()) {
      setError("Please provide your email address before continuing.");
      return;
    }

    if (!booking.customer.phone.trim()) {
      setError("Please provide your phone number before continuing.");
      return;
    }

    setIsLoading(true);

    try {
      /*
       * IMPORTANT:
       * The browser does NOT send price, service name,
       * duration or technician information.
       *
       * The checkout API gets the real service and price
       * directly from the database.
       */
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        cache: "no-store",

        body: JSON.stringify({
          serviceId: booking.service.id,

          customerName: fullName,
          customerEmail: booking.customer.email.trim(),
          customerPhone: booking.customer.phone.trim(),

          category: booking.category,

          appointmentDate: booking.date.toISOString(),
          appointmentTime: booking.time,
        }),
      });

      const raw = await response.text();

      let data: {
        url?: string;
        error?: string;
      } = {};

      if (raw.trim()) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error(
            `Payment server returned invalid data (${response.status}).`
          );
        }
      } else {
        throw new Error(
          `Payment server returned an empty response (${response.status}).`
        );
      }

      if (!response.ok || !data.url) {
        throw new Error(
          data.error || "Unable to start secure Stripe Checkout."
        );
      }

      window.location.href = data.url;
    } catch (paymentError) {
      console.error("Payment error:", paymentError);

      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to start payment. Please try again."
      );

      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Seven
        </p>

        <h2 className="mt-4 text-4xl font-light text-white md:text-5xl">
          Secure Payment
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-white/60">
          Your appointment is ready. Complete your payment securely through
          Stripe.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="overflow-hidden rounded-[30px] border border-[#D4AF37]/20 bg-white/5 shadow-[0_0_45px_rgba(212,175,55,.08)]"
      >
        <div className="border-b border-white/10 p-7">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#D4AF37]/10 p-2.5">
              <Sparkles size={17} className="text-[#D4AF37]" />
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
              Appointment
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-2xl font-light text-white">
                {booking.service?.name || "Treatment not selected"}
              </h3>

              <p className="mt-2 text-sm text-white/50">
                {booking.service?.duration || "Duration not selected"}
              </p>
            </div>

            <p className="whitespace-nowrap text-3xl font-light text-[#D4AF37]">
              £{price.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 border-b border-white/10 p-7 sm:grid-cols-2">
          <DetailItem
            icon={<CalendarDays size={19} />}
            label="Date"
            value={formattedDate}
          />

          <DetailItem
            icon={<Clock3 size={19} />}
            label="Time"
            value={booking.time || "Not selected"}
          />

          <DetailItem
            icon={<Sparkles size={19} />}
            label="Service"
            value={booking.service?.name || "Not selected"}
          />

          <DetailItem
            icon={<Clock3 size={19} />}
            label="Duration"
            value={booking.service?.duration || "Not selected"}
          />
        </div>

        <div className="border-b border-white/10 p-7">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Customer Details
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <CustomerItem
              icon={<User size={17} />}
              value={fullName}
            />

            <CustomerItem
              icon={<Mail size={17} />}
              value={booking.customer.email || "Not provided"}
            />

            <CustomerItem
              icon={<Phone size={17} />}
              value={booking.customer.phone || "Not provided"}
            />
          </div>

          {booking.customer.notes.trim() && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                Special Request
              </p>

              <p className="mt-2 text-sm leading-6 text-white/60">
                {booking.customer.notes}
              </p>
            </div>
          )}
        </div>

        <div className="bg-[#D4AF37]/5 p-7">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Amount to Pay
              </p>

              <p className="mt-2 text-sm text-white/50">
                Secure Stripe payment
              </p>
            </div>

            <p className="text-4xl font-light text-[#D4AF37]">
              £{price.toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="rounded-[30px] border border-white/10 bg-white/5 p-7 shadow-[0_0_40px_rgba(212,175,55,.05)]"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-[#D4AF37]/10 p-3">
            <LockKeyhole size={19} className="text-[#D4AF37]" />
          </div>

          <div>
            <h3 className="text-xl font-light text-white">
              Secure Stripe Checkout
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/50">
              Your payment is securely processed by Stripe. ORANE does not
              store your card details.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#D4AF37]/25 bg-black/20 px-6 py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-[#D4AF37]/10 p-3">
              <CheckCircle2 size={20} className="text-[#D4AF37]" />
            </div>

            <p className="mt-4 text-sm text-white/60">
              Secure Stripe Checkout
            </p>

            <p className="mt-1 text-xs text-white/30">
              You will be redirected to Stripe&apos;s secure payment page.
            </p>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-center text-sm text-red-200"
        >
          {error}
        </motion.div>
      )}

      <div className="flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={previousStep}
          disabled={isLoading}
          className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm uppercase tracking-[0.18em] text-white/70 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft
            size={17}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />

          Back to Review
        </button>

        <button
          type="button"
          onClick={handlePayment}
          disabled={isLoading}
          className="group inline-flex items-center justify-center gap-3 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-9 py-4 text-sm font-medium uppercase tracking-[0.2em] text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,.12)] transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 hover:shadow-[0_0_40px_rgba(212,175,55,.25)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? "Connecting to Stripe..."
            : `Pay £${price.toFixed(2)}`}

          {!isLoading && (
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-white/30">
        <LockKeyhole size={12} />
        <span>Secure payments powered by Stripe</span>
      </div>
    </div>
  );
}

function DetailItem({
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
      <div className="mt-1 shrink-0 text-[#D4AF37]">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          {label}
        </p>

        <p className="mt-2 break-words text-white">{value}</p>
      </div>
    </div>
  );
}

function CustomerItem({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 text-white/70">
      <span className="shrink-0 text-[#D4AF37]">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
