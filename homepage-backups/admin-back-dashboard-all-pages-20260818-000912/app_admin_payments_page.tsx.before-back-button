"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCw,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "REFUNDED"
  | "FAILED";

type Payment = {
  id: string;
  paymentNo: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  transactionId: string | null;
  paidAt: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  booking: {
    id: string;
    bookingNo: string;
    date: string;
    startTime: string;
    service: string;
  };
};

type Booking = {
  id: string;
  bookingNo: string;
  date: string;
  startTime: string;
  service: {
    name: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  payment: {
    id: string;
    paymentNo: string;
    amount: number;
    method: string;
    status: PaymentStatus;
    transactionId: string | null;
    paidAt: string | null;
  } | null;
};

const STATUS_OPTIONS = [
  "All",
  "PAID",
  "PENDING",
  "REFUNDED",
  "FAILED",
];

function formatMoney(amount: number) {
  const pound = String.fromCharCode(163);
  return `${pound}${amount.toFixed(2)}`;
}

function formatDateTime(value: string | null) {
  if (!value) return "...";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Europe/London",
  }).format(date);
}

function statusClass(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "PENDING":
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";

    case "REFUNDED":
      return "border-purple-400/20 bg-purple-400/10 text-purple-300";

    case "FAILED":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    default:
      return "border-white/10 bg-white/5 text-white/50";
  }
}

function statusIcon(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return CheckCircle2;

    case "PENDING":
      return Clock3;

    case "REFUNDED":
      return RotateCcw;

    case "FAILED":
      return XCircle;

    default:
      return Clock3;
  }
}

function normalizePayment(
  booking: Booking
): Payment | null {
  if (!booking.payment) {
    return null;
  }

  return {
    id: booking.payment.id,
    paymentNo: booking.payment.paymentNo,
    amount: Number(booking.payment.amount),
    method: booking.payment.method,
    status: booking.payment.status,
    transactionId: booking.payment.transactionId,
    paidAt: booking.payment.paidAt,
    customer: {
      id: booking.customer.id,
      name: booking.customer.name,
      email: booking.customer.email,
    },
    booking: {
      id: booking.id,
      bookingNo: booking.bookingNo,
      date: booking.date,
      startTime: booking.startTime,
      service: booking.service.name,
    },
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadPayments(showRefresh = false) {
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
          data.error || "Unable to load payment data."
        );
      }

      const bookingList: Booking[] =
        data.bookings || [];

      const paymentList = bookingList
        .map(normalizePayment)
        .filter(
          (
            payment
          ): payment is Payment =>
            payment !== null
        )
        .sort((a, b) => {
          const aDate =
            a.paidAt || a.booking.date;

          const bDate =
            b.paidAt || b.booking.date;

          return (
            new Date(bDate).getTime() -
            new Date(aDate).getTime()
          );
        });

      setPayments(paymentList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payments."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !query ||
        payment.customer.name
          .toLowerCase()
          .includes(query) ||
        payment.customer.email
          .toLowerCase()
          .includes(query) ||
        payment.paymentNo
          .toLowerCase()
          .includes(query) ||
        payment.booking.bookingNo
          .toLowerCase()
          .includes(query) ||
        payment.booking.service
          .toLowerCase()
          .includes(query) ||
        payment.method
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        payment.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [payments, search, statusFilter]);

  const paidRevenue = useMemo(
    () =>
      payments
        .filter(
          (payment) =>
            payment.status === "PAID"
        )
        .reduce(
          (sum, payment) =>
            sum + payment.amount,
          0
        ),
    [payments]
  );

  const pendingAmount = useMemo(
    () =>
      payments
        .filter(
          (payment) =>
            payment.status === "PENDING"
        )
        .reduce(
          (sum, payment) =>
            sum + payment.amount,
          0
        ),
    [payments]
  );

  const refundedAmount = useMemo(
    () =>
      payments
        .filter(
          (payment) =>
            payment.status === "REFUNDED"
        )
        .reduce(
          (sum, payment) =>
            sum + payment.amount,
          0
        ),
    [payments]
  );

  const failedCount = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.status === "FAILED"
      ).length,
    [payments]
  );

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-[1600px]">

          <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/admin"
                className="mb-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-[#D4AF37]"
              >
                <ArrowLeft size={14} />
                Admin Dashboard
              </Link>

              <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
                Management
              </p>

              <h1 className="mt-2 text-3xl font-light sm:text-4xl">
                Payments
              </h1>

              <p className="mt-2 text-sm text-white/50">
                Track payment activity and transaction history.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadPayments(true)}
              disabled={refreshing}
              className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />
              Refresh
            </button>
          </header>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Paid Revenue"
              value={
                loading
                  ? "..."
                  : formatMoney(paidRevenue)
              }
              description="Successful payments"
              icon={CreditCard}
            />

            <StatCard
              label="Pending"
              value={
                loading
                  ? "..."
                  : formatMoney(pendingAmount)
              }
              description="Awaiting payment"
              icon={Clock3}
            />

            <StatCard
              label="Refunded"
              value={
                loading
                  ? "..."
                  : formatMoney(refundedAmount)
              }
              description="Refunded payments"
              icon={RotateCcw}
            />

            <StatCard
              label="Failed"
              value={
                loading
                  ? "..."
                  : String(failedCount)
              }
              description="Failed transactions"
              icon={XCircle}
            />
          </div>

          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="relative min-w-0 flex-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search customer, payment, booking or service..."
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-[#D4AF37]/30"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => {
                  const active =
                    statusFilter === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setStatusFilter(status)
                      }
                      className={`rounded-xl border px-4 py-2.5 text-xs transition ${
                        active
                          ? "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]"
                          : "border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

            <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                  Transactions
                </p>

                <h2 className="mt-1 text-xl font-light">
                  Payment History
                </h2>
              </div>

              <p className="text-xs text-white/30">
                {filteredPayments.length}{" "}
                {filteredPayments.length === 1
                  ? "payment"
                  : "payments"}
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-white/40">
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
                  Loading payments...
                </div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard
                  size={34}
                  className="mx-auto text-white/15"
                />

                <p className="mt-4 text-sm text-white/45">
                  {payments.length === 0
                    ? "No payment records found."
                    : "No payments match your search or filter."}
                </p>

                {payments.length === 0 && (
                  <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/25">
                    Payments will appear here once bookings have linked payment records.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Payment
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Customer
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Booking
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Amount
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Method
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Status
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Date & Time
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                      {filteredPayments.map((payment) => {
                        const StatusIcon =
                          statusIcon(payment.status);

                        return (
                          <tr
                            key={payment.id}
                            className="transition hover:bg-white/[0.025]"
                          >
                            <td className="px-6 py-5">
                              <p className="text-sm text-[#D4AF37]">
                                {payment.paymentNo}
                              </p>

                              <p className="mt-1 text-[11px] text-white/25">
                                {payment.transactionId ||
                                  "No transaction reference"}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm">
                                {payment.customer.name}
                              </p>

                              <p className="mt-1 text-xs text-white/30">
                                {payment.customer.email}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm text-white/80">
                                {payment.booking.service}
                              </p>

                              <p className="mt-1 text-xs text-white/30">
                                {payment.booking.bookingNo}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm">
                                {formatMoney(payment.amount)}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                <CreditCard
                                  size={14}
                                  className="text-white/25"
                                />

                                <span className="text-sm text-white/60">
                                  {payment.method}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] ${statusClass(
                                  payment.status
                                )}`}
                              >
                                <StatusIcon size={12} />
                                {payment.status}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm text-white/60">
                                {formatDateTime(payment.paidAt)}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-white/10 lg:hidden">
                  {filteredPayments.map((payment) => {
                    const StatusIcon =
                      statusIcon(payment.status);

                    return (
                      <div
                        key={payment.id}
                        className="p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-[#D4AF37]">
                              {payment.paymentNo}
                            </p>

                            <p className="mt-1 text-sm">
                              {payment.customer.name}
                            </p>

                            <p className="mt-1 text-xs text-white/30">
                              {payment.booking.bookingNo}
                            </p>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${statusClass(
                              payment.status
                            )}`}
                          >
                            <StatusIcon size={11} />
                            {payment.status}
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                          <InfoItem
                            label="Service"
                            value={payment.booking.service}
                          />

                          <InfoItem
                            label="Amount"
                            value={formatMoney(payment.amount)}
                          />

                          <InfoItem
                            label="Method"
                            value={payment.method}
                          />

                          <InfoItem
                            label="Date"
                            value={formatDateTime(payment.paidAt)}
                          />
                        </div>

                        {payment.transactionId && (
                          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                              Transaction
                            </p>

                            <p className="mt-1 break-all text-xs text-white/45">
                              {payment.transactionId}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <CalendarDays
              size={17}
              className="mt-0.5 shrink-0 text-[#D4AF37]"
            />

            <p className="text-xs leading-5 text-white/30">
              Payment records shown here are linked to salon bookings. Gateway processing, refunds and webhook verification should be connected before accepting real online payments.
            </p>
          </div>

        </div>
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
  icon: typeof CreditCard;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-[#D4AF37]/20 hover:bg-white/[0.055]">
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

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
        {label}
      </p>

      <p className="mt-1 truncate text-sm text-white/65">
        {value}
      </p>
    </div>
  );
}
