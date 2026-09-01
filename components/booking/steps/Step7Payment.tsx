"use client";

import { getDurationMinutes } from "@/lib/duration";




import { useState } from "react";
import Link from "next/link";

import { motion } from "framer-motion";

import {
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
import { getSelectedCategoryTitle } from "@/components/booking/bookingCategoryUtils";

export default function Step7Payment() {
  const { booking } =
    useBooking();

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [hasAcceptedPolicies, setHasAcceptedPolicies] =
    useState(false);

  const formattedDate =
    booking.date
      ? booking.date.toLocaleDateString(
          "en-GB",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
      : "Not selected";

  const fullName =
    `${booking.customer.firstName} ${booking.customer.lastName}`.trim() ||
    "Not provided";

  const selectedServices =
    booking.services?.length
      ? booking.services
      : booking.service
        ? [booking.service]
        : [];
  const categoryTitle = getSelectedCategoryTitle(
    selectedServices,
    booking.category
  );

  const price =
    selectedServices.reduce(
      (total, service) =>
        total +
        Number(
          service.price ?? 0
        ),
      0
    );

  const totalDuration =
    selectedServices.reduce(
      (total, service) =>
        total +
        getDurationMinutes(service.duration),
      0
    );

  const serviceNames =
    selectedServices
      .map(
        (service) =>
          service.name
      )
      .join(", ") ||
    "Treatment not selected";

  const handlePayment =
    async () => {
      if (isLoading) {
        return;
      }

      setError("");

      if (
        selectedServices.length === 0
      ) {
        setError(
          "Please select at least one treatment."
        );

        return;
      }

      if (!hasAcceptedPolicies) {
        setError(
          "Please read and accept our Policies & Aftercare before continuing to payment."
        );

        return;
      }

      setIsLoading(true);

      try {
        const response =
          await fetch(
            "/api/stripe/checkout",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json",
              },
              cache: "no-store",
              body: JSON.stringify({
                serviceIds:
                  selectedServices.map(
                    (service) =>
                      String(
                        service.id
                      )
                  ),
                customerName:
                  fullName,
                customerEmail:
                  booking.customer.email.trim(),
                customerPhone:
                  booking.customer.phone.trim(),
                category:
                  booking.category,
                appointmentDate:
                  booking.date?.toISOString(),
                appointmentTime:
                  booking.time,
                consultationStatus:
                  booking.consultationStatus,
                staffId:
                  booking.staff?.id ||
                  undefined,
              }),
            }
          );

        const raw =
          await response.text();

        let data: {
          url?: string;
          error?: string;
        } = {};

        if (raw.trim()) {
          data =
            JSON.parse(raw);
        } else {
          throw new Error(
            "Payment server returned an empty response."
          );
        }

        if (
          !response.ok ||
          !data.url
        ) {
          throw new Error(
            data.error ||
            "Unable to start secure Stripe Checkout."
          );
        }

        window.location.href =
          data.url;
      } catch (
        paymentError
      ) {
        console.error(
          "Payment error:",
          paymentError
        );

        setError(
          paymentError instanceof Error
            ? paymentError.message
            : "Unable to start payment."
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

        <h2 className="mt-4 text-3xl font-normal leading-tight text-white sm:text-4xl md:text-5xl">
          Secure Payment
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-white/75">
          Your appointment is ready.
          Complete payment securely through Stripe.
        </p>
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
        className="overflow-hidden rounded-[30px] border border-[#D4AF37]/20 bg-white/5"
      >
        <div className="border-b border-white/10 p-4 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#D4AF37]/10 p-2.5">
              <Sparkles
                size={17}
                className="text-[#D4AF37]"
              />
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
              Appointment
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-2xl font-light text-white">
              Your Selected Treatments
            </h3>

            <div className="mt-5 space-y-3">
              {selectedServices.map(
                (service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-white">
                        {service.name}
                      </p>

                      <p className="mt-1 text-sm text-white/75">
                        {service.duration} minutes
                      </p>
                    </div>

                    <p className="text-[#D4AF37]">
                      £{Number(
                        service.price
                      ).toFixed(2)}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 border-b border-white/10 p-4 sm:p-7 sm:grid-cols-2">
          <DetailItem
            icon={
              <CalendarDays
                size={19}
              />
            }
            label="Date"
            value={formattedDate}
          />

          <DetailItem
            icon={
              <Clock3
                size={19}
              />
            }
            label="Time"
            value={
              booking.time ||
              "Not selected"
            }
          />

          <DetailItem
            icon={
              <Sparkles
                size={19}
              />
            }
            label="Treatments"
            value={serviceNames}
          />

          <DetailItem
            icon={
              <Clock3
                size={19}
              />
            }
            label="Total Duration"
            value={`${totalDuration} minutes`}
          />
        </div>

        <div className="border-b border-white/10 p-4 sm:p-7">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Customer Details
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <CustomerItem
              icon={
                <User size={17} />
              }
              value={fullName}
            />

            <CustomerItem
              icon={
                <Mail size={17} />
              }
              value={
                booking.customer.email
              }
            />

            <CustomerItem
              icon={
                <Phone size={17} />
              }
              value={
                booking.customer.phone
              }
            />
          </div>
        </div>

        <div className="bg-[#D4AF37]/5 p-4 sm:p-7">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/75">
                Amount to Pay
              </p>

              <p className="mt-2 text-sm text-white/70">
                {selectedServices.length} treatment
                {selectedServices.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <p className="text-4xl font-light text-[#D4AF37]">
              £{price.toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          delay: 0.08,
        }}
        className="rounded-[30px] border border-white/10 bg-white/5 p-4 sm:p-7"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-[#D4AF37]/10 p-3">
            <LockKeyhole
              size={19}
              className="text-[#D4AF37]"
            />
          </div>

          <div>
            <h3 className="text-xl font-light text-white">
              Secure Stripe Checkout
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/70">
              Your payment is securely processed
              by Stripe. ORANE does not store
              your card details.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#D4AF37]/25 bg-black/20 px-6 py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-[#D4AF37]/10 p-3">
              <CheckCircle2
                size={20}
                className="text-[#D4AF37]"
              />
            </div>

            <p className="mt-4 text-sm text-white/75">
              Secure Stripe Checkout
            </p>

            <p className="mt-1 text-xs text-white/65">
              You will be redirected to Stripe's
              secure payment page.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="rounded-[24px] border border-[#D4AF37]/20 bg-[#D4AF37]/[0.04] p-5 sm:p-6">
        <label className="flex cursor-pointer items-start gap-4">
          <input
            type="checkbox"
            checked={hasAcceptedPolicies}
            onChange={(event) => {
              setHasAcceptedPolicies(event.target.checked);
              setError("");
            }}
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[#D4AF37]"
          />

          <span className="text-sm leading-6 text-white/65">
            I confirm that I have read and agree to the{" "}
            <Link
              href="/policies"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#D4AF37] underline decoration-[#D4AF37]/40 underline-offset-4 transition hover:text-[#ead27a]"
            >
              Policies & Aftercare
            </Link>
            .
          </span>
        </label>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-center text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handlePayment}
          disabled={
            isLoading ||
            !hasAcceptedPolicies
          }
          className="group inline-flex items-center justify-center gap-3 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-9 py-4 text-sm font-medium uppercase tracking-[0.2em] text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,.12)] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 disabled:cursor-not-allowed disabled:opacity-50"
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
      <div className="mt-1 shrink-0 text-[#D4AF37]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-white/75">
          {label}
        </p>

        <p className="mt-2 break-words text-white">
          {value}
        </p>
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
      <span className="shrink-0 text-[#D4AF37]">
        {icon}
      </span>

      <span className="truncate">
        {value}
      </span>
    </div>
  );
}





