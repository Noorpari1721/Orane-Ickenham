"use client";

import { useBooking } from "@/context/BookingContext";

const steps = [
  "Service",
  "Date",
  "Time",
  "Details",
  "Consultation",
  "Review",
  "Payment",
];

export default function ProgressStepper() {
  const { booking } = useBooking();

  return (
    <div className="flex min-w-[760px] items-center justify-between gap-1 px-2">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const completed = booking.step > stepNumber;
        const active = booking.step === stepNumber;

        return (
          <div
            key={label}
            className="flex flex-1 items-center last:flex-none"
          >
            <div className="flex min-w-[72px] flex-col items-center">
              <div
                className={`flex h-[56px] w-[56px] items-center justify-center rounded-full border transition-all ${
                  completed
                    ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                    : active
                    ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                    : "border-white/15 text-white/35"
                }`}
              >
                <span className="text-[20px] font-semibold leading-none">
                  {completed ? "✓" : stepNumber}
                </span>
              </div>

              <span
                className={`mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  active
                    ? "text-[#D4AF37]"
                    : completed
                    ? "text-white/65"
                    : "text-white/30"
                }`}
              >
                {label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`mb-6 h-px flex-1 ${
                  booking.step > stepNumber
                    ? "bg-[#D4AF37]/70"
                    : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
