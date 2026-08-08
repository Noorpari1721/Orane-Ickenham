"use client";

import { useEffect, useMemo, useState } from "react";
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

function getLondonDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value || 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

function getSlotMinutes(time: string) {
  const [rawTime, period] = time.split(" ");
  const [rawHour, rawMinute] = rawTime.split(":");

  let hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
}

function isSameLondonDate(date: Date, now: Date) {
  const selected = getLondonDateParts(date);
  const current = getLondonDateParts(now);

  return (
    selected.year === current.year &&
    selected.month === current.month &&
    selected.day === current.day
  );
}

export default function Step5Time() {
  const { booking, updateBooking, nextStep } = useBooking();

  const [now, setNow] = useState(() => new Date());

  /*
   * Keep the current time fresh.
   * This means an appointment slot automatically becomes
   * unavailable as time passes without refreshing the page.
   */
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const isSunday = booking.date?.getDay() === 0;

  const todayInLondon = useMemo(
    () => getLondonDateParts(now),
    [now]
  );

  const selectedDateIsToday = booking.date
    ? isSameLondonDate(booking.date, now)
    : false;

  const currentLondonMinutes =
    todayInLondon.hour * 60 + todayInLondon.minute;

  const isPastTime = (time: string) => {
    if (!selectedDateIsToday) {
      return false;
    }

    return getSlotMinutes(time) <= currentLondonMinutes;
  };

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
          Monday - Saturday · 10:00 AM - 7:00 PM
        </p>

        {selectedDateIsToday && (
          <p className="mt-2 text-xs text-[#D4AF37]/70">
            Earlier appointment times are no longer available today.
          </p>
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {timeSlots.map((time) => {
          const selected = booking.time === time;
          const unavailable = isPastTime(time);

          return (
            <button
              key={time}
              type="button"
              disabled={unavailable}
              onClick={() => {
                if (unavailable) return;

                updateBooking({
                  time,
                });

                setTimeout(() => {
                  if (booking.editingReview) {
                    updateBooking({
                      editingReview: false,
                      step: 7,
                    });
                  } else {
                    nextStep();
                  }
                }, 250);
              }}
              className={`rounded-2xl border px-6 py-5 transition-all duration-300 ${
                unavailable
                  ? "cursor-not-allowed border-white/5 bg-white/[0.025] text-white/20 line-through"
                  : selected
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
