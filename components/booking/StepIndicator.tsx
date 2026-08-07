"use client";

import { useBooking } from "@/app/booking/context/BookingContext";

const steps = [
  "Service",
  "Specialist",
  "Date",
  "Details",
  "Review",
];

export default function StepIndicator() {
  const { step } = useBooking();

  return (
    <div className="sticky top-0 z-40 mb-12 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">

      {/* Progress Bar */}

      <div className="mb-10 h-[4px] overflow-hidden rounded-full bg-white/10">

        <div
          className="h-full rounded-full bg-[#C49A45] transition-all duration-700"
          style={{
            width: `${((step - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

      </div>

      {/* Step Circles */}

      <div className="flex justify-between">

        {steps.map((title, index) => {

          const active = step === index + 1;
          const completed = step > index + 1;

          return (
            <div
              key={title}
              className="flex flex-col items-center gap-3"
            >

              <div
                className={`
                flex h-12 w-12 items-center justify-center rounded-full
                border text-sm font-semibold transition-all duration-500
                ${
                  completed
                    ? "border-[#C49A45] bg-[#C49A45] text-white"
                    : active
                    ? "border-[#C49A45] bg-white text-[#C49A45] shadow-lg"
                    : "border-white/20 bg-white/5 text-gray-400"
                }
                `}
              >
                {completed ? "✓" : index + 1}
              </div>

              <span
                className={`text-xs uppercase tracking-[0.2em]
                ${
                  active
                    ? "text-[#C49A45]"
                    : "text-gray-400"
                }`}
              >
                {title}
              </span>

            </div>
          );

        })}

      </div>

    </div>
  );
}