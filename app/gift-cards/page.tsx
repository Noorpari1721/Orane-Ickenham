"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gift,
  Heart,
  Mail,
  Sparkles,
  User,
} from "lucide-react";

type GiftType = "service" | "custom";
type RecipientType = "self" | "someone";

const services = [
  { name: "Hydra Cleanse", price: 50 },
  { name: "Sakura Head Spa", price: 80 },
  { name: "Ultimate Indulgence", price: 120 },
  { name: "Deep Cleansing Facial", price: 45 },
  { name: "ELEMIS Expert Facial", price: 70 },
  { name: "Express Facial", price: 30 },
  { name: "Herbal Facial", price: 60 },
  { name: "Acrylic Extension Full Set With Gel", price: 45 },
  { name: "Acrylic Extension Full Set Colour", price: 40 },
  { name: "Acrylic Infill With Gel", price: 40 },
  { name: "BIAB Infill With Gel", price: 39 },
];

const customAmounts = [25, 50, 75, 100, 150, 200, 250, 500];

export default function GiftCardsPage() {
  const [giftType, setGiftType] =
    useState<GiftType>("custom");

  const [recipientType, setRecipientType] =
    useState<RecipientType>("someone");

  const [selectedService, setSelectedService] =
    useState(services[0].name);

  const [customAmount, setCustomAmount] =
    useState("100");

  const [purchaserEmail, setPurchaserEmail] =
    useState("");

  const [recipientFirstName, setRecipientFirstName] =
    useState("");

  const [recipientLastName, setRecipientLastName] =
    useState("");

  const [recipientEmail, setRecipientEmail] =
    useState("");

  const [personalMessage, setPersonalMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const selectedServiceData = useMemo(
    () =>
      services.find(
        (service) =>
          service.name === selectedService
      ),
    [selectedService]
  );

  const amount =
    giftType === "service"
      ? selectedServiceData?.price ?? 0
      : Number(customAmount) || 0;

  async function handleCheckout() {
    if (isLoading) {
      return;
    }

    setError("");

    const email =
      recipientType === "someone"
        ? recipientEmail.trim()
        : purchaserEmail.trim();

    if (!email) {
      setError(
        recipientType === "someone"
          ? "Please enter the recipient email address."
          : "Please enter your email address."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (
      giftType === "custom" &&
      (amount < 25 || amount > 500)
    ) {
      setError(
        "Custom Gift Cards must be between £25 and £500."
      );
      return;
    }

    if (
      giftType === "service" &&
      !selectedServiceData
    ) {
      setError(
        "Please select a valid service."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/gift-cards/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            giftType,

            serviceName:
              giftType === "service"
                ? selectedService
                : undefined,

            amount:
              giftType === "custom"
                ? amount
                : undefined,

            purchaserEmail:
              recipientType === "self"
                ? purchaserEmail.trim()
                : undefined,

            recipientFirstName:
              recipientType === "someone"
                ? recipientFirstName.trim()
                : undefined,

            recipientLastName:
              recipientType === "someone"
                ? recipientLastName.trim()
                : undefined,

            recipientEmail:
              recipientType === "someone"
                ? recipientEmail.trim()
                : undefined,

            personalMessage:
              recipientType === "someone"
                ? personalMessage.trim()
                : undefined,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to start secure checkout."
        );
      }

      if (!data?.url) {
        throw new Error(
          "Stripe Checkout URL was not returned."
        );
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      console.error(
        "Gift Card checkout error:",
        checkoutError
      );

      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start secure checkout. Please try again."
      );

      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_15%_20%,rgba(196,154,69,.14),transparent_30%),radial-gradient(circle_at_85%_75%,rgba(196,154,69,.08),transparent_30%),linear-gradient(135deg,#090909,#030303)]"
      />

      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/60 transition hover:text-[#DDB45C]"
          >
            <ArrowLeft size={16} />
            Back to ORANE
          </Link>

          <div className="text-right">
            <p className="text-sm font-semibold tracking-[0.35em] text-[#DDB45C]">
              ORANE
            </p>
            <p className="mt-1 text-[8px] uppercase tracking-[0.35em] text-white/35">
              ICKENHAM
            </p>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-[#D4AF5A]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D4AF5A]">
              THE ORANE GIFT COLLECTION
            </span>
            <span className="h-px w-10 bg-[#D4AF5A]" />
          </div>

          <h1 className="font-serif text-5xl leading-none sm:text-6xl lg:text-7xl">
            Give the gift
            <br />
            <span className="text-[#D4AF5A]">
              of luxury.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
            Choose a signature ORANE experience or
            create a gift of your own. Perfect for
            yourself or someone special.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_80px_rgba(0,0,0,.35)] backdrop-blur-2xl sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
              01 — Choose your gift
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                {
                  type: "service" as const,
                  icon: Sparkles,
                  title: "Service Gift Voucher",
                  text: "Gift a specific ORANE treatment.",
                },
                {
                  type: "custom" as const,
                  icon: Gift,
                  title: "Custom Gift Card",
                  text: "Choose your own amount with no service restriction.",
                },
              ].map((option) => {
                const Icon = option.icon;
                const active =
                  giftType === option.type;

                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() =>
                      setGiftType(option.type)
                    }
                    className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
                      active
                        ? "border-[#D4AF5A]/70 bg-[#C49A45]/10"
                        : "border-white/10 bg-white/[0.025] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF5A]/30 bg-[#C49A45]/10">
                        <Icon
                          size={18}
                          className="text-[#DDB45C]"
                        />
                      </div>

                      {active && (
                        <Check
                          size={18}
                          className="text-[#DDB45C]"
                        />
                      )}
                    </div>

                    <h2 className="mt-5 font-serif text-2xl">
                      {option.title}
                    </h2>

                    <p className="mt-2 text-xs leading-6 text-white/40">
                      {option.text}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 border-t border-white/10 pt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                02 —{" "}
                {giftType === "service"
                  ? "Select treatment"
                  : "Choose amount"}
              </p>

              {giftType === "service" ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {services.map((service) => (
                    <button
                      key={service.name}
                      type="button"
                      onClick={() =>
                        setSelectedService(
                          service.name
                        )
                      }
                      className={`flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
                        selectedService ===
                        service.name
                          ? "border-[#D4AF5A]/70 bg-[#C49A45]/10"
                          : "border-white/10 bg-white/[0.025] hover:border-white/20"
                      }`}
                    >
                      <span className="text-sm text-white/80">
                        {service.name}
                      </span>

                      <span className="shrink-0 text-sm font-semibold text-[#DDB45C]">
                        £{service.price}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {customAmounts.map(
                      (value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setCustomAmount(
                              String(value)
                            )
                          }
                          className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition-all ${
                            Number(
                              customAmount
                            ) === value
                              ? "border-[#D4AF5A]/70 bg-[#C49A45]/10 text-[#DDB45C]"
                              : "border-white/10 bg-white/[0.025] text-white/70 hover:border-white/20"
                          }`}
                        >
                          £{value}
                        </button>
                      )
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="mb-3 block text-[10px] uppercase tracking-[0.25em] text-white/35">
                      Or enter your own amount
                    </label>

                    <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.025] px-5">
                      <span className="text-xl text-[#DDB45C]">
                        £
                      </span>

                      <input
                        type="number"
                        min="25"
                        max="500"
                        step="1"
                        value={customAmount}
                        onChange={(event) =>
                          setCustomAmount(
                            event.target.value
                          )
                        }
                        className="w-full bg-transparent px-3 py-4 text-white outline-none"
                      />
                    </div>

                    <p className="mt-2 text-[10px] text-white/30">
                      Custom Gift Cards: £25–£500
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-10 border-t border-white/10 pt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                03 — Who is it for?
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    type: "self" as const,
                    icon: User,
                    title: "For myself",
                    text: "Keep the gift for your own ORANE visit.",
                  },
                  {
                    type: "someone" as const,
                    icon: Heart,
                    title: "Gift it to someone",
                    text: "Send the gift to someone special.",
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  const active =
                    recipientType ===
                    option.type;

                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() =>
                        setRecipientType(
                          option.type
                        )
                      }
                      className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                        active
                          ? "border-[#D4AF5A]/70 bg-[#C49A45]/10"
                          : "border-white/10 bg-white/[0.025]"
                      }`}
                    >
                      <Icon
                        size={19}
                        className="text-[#DDB45C]"
                      />

                      <div>
                        <p className="text-sm font-medium">
                          {option.title}
                        </p>

                        <p className="mt-1 text-xs text-white/35">
                          {option.text}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {recipientType === "self" ? (
                <div className="mt-5">
                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF5A]"
                    />

                    <input
                      type="email"
                      value={purchaserEmail}
                      onChange={(event) =>
                        setPurchaserEmail(
                          event.target.value
                        )
                      }
                      placeholder="Your email address"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.025] py-4 pl-12 pr-5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF5A]/50"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <input
                    value={recipientFirstName}
                    onChange={(event) =>
                      setRecipientFirstName(
                        event.target.value
                      )
                    }
                    placeholder="Recipient first name"
                    className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF5A]/50"
                  />

                  <input
                    value={recipientLastName}
                    onChange={(event) =>
                      setRecipientLastName(
                        event.target.value
                      )
                    }
                    placeholder="Recipient last name"
                    className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF5A]/50"
                  />

                  <div className="sm:col-span-2">
                    <div className="relative">
                      <Mail
                        size={17}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF5A]"
                      />

                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(event) =>
                          setRecipientEmail(
                            event.target.value
                          )
                        }
                        placeholder="Recipient email address"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.025] py-4 pl-12 pr-5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF5A]/50"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <textarea
                      value={personalMessage}
                      onChange={(event) =>
                        setPersonalMessage(
                          event.target.value
                        )
                      }
                      placeholder="Add a personal message (optional)"
                      rows={4}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF5A]/50"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 rounded-2xl border border-[#D4AF5A]/15 bg-[#C49A45]/[0.04] p-5">
              <div className="flex gap-4">
                <Sparkles
                  className="mt-0.5 shrink-0 text-[#DDB45C]"
                  size={18}
                />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#DDB45C]">
                    ORANE Gift Card
                  </p>

                  <p className="mt-2 text-xs leading-6 text-white/40">
                    Valid exclusively at ORANE
                    Ickenham. Gift Cards are valid
                    for 2 years from the date of
                    issue and can be redeemed
                    against eligible ORANE services.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="overflow-hidden rounded-[28px] border border-[#D4AF5A]/30 bg-[linear-gradient(145deg,#26241f,#0d0d0c_50%,#050505)] p-7 shadow-[0_30px_80px_rgba(0,0,0,.55),0_0_40px_rgba(196,154,69,.08)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-[#DDB45C]">
                    ORANE ICKENHAM
                  </p>

                  <p className="mt-2 font-serif text-2xl">
                    Gift Card
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF5A]/30 bg-[#C49A45]/10">
                  <Gift
                    size={19}
                    className="text-[#DDB45C]"
                  />
                </div>
              </div>

              <div className="my-7 h-px bg-white/10" />

              <div className="space-y-5">
                <div className="flex items-start justify-between gap-5">
                  <span className="text-xs text-white/40">
                    Gift type
                  </span>

                  <span className="text-right text-sm text-white/80">
                    {giftType === "service"
                      ? "Service Gift Voucher"
                      : "Custom Gift Card"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-5">
                  <span className="text-xs text-white/40">
                    Experience
                  </span>

                  <span className="max-w-[190px] text-right text-sm text-white/80">
                    {giftType === "service"
                      ? selectedService
                      : "Flexible ORANE value"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-5">
                  <span className="text-xs text-white/40">
                    Recipient
                  </span>

                  <span className="text-right text-sm text-white/80">
                    {recipientType === "self"
                      ? "Myself"
                      : recipientFirstName ||
                        "Someone special"}
                  </span>
                </div>
              </div>

              <div className="my-7 h-px bg-white/10" />

              <div className="flex items-end justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-white/35">
                  Gift value
                </span>

                <span className="font-serif text-4xl text-[#DDB45C]">
                  £{amount.toFixed(2)}
                </span>
              </div>

              <div className="mt-6 space-y-3 text-[11px] leading-5 text-white/35">
                {[
                  "Valid exclusively at ORANE Ickenham",
                  "2-year validity from date of issue",
                  "Secure digital gift card",
                ].map((text) => (
                  <div
                    key={text}
                    className="flex gap-3"
                  >
                    <Check
                      size={14}
                      className="mt-0.5 shrink-0 text-[#DDB45C]"
                    />

                    {text}
                  </div>
                ))}
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs leading-5 text-red-200"
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={
                  amount <= 0 || isLoading
                }
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-full border border-[#E0B85F]/70 bg-gradient-to-b from-[#E0B85F] to-[#A87825] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#080808] shadow-[0_12px_35px_rgba(196,154,69,.25)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(196,154,69,.4)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading
                  ? "Preparing Secure Checkout..."
                  : "Continue to Secure Checkout"}

                {!isLoading && (
                  <ArrowRight size={16} />
                )}
              </button>

              <p className="mt-4 text-center text-[9px] uppercase tracking-[0.18em] text-white/25">
                Secure checkout powered by Stripe
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}