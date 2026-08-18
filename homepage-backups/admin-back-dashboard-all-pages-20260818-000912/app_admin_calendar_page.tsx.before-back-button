"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock3,
  RefreshCw,
  ArrowUpRight,
  UserRound,
  Sparkles,
  PoundSterling,
  CheckCircle2,
  CircleAlert,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

type Booking = {
  id: string;
  bookingNo: string;
  date: string;
  startTime: string;
  endTime: string | null;
  status: BookingStatus;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  service: {
    id: string;
    name: string;
    category: string;
    duration: number;
    price: number;
  };
  tech: {
    id: string;
    name: string;
  } | null;
  payment: {
    id: string;
    amount: number;
    status: string;
    method: string;
    paidAt: string | null;
  } | null;
};

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getBookingDate(booking: Booking) {
  return booking.date.split("T")[0];
}

function statusClass(status: BookingStatus) {
  switch (status) {
    case "CONFIRMED":
      return "border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37]";

    case "PENDING":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

    case "COMPLETED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "CANCELLED":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    case "NO_SHOW":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    default:
      return "border-white/10 bg-white/5 text-white/50";
  }
}

function statusIcon(status: BookingStatus) {
  switch (status) {
    case "CONFIRMED":
      return CheckCircle2;

    case "PENDING":
      return CircleAlert;

    case "COMPLETED":
      return CheckCircle2;

    case "CANCELLED":
      return XCircle;

    case "NO_SHOW":
      return CircleAlert;

    default:
      return CircleAlert;
  }
}

function getCalendarDays(currentMonth: Date) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const mondayIndex =
    (firstDay.getDay() + 6) % 7;

  const daysInMonth = lastDay.getDate();

  const previousMonthLastDay = new Date(
    year,
    month,
    0
  ).getDate();

  const days: {
    date: Date;
    currentMonth: boolean;
  }[] = [];

  for (
    let i = mondayIndex - 1;
    i >= 0;
    i--
  ) {
    days.push({
      date: new Date(
        year,
        month - 1,
        previousMonthLastDay - i
      ),
      currentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: new Date(year, month, day),
      currentMonth: true,
    });
  }

  while (days.length < 42) {
    const nextDay =
      days.length -
      (mondayIndex + daysInMonth) +
      1;

    days.push({
      date: new Date(
        year,
        month + 1,
        nextDay
      ),
      currentMonth: false,
    });
  }

  return days;
}

export default function AdminCalendarPage() {
  const now = new Date();

  const [currentMonth, setCurrentMonth] =
    useState(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )
    );

  const [selectedDate, setSelectedDate] =
    useState(now);

  const [bookings, setBookings] = useState<
    Booking[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loadBookings(
    showRefresh = false
  ) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/admin/bookings",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load bookings."
        );
      }

      setBookings(data.bookings || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load calendar data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth]
  );

  const selectedDateKey =
    dateKey(selectedDate);

  const selectedBookings = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          getBookingDate(booking) ===
          selectedDateKey
      )
      .sort((a, b) =>
        a.startTime.localeCompare(
          b.startTime
        )
      );
  }, [bookings, selectedDateKey]);

  const bookingsByDate = useMemo(() => {
    const map = new Map<
      string,
      Booking[]
    >();

    bookings.forEach((booking) => {
      const key = getBookingDate(booking);

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(booking);
    });

    return map;
  }, [bookings]);

  const monthBookingCount = useMemo(() => {
    return bookings.filter((booking) => {
      const bookingDate =
        getBookingDate(booking);

      return (
        bookingDate.startsWith(
          `${currentMonth.getFullYear()}-${String(
            currentMonth.getMonth() + 1
          ).padStart(2, "0")}`
        )
      );
    }).length;
  }, [bookings, currentMonth]);

  function goPreviousMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  }

  function goNextMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  }

  function goToday() {
    const today = new Date();

    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

    setSelectedDate(today);
  }

  function isToday(date: Date) {
    const today = new Date();

    return (
      date.getFullYear() ===
        today.getFullYear() &&
      date.getMonth() ===
        today.getMonth() &&
      date.getDate() ===
        today.getDate()
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="p-5 sm:p-8 lg:p-10">
        {/* HEADER */}
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
  <div>
    <Link
      href="/admin"
      className="mb-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-[#D4AF37]"
    >
      <span aria-hidden="true">←</span>
      Admin Dashboard
    </Link>

    <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
      Management
    </p>

    <h1 className="mt-2 text-3xl font-light sm:text-4xl">
      Calendar
    </h1>

    <p className="mt-2 text-sm text-white/50">
      View and manage your salon appointments.
    </p>
  </div>
</header>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* CALENDAR TOOLBAR */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col gap-5 border-b border-white/10 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                {monthBookingCount}{" "}
                {monthBookingCount === 1
                  ? "booking"
                  : "bookings"}
              </p>

              <h2 className="mt-1 text-2xl font-light">
                {formatMonth(currentMonth)}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToday}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white/60 transition hover:bg-white/[0.07] hover:text-white"
              >
                Today
              </button>

              <button
                type="button"
                onClick={goPreviousMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/50 transition hover:bg-white/[0.07] hover:text-white"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={goNextMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/50 transition hover:bg-white/[0.07] hover:text-white"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* WEEKDAY HEADERS */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="border-r border-white/10 p-3 text-center text-[10px] uppercase tracking-[0.15em] text-white/30 last:border-r-0 sm:p-4 sm:text-xs"
              >
                <span className="hidden sm:inline">
                  {day}
                </span>

                <span className="sm:hidden">
                  {day.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>

          {/* CALENDAR GRID */}
          {loading ? (
            <div className="flex min-h-[500px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-white/40">
                <RefreshCw
                  size={17}
                  className="animate-spin"
                />
                Loading calendar...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calendarDays.map(
                ({
                  date,
                  currentMonth: isCurrentMonth,
                }) => {
                  const key = dateKey(date);

                  const dayBookings =
                    bookingsByDate.get(key) ||
                    [];

                  const selected =
                    key === selectedDateKey;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setSelectedDate(date)
                      }
                      className={`group relative min-h-[100px] border-b border-r border-white/10 p-2 text-left transition last:border-r-0 sm:min-h-[125px] sm:p-3 ${
                        selected
                          ? "bg-[#D4AF37]/[0.07]"
                          : "hover:bg-white/[0.025]"
                      } ${
                        !isCurrentMonth
                          ? "opacity-30"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                            isToday(date)
                              ? "bg-[#D4AF37] font-medium text-black"
                              : selected
                                ? "border border-[#D4AF37]/40 text-[#D4AF37]"
                                : "text-white/60"
                          }`}
                        >
                          {date.getDate()}
                        </span>

                        {dayBookings.length >
                          0 && (
                          <span className="text-[10px] text-white/25">
                            {dayBookings.length}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1.5">
                        {dayBookings
                          .slice(0, 3)
                          .map(
                            (booking) => (
                              <div
                                key={
                                  booking.id
                                }
                                className={`truncate rounded-md border px-1.5 py-1 text-[9px] sm:text-[10px] ${statusClass(
                                  booking.status
                                )}`}
                              >
                                <span className="font-medium">
                                  {
                                    booking.startTime
                                  }
                                </span>{" "}
                                <span className="hidden sm:inline">
                                  {
                                    booking
                                      .customer
                                      .name
                                  }
                                </span>
                              </div>
                            )
                          )}

                        {dayBookings.length >
                          3 && (
                          <p className="px-1 text-[9px] text-white/30">
                            +
                            {dayBookings.length -
                              3}{" "}
                            more
                          </p>
                        )}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* SELECTED DAY */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.07]">
                <CalendarDays
                  size={19}
                  className="text-[#D4AF37]"
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                  Selected Day
                </p>

                <h2 className="mt-1 text-lg font-light sm:text-xl">
                  {formatLongDate(
                    selectedDate
                  )}
                </h2>
              </div>
            </div>

            <p className="text-xs text-white/35">
              {selectedBookings.length}{" "}
              {selectedBookings.length === 1
                ? "appointment"
                : "appointments"}{" "}
              scheduled
            </p>
          </div>

          {selectedBookings.length ===
          0 ? (
            <div className="p-10 text-center">
              <CalendarDays
                size={32}
                className="mx-auto text-white/15"
              />

              <p className="mt-4 text-sm text-white/45">
                No appointments scheduled
                for this day.
              </p>

              <Link
                href="/admin/bookings"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2.5 text-xs text-[#D4AF37] transition hover:bg-[#D4AF37]/15"
              >
                Manage Bookings
                <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {selectedBookings.map(
                (booking) => {
                  const StatusIcon =
                    statusIcon(
                      booking.status
                    );

                  return (
                    <Link
                      key={booking.id}
                      href="/admin/bookings"
                      className="block p-5 transition hover:bg-white/[0.025] sm:p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                        {/* TIME */}
                        <div className="flex items-center gap-3 lg:w-28 lg:shrink-0">
                          <Clock3
                            size={17}
                            className="text-[#D4AF37]"
                          />

                          <div>
                            <p className="text-sm text-[#D4AF37]">
                              {
                                booking.startTime
                              }
                            </p>

                            <p className="mt-1 text-[11px] text-white/30">
                              {booking.endTime
                                ? `until ${booking.endTime}`
                                : `${booking.service.duration} min`}
                            </p>
                          </div>
                        </div>

                        {/* CUSTOMER */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <UserRound
                              size={15}
                              className="text-white/30"
                            />

                            <p className="text-sm text-white">
                              {
                                booking
                                  .customer
                                  .name
                              }
                            </p>
                          </div>

                          <p className="mt-1 text-xs text-white/30">
                            {
                              booking
                                .customer
                                .email
                            }
                          </p>
                        </div>

                        {/* SERVICE */}
                        <div className="min-w-0 lg:w-56">
                          <div className="flex items-center gap-2">
                            <Sparkles
                              size={15}
                              className="text-white/30"
                            />

                            <p className="truncate text-sm text-white/80">
                              {
                                booking
                                  .service
                                  .name
                              }
                            </p>
                          </div>

                          <p className="mt-1 text-xs text-white/30">
                            {
                              booking
                                .service
                                .duration
                            }{" "}
                            minutes
                          </p>
                        </div>

                        {/* TECH */}
                        <div className="lg:w-40">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                            Technician
                          </p>

                          <p className="mt-1 text-sm text-white/65">
                            {booking.tech
                              ? booking.tech
                                  .name
                              : "Unassigned"}
                          </p>
                        </div>

                        {/* PRICE + STATUS */}
                        <div className="flex items-center justify-between gap-5 lg:w-40 lg:flex-col lg:items-end">
                          <div className="flex items-center gap-1.5">
                            <PoundSterling
                              size={14}
                              className="text-white/30"
                            />

                            <p className="text-sm">
                              {formatMoney(
                                Number(
                                  booking
                                    .service
                                    .price
                                )
                              )}
                            </p>
                          </div>

                          <span
                            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] ${statusClass(
                              booking.status
                            )}`}
                          >
                            <StatusIcon
                              size={12}
                            />

                            {booking.status.replace(
                              "_",
                              " "
                            )}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
