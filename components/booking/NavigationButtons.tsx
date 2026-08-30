"use client";

import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { useBooking } from "@/context/BookingContext";

export default function NavigationButtons() {
  const {
    booking,
    previousStep,
    nextStep,
  } = useBooking();

  const isFirstStep = booking.step === 1;
  const isLastStep = booking.step >= 7;

  const selectedServices =
    booking.services?.length
      ? booking.services
      : booking.service
        ? [booking.service]
        : [];

  const hasCustomerDetails = Boolean(
    booking.customer.firstName.trim() &&
    booking.customer.lastName.trim() &&
    booking.customer.email.trim() &&
    booking.customer.phone.trim()
  );

  const consultationComplete = Boolean(
    booking.consultationCompleted ||
    booking.consultationStatus === "salon" ||
    booking.consultationStatus ===
      "existing-unchanged"
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
    <div className="flex items-center justify-between gap-4">
      {!isFirstStep ? (
        <button
          type="button"
          onClick={previousStep}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-xs uppercase tracking-[0.16em] text-white/60 transition hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      ) : (
        <div />
      )}

      {!isLastStep && (
        <button
          type="button"
          onClick={handleContinue}
          className="group inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-[#e2c45a]"
        >
          Continue
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      )}
    </div>
  );
}
