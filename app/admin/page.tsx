"use client";

import Link from "next/link";
import {
  CalendarDays,
  CalendarCheck,
  Users,
  Sparkles,
  UserRound,
  CreditCard,
  Settings,
  LayoutDashboard,
  Clock3,
  LogOut,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  CircleAlert,
  XCircle,
  UserPlus,
Gift,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const menu = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Bookings", icon: CalendarCheck, path: "/admin/bookings" },
  { label: "Calendar", icon: CalendarDays, path: "/admin/calendar" },
  { label: "Customers", icon: Users, path: "/admin/customers" },
  { label: "Services", icon: Sparkles, path: "/admin/services" },
  { label: "Techs", icon: UserRound, path: "/admin/techs" },
  { label: "Payments", icon: CreditCard, path: "/admin/payments" },
  { label: "Gift Cards", icon: Gift, path: "/admin/gift-cards" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

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

type Customer = {
  id: string;
  customerNo?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  status?: string;
};

function getLondonDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(date);
}

function formatStatus(status: BookingStatus) {
  return status.replace("_", " ");
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
      return Clock3;

    case "COMPLETED":
      return CheckCircle2;

    case "CANCELLED":
      return XCircle;

    case "NO_SHOW":
      return CircleAlert;

    default:
      return Clock3;
  }
}

function getBookingDate(booking: Booking) {
  return booking.date.split("T")[0];
}

export default function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const today = getLondonDate();

  async function loadDashboard(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [bookingsResponse, customersResponse] =
        await Promise.all([
          fetch("/api/admin/bookings", {
            cache: "no-store",
          }),
          fetch("/api/admin/customers", {
            cache: "no-store",
          }),
        ]);

      const [bookingsData, customersData] =
        await Promise.all([
          bookingsResponse.json(),
          customersResponse.json(),
        ]);

      if (!bookingsResponse.ok) {
        throw new Error(
          bookingsData.error ||
            "Unable to load bookings."
        );
      }

      if (!customersResponse.ok) {
        throw new Error(
          customersData.error ||
            "Unable to load customers."
        );
      }

      setBookings(bookingsData.bookings || []);
      setCustomers(customersData.customers || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadDashboard();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleLogout() {
    try {
      const response = await fetch(
        "/api/admin/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/admin-login");
      router.refresh();
    } catch {
      alert(
        "Unable to logout. Please try again."
      );
    }
  }

  const todaysBookings = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          getBookingDate(booking) === today &&
          booking.status !== "CANCELLED" &&
          booking.status !== "NO_SHOW"
      )
      .sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
  }, [bookings, today]);

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          getBookingDate(booking) >= today &&
          booking.status !== "CANCELLED" &&
          booking.status !== "NO_SHOW"
      )
      .sort((a, b) => {
        const dateCompare =
          getBookingDate(a).localeCompare(
            getBookingDate(b)
          );

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return a.startTime.localeCompare(
          b.startTime
        );
      });
  }, [bookings, today]);

  const todaysRevenue = useMemo(() => {
    return todaysBookings.reduce((total, booking) => {
      if (booking.payment?.status === "PAID") {
        return total + Number(booking.payment.amount);
      }

      return total;
    }, 0);
  }, [todaysBookings]);

  const pendingCount = useMemo(() => {
    return bookings.filter(
      (booking) =>
        booking.status === "PENDING"
    ).length;
  }, [bookings]);

  const confirmedCount = useMemo(() => {
    return bookings.filter(
      (booking) =>
        booking.status === "CONFIRMED"
    ).length;
  }, [bookings]);

  const completedCount = useMemo(() => {
    return bookings.filter(
      (booking) =>
        booking.status === "COMPLETED"
    ).length;
  }, [bookings]);

  const cancelledCount = useMemo(() => {
    return bookings.filter(
      (booking) =>
        booking.status === "CANCELLED"
    ).length;
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const dateCompare =
          getBookingDate(b).localeCompare(
            getBookingDate(a)
          );

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return b.startTime.localeCompare(
          a.startTime
        );
      })
      .slice(0, 6);
  }, [bookings]);

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-black/30 p-6 lg:flex lg:flex-col">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
              Orane Ickenham
            </p>

            <h1 className="mt-2 text-2xl font-light">
              Admin Panel
            </h1>
          </div>

          <nav className="flex-1 space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.path;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    router.push(item.path)
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                    isActive
                      ? "bg-[#D4AF37]/15 text-[#D4AF37]"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white/50 transition hover:bg-red-400/10 hover:text-red-300"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <section className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          {/* HEADER */}
          <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
                Management
              </p>

              <h2 className="mt-2 text-3xl font-light sm:text-4xl">
                Dashboard
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Welcome back. Here&apos;s what&apos;s
                happening at ORANE ICKENHAM today.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </header>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* STAT CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Today's Bookings"
              value={
                loading
                  ? "—"
                  : String(todaysBookings.length)
              }
              description="Appointments scheduled today"
              icon={CalendarCheck}
            />

            <StatCard
              label="Upcoming"
              value={
                loading
                  ? "—"
                  : String(upcomingBookings.length)
              }
              description="Active future appointments"
              icon={Clock3}
            />

            <StatCard
              label="Today's Revenue"
              value={
                loading
                  ? "—"
                  : formatMoney(todaysRevenue)
              }
              description="Paid bookings today"
              icon={CreditCard}
            />

            <StatCard
              label="Total Customers"
              value={
                loading
                  ? "—"
                  : String(customers.length)
              }
              description="Customers in your database"
              icon={Users}
            />
          </div>

          {/* QUICK ACTIONS */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                Quick Actions
              </p>

              <h3 className="mt-1 text-xl font-light">
                Manage your salon
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <QuickAction
                href="/admin/bookings"
                icon={CalendarCheck}
                title="Manage Bookings"
                description="View and manage appointments"
              />

              <QuickAction
                href="/admin/calendar"
                icon={CalendarDays}
                title="Open Calendar"
                description="See the appointment schedule"
              />

              <QuickAction
                href="/admin/customers"
                icon={UserPlus}
                title="Customers"
                description="Manage customer records"
              />

              <QuickAction
                href="/admin/services"
                icon={Sparkles}
                title="Services"
                description="Manage salon treatments"
              />
            </div>
          </section>

          {/* TODAY + STATUS */}
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
            {/* TODAY */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                    Today
                  </p>

                  <h3 className="mt-1 text-xl font-light">
                    Today&apos;s Schedule
                  </h3>
                </div>

                <Link
                  href="/admin/calendar"
                  className="flex items-center gap-1 text-xs text-white/40 transition hover:text-[#D4AF37]"
                >
                  Calendar
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              {loading ? (
                <div className="p-10 text-center text-sm text-white/40">
                  Loading today&apos;s schedule...
                </div>
              ) : todaysBookings.length === 0 ? (
                <div className="p-10 text-center">
                  <CalendarCheck
                    size={30}
                    className="mx-auto text-white/20"
                  />

                  <p className="mt-4 text-sm text-white/50">
                    No appointments scheduled
                    for today.
                  </p>

                  <Link
                    href="/admin/bookings"
                    className="mt-4 inline-flex rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 text-xs text-[#D4AF37] transition hover:bg-[#D4AF37]/15"
                  >
                    Manage Bookings
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {todaysBookings
                    .slice(0, 7)
                    .map((booking) => {
                      const StatusIcon =
                        statusIcon(
                          booking.status
                        );

                      return (
                        <Link
                          key={booking.id}
                          href="/admin/bookings"
                          className="grid gap-4 p-5 transition hover:bg-white/[0.025] sm:grid-cols-[85px_1fr_1fr_110px] sm:items-center"
                        >
                          <div>
                            <p className="text-sm text-[#D4AF37]">
                              {booking.startTime}
                            </p>

                            <p className="mt-1 text-xs text-white/30">
                              {booking.endTime
                                ? `until ${booking.endTime}`
                                : `${booking.service.duration} min`}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-white">
                              {booking.customer.name}
                            </p>

                            <p className="mt-1 text-xs text-white/35">
                              {booking.bookingNo}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-white/80">
                              {booking.service.name}
                            </p>

                            <p className="mt-1 text-xs text-white/35">
                              {booking.tech
                                ? booking.tech.name
                                : "Unassigned"}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                            <p className="text-sm">
                              {formatMoney(
                                Number(
                                  booking.service
                                    .price
                                )
                              )}
                            </p>

                            <span
                              className={`inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${statusClass(
                                booking.status
                              )}`}
                            >
                              <StatusIcon size={12} />
                              {formatStatus(
                                booking.status
                              )}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              )}

              {todaysBookings.length > 7 && (
                <div className="border-t border-white/10 p-4 text-center">
                  <Link
                    href="/admin/bookings"
                    className="text-xs text-white/40 transition hover:text-[#D4AF37]"
                  >
                    View all {todaysBookings.length}{" "}
                    appointments
                  </Link>
                </div>
              )}
            </section>

            {/* STATUS OVERVIEW */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                Overview
              </p>

              <h3 className="mt-1 text-xl font-light">
                Booking Status
              </h3>

              <div className="mt-6 space-y-4">
                <StatusRow
                  label="Pending"
                  value={pendingCount}
                  className="text-yellow-400"
                />

                <StatusRow
                  label="Confirmed"
                  value={confirmedCount}
                  className="text-[#D4AF37]"
                />

                <StatusRow
                  label="Completed"
                  value={completedCount}
                  className="text-emerald-300"
                />

                <StatusRow
                  label="Cancelled"
                  value={cancelledCount}
                  className="text-red-300"
                />
              </div>

              <div className="mt-7 border-t border-white/10 pt-5">
                <p className="text-xs text-white/30">
                  Total bookings
                </p>

                <p className="mt-1 text-2xl font-light">
                  {loading ? "—" : bookings.length}
                </p>
              </div>
            </section>
          </div>

          {/* RECENT BOOKINGS */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                  Activity
                </p>

                <h3 className="mt-1 text-xl font-light">
                  Recent Bookings
                </h3>
              </div>

              <Link
                href="/admin/bookings"
                className="flex items-center gap-1 text-xs text-white/40 transition hover:text-[#D4AF37]"
              >
                View all
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm text-white/40">
                Loading bookings...
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="p-10 text-center text-sm text-white/40">
                No bookings found.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href="/admin/bookings"
                    className="grid gap-4 p-5 transition hover:bg-white/[0.025] sm:grid-cols-[100px_1.2fr_1.3fr_120px_120px] sm:items-center"
                  >
                    <div>
                      <p className="text-sm text-[#D4AF37]">
                        {booking.startTime}
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        {formatDate(
                          booking.date
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm">
                        {booking.customer.name}
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        {booking.bookingNo}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-white/80">
                        {booking.service.name}
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        {booking.tech
                          ? booking.tech.name
                          : "Unassigned"}
                      </p>
                    </div>

                    <p className="text-sm">
                      {formatMoney(
                        Number(
                          booking.service.price
                        )
                      )}
                    </p>

                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-[11px] ${statusClass(
                        booking.status
                      )}`}
                    >
                      {formatStatus(
                        booking.status
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof CalendarCheck;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:border-[#D4AF37]/20 hover:bg-white/[0.055]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-white/50">
          {label}
        </span>

        <Icon
          size={18}
          className="shrink-0 text-[#D4AF37]"
        />
      </div>

      <p className="mt-4 text-3xl font-light">
        {value}
      </p>

      <p className="mt-2 text-xs text-white/30">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof CalendarCheck;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#D4AF37]/20 hover:bg-[#D4AF37]/[0.04]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/[0.06]">
          <Icon
            size={18}
            className="text-[#D4AF37]"
          />
        </div>

        <ArrowUpRight
          size={16}
          className="text-white/20 transition group-hover:text-[#D4AF37]"
        />
      </div>

      <p className="mt-4 text-sm text-white">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-white/35">
        {description}
      </p>
    </Link>
  );
}

function StatusRow({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`h-2 w-2 rounded-full bg-current ${className}`}
        />

        <span className="text-sm text-white/55">
          {label}
        </span>
      </div>

      <span
        className={`text-sm font-medium ${className}`}
      >
        {value}
      </span>
    </div>
  );
}
