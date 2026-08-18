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
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatTime(value: string) {
  const [hourString, minute] = value.split(":");
  const hour = Number(hourString);

  if (!Number.isFinite(hour)) return value;

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
}

export default function Step4Calendar() {
  const {
    booking,
    setDate,
    updateBooking,
    nextStep,
  } = useBooking();

  const [hours, setHours] = useState<WorkingHour[]>([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => {
    const value = new Date();
    value.setHours(12, 0, 0, 0);
    return value;
  }, []);

  const dates = useMemo(
    () =>
      Array.from({ length: 21 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        date.setHours(12, 0, 0, 0);
        return date;
      }),
    [today]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadHours() {
      try {
        const response = await fetch("/api/booking/hours", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load working hours.");
        }

        const data = await response.json();

        if (!cancelled) {
          setHours(
            Array.isArray(data.hours)
              ? data.hours
              : []
          );
        }
      } catch (error) {
        console.error(
          "Step4Calendar hours loading failed:",
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

  const selectedDateKey = booking.date
    ? dateKey(booking.date)
    : "";

  const getHoursForDate = (date: Date) =>
    hours.find(
      (item) => item.dayOfWeek === date.getDay()
    );

  const openDays = hours.filter(
    (item) => item.isOpen
  );

  const openingSummary = openDays.length
    ? `${openDays[0].day} ${formatTime(
        openDays[0].openTime
      )} – ${formatTime(openDays[0].closeTime)}`
    : "";

  return (
    <div>
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Three
        </p>

        <h2 className="mt-4 text-5xl font-light text-white">
          Choose Your Date
        </h2>

        <p className="mt-5 text-white/60">
          Select a convenient appointment date.
        </p>

        {!loading && hours.length > 0 && (
          <p className="mt-3 text-sm text-white/40">
            Salon hours are updated automatically from
            our current schedule.
          </p>
        )}

        {!loading && openDays.length > 0 && (
          <p className="mt-2 text-sm text-[#D4AF37]/70">
            {openingSummary}
            {openDays.length > 1 &&
              " · Other days may have different hours"}
          </p>
        )}
      </div>

      {loading ? (
        <div className="mt-10 grid grid-cols-7 gap-4">
          {Array.from({ length: 21 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-[120px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
              />
            )
          )}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-7 gap-4">
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
            <div key={`empty-${index}`} />
          ))}

          {dates.map((date) => {
            const schedule =
              getHoursForDate(date);

            const closed =
              !schedule?.isOpen;

            const selected =
              selectedDateKey === dateKey(date);

            return (
              <button
                key={dateKey(date)}
                type="button"
                disabled={closed}
                onClick={() => {
                  if (closed) return;

                  setDate(date);

                  updateBooking({
                    time: "",
                  });

                  setTimeout(() => {
                    if (booking.editingReview) {
                      updateBooking({
                        editingReview: false,
                        step: 6,
                      });
                    } else {
                      nextStep();
                    }
                  }, 250);
                }}
                className={[
                  "booking-card min-h-[120px] rounded-2xl border p-5",
                  "transition-all duration-300",
                  closed
                    ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20"
                    : selected
                    ? "booking-card-active border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,.25)]"
                    : "border-white/10 bg-white/5 text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/10",
                ].join(" ")}
              >
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                  {date.toLocaleDateString(
                    "en-GB",
                    {
                      weekday: "short",
                    }
                  )}
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
                  {date.toLocaleDateString(
                    "en-GB",
                    {
                      month: "short",
                    }
                  )}
                </div>

                <div
                  className={`mt-3 text-[10px] ${
                    closed
                      ? "text-white/20"
                      : "text-white/35"
                  }`}
                >
                  {closed
                    ? "Closed"
                    : `${formatTime(
                        schedule.openTime
                      )} – ${formatTime(
                        schedule.closeTime
                      )}`}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
