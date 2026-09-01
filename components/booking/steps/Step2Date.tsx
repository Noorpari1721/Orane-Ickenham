"use client";

import { useEffect, useMemo, useState } from "react";

import { useBooking } from "@/context/BookingContext";

type WorkingHour = {
  dayOfWeek: number;
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
}


export default function Step2Date() {
  const {
    booking,
    setDate,
    updateBooking,
  } = useBooking();

  const [hours, setHours] =
    useState<WorkingHour[]>([]);

  const [loading, setLoading] =
    useState(true);

  const today = useMemo(() => {
    const value = new Date();

    value.setHours(
      12,
      0,
      0,
      0
    );

    return value;
  }, []);

  const dates = useMemo(
    () =>
      Array.from(
        { length: 21 },
        (_, index) => {
          const date =
            new Date(today);

          date.setDate(
            today.getDate() + index
          );

          date.setHours(
            12,
            0,
            0,
            0
          );

          return date;
        }
      ),
    [today]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadHours() {
      try {
        const response =
          await fetch(
            "/api/booking/hours",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load working hours."
          );
        }

        const data =
          await response.json();

        if (!cancelled) {
          setHours(
            Array.isArray(data.hours)
              ? data.hours
              : []
          );
        }
      } catch (error) {
        console.error(
          "Calendar hours loading failed:",
          error
        );

        if (!cancelled) {
          setHours([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHours();

    return () => {
      cancelled = true;
    };
  }, []);

  const firstDayOffset =
    (dates[0].getDay() + 6) % 7;

  const selectedDateKey =
    booking.date
      ? dateKey(booking.date)
      : "";

  const getHoursForDate =
    (date: Date) =>
      hours.find(
        (item) =>
          item.dayOfWeek ===
          date.getDay()
      );

  return (
    <div>
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Two
        </p>

        <h2 className="mt-4 text-3xl font-normal leading-tight text-white sm:text-4xl md:text-5xl">
          Choose Your Date
        </h2>

        <p className="mt-5 text-white/75">
          Select a convenient appointment date,
          then continue from the top.
        </p>
      </div>

      {loading ? (
        <div className="mt-10 grid grid-cols-7 gap-4 max-sm:mt-8 max-sm:gap-2">
          {Array.from(
            { length: 21 }
          ).map((_, index) => (
            <div
              key={index}
              className="h-[120px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-7 gap-4 max-sm:mt-8 max-sm:gap-2">
          {[
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
          ].map((day) => (
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
            <div
              key={`empty-${index}`}
            />
          ))}

          {dates.map((date) => {
            const schedule =
              getHoursForDate(date);

            const closed =
              !schedule?.isOpen;

            const selected =
              selectedDateKey ===
              dateKey(date);

            return (
              <button
                key={dateKey(date)}
                type="button"
                disabled={closed}
                onClick={() => {
                  if (closed) {
                    return;
                  }

                  setDate(date);

                  updateBooking({
                    time: "",
                  });
                }}
                className={[
                  "booking-card min-h-[120px] rounded-2xl border p-5 max-sm:min-h-[76px] max-sm:rounded-xl max-sm:p-2",
                  "transition-all duration-300",
                  closed
                    ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/55"
                    : selected
                      ? "booking-card-active border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,.25)]"
                      : "border-white/10 bg-white/5 text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/10",
                ].join(" ")}
              >
                <div className="text-xs uppercase tracking-[0.2em] text-white/75 max-sm:text-[8px] max-sm:tracking-normal">
                  {date.toLocaleDateString(
                    "en-GB",
                    {
                      weekday: "short",
                    }
                  )}
                </div>

                <div
                  className={`mt-2 text-2xl max-sm:mt-1 max-sm:text-xl ${
                    selected
                      ? "text-[#D4AF37]"
                      : "text-white"
                  }`}
                >
                  {date.getDate()}
                </div>

                <div className="mt-2 text-xs text-white/70 max-sm:mt-1 max-sm:text-[9px]">
                  {date.toLocaleDateString(
                    "en-GB",
                    {
                      month: "short",
                    }
                  )}
                </div>


              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

