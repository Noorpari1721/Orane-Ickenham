"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Loader2,
  RefreshCw,
} from "lucide-react";

import { useBooking } from "@/context/BookingContext";

type AvailabilitySlot = {
  time: string;
  techId: string;
  techNo: string;
  techName: string;
  role: string;
  image: string;
};

type AvailabilityResponse = {
  success?: boolean;
  available?: boolean;
  slots?: AvailabilitySlot[];
  error?: string;
  reason?: string;
};

function getLondonDateParts(date: Date) {
  const formatter =
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const parts =
    formatter.formatToParts(date);

  const get = (type: string) =>
    Number(
      parts.find(
        (part) => part.type === type
      )?.value ?? 0
    );

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

function dateKey(date: Date) {
  const parts =
    getLondonDateParts(date);

  return `${parts.year}-${String(
    parts.month
  ).padStart(2, "0")}-${String(
    parts.day
  ).padStart(2, "0")}`;
}

export default function Step5Time() {
  const {
    booking,
    updateBooking,
    nextStep,
  } = useBooking();

  const [slots, setSlots] =
    useState<AvailabilitySlot[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [now, setNow] =
    useState(() => new Date());

  const selectedDateKey = useMemo(
    () =>
      booking.date
        ? dateKey(booking.date)
        : "",
    [booking.date]
  );

  const todayKey = useMemo(
    () => dateKey(now),
    [now]
  );

  const selectedDateIsToday =
    Boolean(selectedDateKey) &&
    selectedDateKey === todayKey;

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setNow(new Date());
      }, 30000);

    return () =>
      window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      if (
        !booking.date ||
        !booking.service?.id
      ) {
        setSlots([]);
        setLoading(false);

        setError(
          "Please select a service and date first."
        );

        return;
      }

      try {
        setLoading(true);
        setError("");
        setSlots([]);

        const params =
          new URLSearchParams();

        params.set(
          "date",
          selectedDateKey
        );

        params.set(
          "serviceId",
          String(
            booking.service.id
          )
        );

        const response =
          await fetch(
            `/api/booking/availability?${params.toString()}`,
            {
              method: "GET",
              cache: "no-store",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const raw =
          await response.text();

        let data: AvailabilityResponse =
          {};

        if (raw.trim()) {
          try {
            data = JSON.parse(raw);
          } catch {
            throw new Error(
              `Availability server returned invalid data (${response.status}).`
            );
          }
        } else {
          throw new Error(
            `Availability server returned an empty response (${response.status}).`
          );
        }

        if (
          !response.ok ||
          data.success === false
        ) {
          throw new Error(
            data.error ||
              data.reason ||
              "Unable to load appointment availability."
          );
        }

        if (!cancelled) {
          setSlots(
            Array.isArray(data.slots)
              ? data.slots
              : []
          );
        }
      } catch (err) {
        console.error(
          "Step5 availability error:",
          err
        );

        if (!cancelled) {
          setSlots([]);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load appointment availability."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [
    booking.date,
    booking.service?.id,
    selectedDateKey,
  ]);

  const handleSelectTime = (
    slot: AvailabilitySlot
  ) => {
    /*
     * Staff is no longer selected by the customer.
     *
     * The system has already found an available
     * technician for this appointment time.
     */
    updateBooking({
      time: slot.time,

      staff: {
        id: slot.techId,
        techNo: slot.techNo,
        name: slot.techName,
        role: slot.role,
        image: slot.image,
      },
    });

    window.setTimeout(() => {
      if (booking.editingReview) {
        updateBooking({
          editingReview: false,
          step: 6,
        });
      } else {
        nextStep();
      }
    }, 250);
  };

  return (
    <div>
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Four
        </p>

        <h2 className="mt-4 text-5xl font-light text-white">
          Choose Your Time
        </h2>

        <p className="mt-5 text-white/60">
          Select an available appointment slot.
        </p>

        <p className="mt-3 text-sm text-white/40">
          Showing live availability for your selected service.
        </p>

        {selectedDateIsToday && (
          <p className="mt-2 text-xs text-[#D4AF37]/70">
            Earlier appointment times are no longer available today.
          </p>
        )}

        {loading && (
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-white/40">
            <Loader2
              size={15}
              className="animate-spin text-[#D4AF37]"
            />
            Checking availability...
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto mt-5 max-w-xl rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          slots.length === 0 && (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <p className="text-lg text-white">
                No appointments available.
              </p>

              <p className="mt-2 text-sm text-white/40">
                Please choose another date.
              </p>
            </div>
          )}
      </div>

      {!loading &&
        !error &&
        slots.length > 0 && (
          <div className="mt-10 grid grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {slots.map((slot) => {
              const selected =
                booking.time ===
                slot.time;

              return (
                <button
                  key={`${slot.time}-${slot.techId}`}
                  type="button"
                  onClick={() =>
                    handleSelectTime(slot)
                  }
                  className={`rounded-2xl border px-6 py-5 max-sm:rounded-xl max-sm:px-1 max-sm:py-4 max-sm:text-xs transition-all duration-300 ${
                    selected
                      ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,.3)]"
                      : "border-white/10 bg-white/5 text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/5"
                  }`}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        )}

      {!loading && error && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 px-6 py-3 text-sm text-[#D4AF37] transition hover:bg-[#D4AF37]/10"
          >
            <RefreshCw size={15} />
            Reload
          </button>
        </div>
      )}
    </div>
  );
}
