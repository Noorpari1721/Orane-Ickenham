"use client";

import { useBooking } from "@/context/BookingContext";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Step4Calendar() {
  const { updateBooking, nextStep } = useBooking();

  const today = new Date();

  const dates = Array.from({ length: 21 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return date;
  });

  return (
    <div className="space-y-10">

      <div className="text-center">

        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Four
        </p>

        <h2 className="mt-4 text-5xl font-light text-white">
          Choose Your Date
        </h2>

        <p className="mt-5 text-white/60">
          Select a convenient appointment date.
        </p>

      </div>

      <div className="grid grid-cols-7 gap-4">

        {weekdays.map((day) => (
          <div
            key={day}
            className="pb-3 text-center text-sm uppercase tracking-[0.25em] text-[#D4AF37]"
          >
            {day}
          </div>
        ))}

        {dates.map((date) => {

          const sunday = date.getDay() === 0;

          return (
            <button
              key={date.toISOString()}
              disabled={sunday}
              onClick={() => {
                updateBooking({
                  date,
                });

                setTimeout(() => {
                  nextStep();
                }, 250);
              }}
              className={`rounded-2xl border p-5 transition-all duration-300

                ${
                  sunday
                    ? "cursor-not-allowed border-white/5 bg-white/5 text-white/20"
                    : "border-white/10 bg-white/5 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
                }`}
            >
              <div className="text-2xl text-white">
                {date.getDate()}
              </div>

              <div className="mt-2 text-xs text-white/50">
                {date.toLocaleString("en-GB", {
                  month: "short",
                })}
              </div>
            </button>
          );

        })}

      </div>

    </div>
  );
}