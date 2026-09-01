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
    <>
      {/* ======================================================
          MOBILE TEXT STEP BAR
          Visible only below sm breakpoint.
          ====================================================== */}
      <div className="hidden sm:hidden w-full overflow-x-auto scrollbar-none">
        <div className="flex min-w-max items-center px-1 py-1">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const completed = booking.step > stepNumber;
            const active = booking.step === stepNumber;

            return (
              <div
                key={label}
                className="flex items-center"
              >
                <div
                  className={`whitespace-nowrap px-2 text-[9px] font-semibold uppercase tracking-[0.08em] transition-all ${
                    active
                      ? "text-[#D4AF37]"
                      : completed
                        ? "text-white/65"
                        : "text-white/30"
                  }`}
                >
                  <span>
                    Step {stepNumber}
                  </span>
                  <span className="ml-1">
                    {label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`h-px w-3 shrink-0 ${
                      completed
                        ? "bg-[#D4AF37]/60"
                        : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================
          DESKTOP EXISTING STEPPER
          Hidden only on mobile.
          ====================================================== */}
      <div className="hidden min-w-0 w-full items-center justify-between gap-1 px-2 sm:flex sm:min-w-[760px]">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const completed = booking.step > stepNumber;
          const active = booking.step === stepNumber;

          return (
            <div
              key={label}
              className="flex min-w-0 flex-1 items-center last:flex-none sm:min-w-0"
            >
              <div className="flex min-w-0 flex-1 flex-col items-center sm:min-w-[72px] sm:flex-none">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all sm:h-[56px] sm:w-[56px] ${
                    completed
                      ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                      : active
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                        : "border-white/15 text-white/35"
                  }`}
                >
                  <span className="text-sm font-semibold leading-none sm:text-[20px]">
                    {completed ? "✓" : stepNumber}
                  </span>
                </div>

                <span
                  className={`mt-1.5 text-[8px] font-semibold uppercase tracking-[0.03em] leading-none sm:mt-3 sm:text-[10px] sm:tracking-[0.14em] ${
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
                  className={`mb-3 h-px flex-1 sm:mb-6 ${
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
    </>
  );
}