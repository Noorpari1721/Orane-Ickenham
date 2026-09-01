"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Payment = {
  id?: string | number;
  amount?: number;
  currency?: string;
  status?: string;
  customerName?: string;
  customerEmail?: string;
  createdAt?: string;
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/bookings", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load payment data.");
        }

        const data = await response.json();

        if (cancelled) return;

        const bookings = Array.isArray(data)
          ? data
          : Array.isArray(data?.bookings)
            ? data.bookings
            : [];

        const mapped: Payment[] = bookings.map((booking: any) => ({
          id: booking.id,
          amount:
            typeof booking.amount === "number"
              ? booking.amount
              : typeof booking.total === "number"
                ? booking.total
                : undefined,
          currency: booking.currency || "GBP",
          status: booking.paymentStatus || booking.status || "Pending",
          customerName:
            booking.customerName ||
            booking.customer?.name ||
            [
              booking.customer?.firstName,
              booking.customer?.lastName,
            ]
              .filter(Boolean)
              .join(" ") ||
            "Customer",
          customerEmail:
            booking.customerEmail ||
            booking.customer?.email ||
            "",
          createdAt:
            booking.createdAt ||
            booking.date ||
            undefined,
        }));

        setPayments(mapped);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load payment data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPayments();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatAmount = (amount?: number, currency = "GBP") => {
    if (typeof amount !== "number") return "—";

    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const total = payments.reduce(
    (sum, payment) =>
      sum + (typeof payment.amount === "number" ? payment.amount : 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-10 text-white md:px-10">
      
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
  <Link
    href="/admin"
    data-testid="payments-back-dashboard-button"
    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-[#D4AF37]/40 hover:bg-white/[0.06] hover:text-[#D4AF37]"
  >
    <span aria-hidden="true">←</span>
    Back to Dashboard
  </Link>
</div>
        <div className="mb-10">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Administration
          </p>

          <h1 className="text-3xl font-light tracking-tight md:text-4xl">
            Payments
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
            View payment activity associated with customer bookings.
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
              Transactions
            </p>
            <p className="mt-3 text-3xl font-light">
              {payments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
              Recorded Value
            </p>
            <p className="mt-3 text-3xl font-light text-[#D4AF37]">
              {formatAmount(total)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
              Status
            </p>
            <p className="mt-3 text-sm text-white/70">
              {loading
                ? "Loading..."
                : error
                  ? "Unable to load"
                  : "Connected"}
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">
              Payment Activity
            </h2>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-white/70">
              Loading payments...
            </div>
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-white/70">
                No payment records available yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.16em] text-white/70">
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">ID</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment, index) => (
                    <tr
                      key={payment.id ?? index}
                      className="border-b border-white/[0.06] last:border-0"
                    >
                      <td className="px-6 py-5">
                        <div className="text-sm text-white/85">
                          {payment.customerName}
                        </div>
                        {payment.customerEmail && (
                          <div className="mt-1 text-xs text-white/70">
                            {payment.customerEmail}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm text-[#D4AF37]">
                        {formatAmount(
                          payment.amount,
                          payment.currency
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-white/60">
                          {payment.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-white/50">
                        {formatDate(payment.createdAt)}
                      </td>

                      <td className="px-6 py-5 text-xs text-white/65">
                        {payment.id ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
