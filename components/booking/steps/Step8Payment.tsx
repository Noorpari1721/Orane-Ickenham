"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Mail,
  Phone,
  Sparkles,
  User,
  UserRound,
} from "lucide-react";

import { useBooking } from "@/context/BookingContext";

export default function Step8Payment() {
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

  const price = booking.service?.price ?? 0;

  const handlePayment = async () => {
    if (isLoading) return;

    setError("");

    if (!booking.service) {
      setError("Please select a service before continuing.");
      return;
    }

    if (!booking.customer.email) {
      setError("Please provide your email address before continuing.");
      return;
    }

    if (!booking.customer.firstName || !booking.customer.lastName) {
      setError("Please provide your full name before continuing.");
      return;
    }

    if (!booking.date || !booking.time) {
      setError("Please select your appointment date and time.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceName: booking.service.name,
          price: booking.service.price,
          duration: booking.service.duration,
          customerName: fullName,
          customerEmail: booking.customer.email,
          customerPhone: booking.customer.phone,
          category: booking.category,
          staffName: booking.staff?.name,
          appointmentDate: booking.date.toISOString(),
          appointmentTime: booking.time,
        }),
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

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
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Eight
        </p>

        <h2 className="mt-4 text-5xl font-light text-white">
          Secure Payment
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-white/60">
          Your appointment is ready. Complete your payment securely through
          Stripe.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="
          overflow-hidden
          rounded-[30px]
          border
          border-[#D4AF37]/20
          bg-white/5
          shadow-[0_0_45px_rgba(212,175,55,.08)]
        "
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

          <div className="mt-6 flex items-end justify-between gap-6">
            <div>
              <h3 className="text-2xl font-light text-white">
                {booking.service?.name || "Treatment not selected"}
              </h3>

              <p className="mt-2 text-sm text-white/50">
                {booking.service?.duration || "Duration not selected"}
              </p>
            </div>

            <p className="whitespace-nowrap text-3xl font-light text-[#D4AF37]">
              £{price}
            </p>
          </div>
        </div>

        <div className="grid gap-6 border-b border-white/10 p-7 sm:grid-cols-2">
          <div className="flex items-start gap-4">
            <CalendarDays
              size={19}
              className="mt-1 shrink-0 text-[#D4AF37]"
            />

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Date
              </p>

              <p className="mt-2 text-white">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Clock3 size={19} className="mt-1 shrink-0 text-[#D4AF37]" />

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Time
              </p>

              <p className="mt-2 text-white">
                {booking.time || "Not selected"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <UserRound size={19} className="mt-1 shrink-0 text-[#D4AF37]" />

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Specialist
              </p>

              <p className="mt-2 text-white">
                {booking.staff?.name || "Not selected"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Sparkles size={19} className="mt-1 shrink-0 text-[#D4AF37]" />

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Duration
              </p>

              <p className="mt-2 text-white">
                {booking.service?.duration || "Not selected"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 p-7">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Payment Details
          </p>

          <p className="mt-2 text-sm text-white/40">
            Paying for the appointment below.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-white/70">
              <User size={17} className="shrink-0 text-[#D4AF37]" />

              <span className="truncate">{fullName}</span>
            </div>

            <div className="flex items-center gap-3 text-white/70">
              <Mail size={17} className="shrink-0 text-[#D4AF37]" />

              <span className="truncate">
                {booking.customer.email || "Not provided"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-white/70">
              <Phone size={17} className="shrink-0 text-[#D4AF37]" />

              <span>{booking.customer.phone || "Not provided"}</span>
            </div>
          </div>
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
              £{price}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="
          rounded-[30px]
          border
          border-white/10
          bg-white/5
          p-7
          shadow-[0_0_40px_rgba(212,175,55,.05)]
        "
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

        <div
          className="
            mt-6
            rounded-2xl
            border
            border-[#D4AF37]/25
            bg-black/20
            px-6
            py-8
          "
        >
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
          className="
            rounded-2xl
            border
            border-red-400/20
            bg-red-400/10
            px-5
            py-4
            text-center
            text-sm
            text-red-200
          "
        >
          {error}
        </motion.div>
      )}

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={previousStep}
          disabled={isLoading}
          className="
            rounded-full
            border
            border-white/15
            bg-white/5
            px-7
            py-4
            text-sm
            uppercase
            tracking-[0.18em]
            text-white/70
            transition-all
            duration-300
            hover:border-white/30
            hover:bg-white/10
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Back to Review
        </button>

        <button
          type="button"
          onClick={handlePayment}
          disabled={isLoading}
          className="
            rounded-full
            border
            border-[#D4AF37]/50
            bg-[#D4AF37]/10
            px-9
            py-4
            text-sm
            font-medium
            uppercase
            tracking-[0.2em]
            text-[#D4AF37]
            shadow-[0_0_30px_rgba(212,175,55,.12)]
            transition-all
            duration-300
            hover:border-[#D4AF37]
            hover:bg-[#D4AF37]/20
            hover:shadow-[0_0_40px_rgba(212,175,55,.25)]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {isLoading ? "Connecting to Stripe..." : `Pay £${price}`}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-white/30">
        <LockKeyhole size={12} />
        <span>Secure payments powered by Stripe</span>
      </div>
    </div>
  );
}