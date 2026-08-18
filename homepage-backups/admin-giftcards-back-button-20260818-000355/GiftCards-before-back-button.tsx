"use client";

import BackToDashboard from "@/components/admin/BackToDashboard";

import {
  AlertCircle,
  CheckCircle2,
  Gift,
  History,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Redemption = {
  id: string;
  redemptionNo: string;
  amount: number;
  redeemedAt: string;
  notes: string | null;
};

type GiftCard = {
  id: string;
  giftCardNo: string;
  code: string;
  type: string;
  status: string;
  amount: number;
  remainingAmount: number;
  service: {
    id: string;
    name: string;
    category: string;
  } | null;
  purchaser: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  recipient: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  personalMessage: string | null;
  issuedAt: string | null;
  paidAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  redemptions: Redemption[];
};

const statuses = [
  "ALL",
  "PENDING",
  "ACTIVE",
  "PARTIALLY_REDEEMED",
  "REDEEMED",
  "EXPIRED",
  "CANCELLED",
];

function money(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function date(value: string | null) {
  if (!value) return "├â┬ó├óÔÇÜ┬¼├óÔé¼┬Ø";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

function statusClass(status: string) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "PARTIALLY_REDEEMED":
      return "border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37]";

    case "REDEEMED":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "PENDING":
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";

    case "EXPIRED":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    case "CANCELLED":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    default:
      return "border-white/10 bg-white/5 text-white/60";
  }
}

function displayName(
  first: string | null,
  last: string | null
) {
  return (
    [first, last]
      .filter(Boolean)
      .join(" ")
      .trim() || "├â┬ó├óÔÇÜ┬¼├óÔé¼┬Ø"
  );
}

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] =
    useState<GiftCard | null>(null);

  const [redeemAmount, setRedeemAmount] =
    useState("");
  const [redeemNotes, setRedeemNotes] =
    useState("");
  const [redeeming, setRedeeming] =
    useState(false);
  const [redeemError, setRedeemError] =
    useState("");
  const [redeemSuccess, setRedeemSuccess] =
    useState("");

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status !== "ALL") {
        params.set("status", status);
      }

      const response = await fetch(
        `/api/admin/gift-cards?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load Gift Cards."
        );
      }

      setCards(data.giftCards ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Gift Cards."
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        void loadCards();
      },
      250
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadCards]);

  const stats = useMemo(() => {
    return {
      total: cards.length,
      active: cards.filter(
        (card) =>
          card.status === "ACTIVE" ||
          card.status ===
            "PARTIALLY_REDEEMED"
      ).length,
      remaining: cards.reduce(
        (sum, card) =>
          sum + card.remainingAmount,
        0
      ),
    };
  }, [cards]);

  function openCard(card: GiftCard) {
    setSelected(card);
    setRedeemAmount("");
    setRedeemNotes("");
    setRedeemError("");
    setRedeemSuccess("");
  }

  function closeCard() {
    if (redeeming) return;

    setSelected(null);
    setRedeemError("");
    setRedeemSuccess("");
  }

  async function redeem() {
    if (!selected) return;

    setRedeemError("");
    setRedeemSuccess("");

    const amount = Number(
      redeemAmount
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setRedeemError(
        "Enter a valid redemption amount."
      );
      return;
    }

    if (
      amount >
      selected.remainingAmount + 0.0001
    ) {
      setRedeemError(
        `Maximum redeemable amount is ${money(
          selected.remainingAmount
        )}.`
      );
      return;
    }

    setRedeeming(true);

    try {
      const response = await fetch(
        "/api/admin/gift-cards",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            giftCardId: selected.id,
            amount,
            notes: redeemNotes,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to redeem Gift Card."
        );
      }

      setRedeemSuccess(
        `Redemption ${data.redemption.redemptionNo} created successfully.`
      );

      setRedeemAmount("");
      setRedeemNotes("");

      await loadCards();

      const refreshed =
        await fetch(
          `/api/admin/gift-cards?search=${encodeURIComponent(
            selected.giftCardNo
          )}`,
          {
            cache: "no-store",
          }
        );

      const refreshedData =
        await refreshed.json();

      const updated =
        refreshedData.giftCards?.find(
          (card: GiftCard) =>
            card.id === selected.id
        );

      if (updated) {
        setSelected(updated);
      }
    } catch (err) {
      setRedeemError(
        err instanceof Error
          ? err.message
          : "Unable to redeem Gift Card."
      );
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-6 text-white md:px-8">
<div className="mx-auto max-w-7xl">
        <BackToDashboard />
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10">
                <Gift className="h-5 w-5 text-[#D4AF37]" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">
                Admin
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Gift Cards
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Manage Gift Cards, balances and
              redemptions.
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Results
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Active Cards
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">
              {stats.active}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Visible Balance
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#D4AF37]">
              {money(stats.remaining)}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search card number, code or customer..."
                className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]/50"
            >
              {statuses.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "ALL"
                    ? "All statuses"
                    : item.replaceAll(
                        "_",
                        " "
                      )}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
            </div>
          ) : cards.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <Gift className="mb-4 h-10 w-10 text-white/20" />
              <p className="font-medium">
                No Gift Cards found
              </p>
              <p className="mt-1 text-sm text-white/40">
                Try changing your search or status
                filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr className="text-left text-xs uppercase tracking-wider text-white/40">
                    <th className="px-5 py-4">
                      Gift Card
                    </th>
                    <th className="px-5 py-4">
                      Recipient
                    </th>
                    <th className="px-5 py-4">
                      Balance
                    </th>
                    <th className="px-5 py-4">
                      Status
                    </th>
                    <th className="px-5 py-4">
                      Expires
                    </th>
                    <th className="px-5 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {cards.map((card) => (
                    <tr
                      key={card.id}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-5">
                        <div className="font-semibold">
                          {card.giftCardNo}
                        </div>

                        <div className="mt-1 font-mono text-xs text-[#D4AF37]">
                          {card.code}
                        </div>

                        <div className="mt-1 text-xs text-white/40">
                          {money(card.amount)}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="text-sm">
                          {displayName(
                            card.recipient.firstName,
                            card.recipient.lastName
                          )}
                        </div>

                        <div className="mt-1 text-xs text-white/40">
                          {card.recipient.email ||
                            "No email"}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="font-semibold text-[#D4AF37]">
                          {money(
                            card.remainingAmount
                          )}
                        </div>

                        <div className="mt-1 text-xs text-white/40">
                          {card.redemptions.length}{" "}
                          redemption
                          {card.redemptions.length ===
                          1
                            ? ""
                            : "s"}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                            card.status
                          )}`}
                        >
                          {card.status.replaceAll(
                            "_",
                            " "
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm text-white/60">
                        {date(card.expiresAt)}
                      </td>

                      <td className="px-5 py-5">
                        <button
                          type="button"
                          onClick={() =>
                            openCard(card)
                          }
                          className="rounded-full border border-[#D4AF37]/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] transition hover:bg-[#D4AF37]/10"
                        >
                          View / Redeem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101010] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#101010]/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                  Gift Card
                </p>
                <h2 className="mt-1 font-mono text-xl font-semibold">
                  {selected.giftCardNo}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeCard}
                className="rounded-full p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-white/40">
                    Original
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {money(selected.amount)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
                  <p className="text-xs text-white/40">
                    Remaining
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#D4AF37]">
                    {money(
                      selected.remainingAmount
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-white/40">
                    Status
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs ${statusClass(
                      selected.status
                    )}`}
                  >
                    {selected.status.replaceAll(
                      "_",
                      " "
                    )}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-wider text-white/30">
                    Recipient
                  </p>
                  <p className="mt-2 text-sm">
                    {displayName(
                      selected.recipient
                        .firstName,
                      selected.recipient
                        .lastName
                    )}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    {selected.recipient.email ||
                      "No email"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-wider text-white/30">
                    Purchaser
                  </p>
                  <p className="mt-2 text-sm">
                    {displayName(
                      selected.purchaser
                        .firstName,
                      selected.purchaser
                        .lastName
                    )}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    {selected.purchaser.email ||
                      "No email"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-white/30">
                    Code
                  </p>
                  <p className="mt-1 font-mono text-sm text-[#D4AF37]">
                    {selected.code}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/30">
                    Issued
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    {date(selected.issuedAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/30">
                    Expires
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    {date(selected.expiresAt)}
                  </p>
                </div>
              </div>

              {selected.personalMessage && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-wider text-white/30">
                    Personal Message
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">
                    {selected.personalMessage}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-[#D4AF37]/15 bg-[#D4AF37]/5 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Gift className="h-4 w-4 text-[#D4AF37]" />
                  <h3 className="font-semibold">
                    Redeem Gift Card
                  </h3>
                </div>

                {redeemError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {redeemError}
                  </div>
                )}

                {redeemSuccess && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {redeemSuccess}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs text-white/50">
                      Amount
                    </label>

                    <input
                      type="number"
                      min="0.01"
                      max={
                        selected.remainingAmount
                      }
                      step="0.01"
                      value={redeemAmount}
                      onChange={(event) =>
                        setRedeemAmount(
                          event.target.value
                        )
                      }
                      disabled={
                        redeeming ||
                        selected.remainingAmount <=
                          0 ||
                        selected.status ===
                          "EXPIRED" ||
                        selected.status ===
                          "CANCELLED" ||
                        selected.status ===
                          "REDEEMED"
                      }
                      placeholder={`Max ${money(
                        selected.remainingAmount
                      )}`}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF37]/50 disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs text-white/50">
                      Notes
                    </label>

                    <input
                      type="text"
                      value={redeemNotes}
                      onChange={(event) =>
                        setRedeemNotes(
                          event.target.value
                        )
                      }
                      disabled={redeeming}
                      placeholder="Optional"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF37]/50"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void redeem()
                  }
                  disabled={
                    redeeming ||
                    selected.remainingAmount <=
                      0 ||
                    selected.status ===
                      "EXPIRED" ||
                    selected.status ===
                      "CANCELLED" ||
                    selected.status ===
                      "REDEEMED"
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#E2C45B] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {redeeming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Redeem Amount"
                  )}
                </button>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <History className="h-4 w-4 text-white/50" />
                  <h3 className="font-semibold">
                    Redemption History
                  </h3>
                </div>

                {selected.redemptions.length ===
                0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center text-sm text-white/40">
                    No redemptions yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selected.redemptions.map(
                      (redemption) => (
                        <div
                          key={redemption.id}
                          className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-mono text-xs text-[#D4AF37]">
                              {
                                redemption.redemptionNo
                              }
                            </p>

                            <p className="mt-1 text-xs text-white/40">
                              {date(
                                redemption.redeemedAt
                              )}
                            </p>

                            {redemption.notes && (
                              <p className="mt-2 text-xs text-white/50">
                                {
                                  redemption.notes
                                }
                              </p>
                            )}
                          </div>

                          <p className="font-semibold text-white">
                            {money(
                              redemption.amount
                            )}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}