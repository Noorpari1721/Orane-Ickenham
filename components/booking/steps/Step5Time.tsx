"use client";

import { useBooking } from "@/context/BookingContext";

const timeSlots = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
];

export default function Step5Time() {
  const { booking, updateBooking, nextStep } = useBooking();

  const isSunday = booking.date?.getDay() === 0;

  if (isSunday) {
    return (
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Five
        </p>

        <h2 className="mt-4 text-5xl font-light text-white">
          Choose Your Time
        </h2>

        <div className="mx-auto mt-10 max-w-xl rounded-[28px] border border-white/10 bg-white/5 p-10">
          <p className="text-2xl font-light text-white">
            We are closed on Sundays.
          </p>

          <p className="mt-4 text-white/60">
            Please choose another date for your appointment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
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

        <p className="mt-3 text-sm text-white/40">
          Monday £ Saturday £ 10:00 AM £ 7:00 PM
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {timeSlots.map((time) => {
          const selected = booking.time === time;

          return (
            <button
              key={time}
              type="button"
              onClick={() => {
                updateBooking({
                  time,
                });

                setTimeout(() => { if (booking.editingReview) { updateBooking({ editingReview: false, step: 7 }); } else { nextStep(); } }, 250);
              }}
              className={`rounded-2xl border px-6 py-5 transition-all duration-300 ${
                selected
                  ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,.3)]"
                  : "border-white/10 bg-white/5 text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/5"
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


