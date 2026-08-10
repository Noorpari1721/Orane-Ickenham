"use client";

import { useBooking } from "@/context/BookingContext";

const weekdays = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function Step4Calendar() {
  const { booking, setDate, updateBooking, nextStep } = useBooking();

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const dates = Array.from(
    { length: 21 },
    (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      date.setHours(12, 0, 0, 0);
      return date;
    }
  );

  const firstDayOffset =
    (dates[0].getDay() + 6) % 7;

  const selectedDateKey = booking.date
    ? dateKey(booking.date)
    : "";

  return (
    <div>
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

        <p className="mt-3 text-sm text-white/40">
          Monday – Saturday · 10:00 AM – 7:00 PM
        </p>

        <p className="mt-1 text-sm text-white/30">
          Sunday · Closed
        </p>
      </div>

      <div className="mt-10 grid grid-cols-7 gap-4">
        {weekdays.map((day) => (
          <div
            key={day}
            className="pb-3 text-center text-sm uppercase tracking-[0.25em] text-[#D4AF37]"
          >
            {day}
          </div>
        ))}

        {Array.from({
          length: firstDayOffset,
        }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {dates.map((date) => {
          const isSunday =
            date.getDay() === 0;

          const selected =
            selectedDateKey === dateKey(date);

          const weekday = date.toLocaleDateString(
            "en-GB",
            {
              weekday: "short",
            }
          );

          return (
            <button
              key={dateKey(date)}
              type="button"
              disabled={false}
              onClick={() => {
                if (false) return;

                setDate(date);

                setTimeout(() => { if (booking.editingReview) { updateBooking({ editingReview: false, step: 5 }); } else { nextStep(); } }, 250);
              }}
              className={`booking-card rounded-2xl border p-5 transition-all duration-300 ${
                selected
                  ? "booking-card-active border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,.25)]"
                  : "border-white/10 bg-white/5 text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
              }`}
            >
              <div
                className={`text-xs uppercase tracking-[0.2em] ${
                  "text-white/40"
                }`}
              >
                {weekday}
              </div>

              <div
                className={`mt-2 text-2xl ${
                  selected
                    ? "text-[#D4AF37]"
                    : "text-white"
                }`}
              >
                {date.getDate()}
              </div>

              <div className="mt-2 text-xs text-white/50">
                {date.toLocaleDateString("en-GB", {
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







