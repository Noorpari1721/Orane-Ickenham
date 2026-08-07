"use client";

import { useBooking } from "@/context/BookingContext";

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

export default function Step5Time() {
  const { booking, updateBooking, nextStep } = useBooking();

  return (
    <div className="space-y-10">

      <div className="text-center">

        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Five
        </p>

        <h2 className="mt-4 text-5xl font-light text-white">
          Choose Your Time
        </h2>

        <p className="mt-5 text-white/60">
          Select an available appointment slot.
        </p>

      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">

        {timeSlots.map((time) => {

          const selected = booking.time === time;

          return (

            <button
              key={time}
              onClick={() => {

                updateBooking({
                  time,
                });

                setTimeout(() => {
                  nextStep();
                }, 250);

              }}
              className={`rounded-2xl border px-6 py-5 transition-all duration-300

                ${
                  selected
                    ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,.3)]"
                    : "border-white/10 bg-white/5 text-white hover:border-[#D4AF37]"
                }`}
            >
              {time}
            </button>

          );

        })}

      </div>

    </div>
  );
}