"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Gift,
  Heart,
  Mail,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";

type GiftType = "service" | "custom";
type RecipientType = "self" | "someone";

type Service = {
  id: string;
  name: string;
  category: string;
  price: number;
  active?: boolean;
};

const customAmounts = [25, 50, 75, 100, 150, 200, 250, 500];

const categoryLabels: Record<string, string> = {
  all: "All",
};

function cleanServiceText(value: string) {
  return String(value || "")
    .replace(/Â£/g, "£")
    .replace(/Â/g, "")
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€�/g, '"')
    .replace(/â€“/g, "–")
    .replace(/â€”/g, "—")
    .replace(/â€¦/g, "…")
    .trim();
}

export default function GiftCardsPage() {
  const [giftType, setGiftType] =
    useState<GiftType>("service");

  const [recipientType, setRecipientType] =
    useState<RecipientType>("someone");

  const [services, setServices] =
    useState<Service[]>([]);

  const [selectedServiceIds, setSelectedServiceIds] =
    useState<string[]>([]);

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

  const [searchQuery, setSearchQuery] =
    useState("");

  const [activeCategory, setActiveCategory] =
    useState("all");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        const response = await fetch(
          "/api/gift-cards/services",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load treatments."
          );
        }

        const activeServices: Service[] =
          (data.services || [])
            .filter(
              (service: { active?: boolean }) =>
                service.active !== false
            )
            .map(
              (service: Service) => ({
                ...service,
                id: String(service.id),
                name: cleanServiceText(service.name),
                category: cleanServiceText(
                  service.category
                ),
                price: Number(service.price),
              })
            )
            .filter(
              (service: Service) =>
                Number.isFinite(service.price)
            )
            .sort(
              (a: Service, b: Service) =>
                String(a.category || "").localeCompare(
                  String(b.category || "")
                ) ||
                String(a.name || "").localeCompare(
                  String(b.name || "")
                )
            );

        if (cancelled) return;

        setServices(activeServices);

        setSelectedServiceIds(
          (current) =>
            current.filter((id) =>
              activeServices.some(
                (service) =>
                  service.id === id
              )
            )
        );
      } catch (loadError) {
        console.error(
          "Gift voucher treatments error:",
          loadError
        );

        if (!cancelled) {
          setError(
            "Unable to load treatments. Please refresh and try again."
          );
        }
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        services
          .map((service) =>
            String(service.category || "").trim()
          )
          .filter(Boolean)
      )
    );

    return ["all", ...unique];
  }, [services]);

  const filteredServices = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return services.filter((service) => {
      const categoryMatch =
        activeCategory === "all" ||
        service.category === activeCategory;

      const queryMatch =
        !query ||
        service.name
          .toLowerCase()
          .includes(query) ||
        service.category
          .toLowerCase()
          .includes(query);

      return categoryMatch && queryMatch;
    });
  }, [
    services,
    searchQuery,
    activeCategory,
  ]);

  const selectedServices = useMemo(
    () =>
      services.filter((service) =>
        selectedServiceIds.includes(
          service.id
        )
      ),
    [
      services,
      selectedServiceIds,
    ]
  );

  const serviceTotal = useMemo(
    () =>
      selectedServices.reduce(
        (total, service) =>
          total + Number(service.price),
        0
      ),
    [selectedServices]
  );

  const amount =
    giftType === "service"
      ? serviceTotal
      : Number(customAmount) || 0;

  const selectedServiceNames =
    selectedServices
      .map((service) =>
        cleanServiceText(service.name)
      )
      .join(", ");

  function toggleService(
    serviceId: string
  ) {
    setSelectedServiceIds(
      (current) =>
        current.includes(serviceId)
          ? current.filter(
              (id) =>
                id !== serviceId
            )
          : [
              ...current,
              serviceId,
            ]
    );
  }

  function clearSelection() {
    setSelectedServiceIds([]);
  }

  const categoryScroller =
    useRef<HTMLDivElement>(null);

  function scrollCategories(
    direction: "left" | "right"
  ) {
    const container =
      categoryScroller.current;

    if (!container) {
      return;
    }

    container.scrollBy({
      left:
        direction === "left"
          ? -260
          : 260,
      behavior: "smooth",
    });
  }
  async function handleCheckout() {
    if (isLoading) return;

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
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
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
      selectedServices.length === 0
    ) {
      setError(
        "Please select at least one treatment."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response =
        await fetch(
          "/api/gift-cards/checkout",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              giftType,

              serviceNames:
                giftType === "service"
                  ? selectedServices.map(
                      (service) =>
                        cleanServiceText(
                          service.name
                        )
                    )
                  : undefined,

              serviceIds:
                giftType === "service"
                  ? selectedServices.map(
                      (service) =>
                        service.id
                    )
                  : undefined,

              serviceName:
                giftType === "service"
                  ? selectedServiceNames
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

      window.location.href =
        data.url;
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

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-[#D4AF5A]/60 focus:bg-white/[0.05]";

  const selectedCount =
    selectedServices.length;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[-15%] top-[5%] h-[520px] w-[520px] rounded-full bg-[#C49A45]/10 blur-[130px]" />
        <div className="absolute bottom-[5%] right-[-15%] h-[500px] w-[500px] rounded-full bg-[#C49A45]/8 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#090909,#030303_55%,#070707)]" />
      </div>

      <header className="relative z-20 border-b border-white/[0.08] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50 transition hover:text-[#DDB45C]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition group-hover:border-[#D4AF5A]/50">
              <ArrowLeft size={15} />
            </span>
            <span className="hidden sm:inline">
              Back to ORANE
            </span>
          </Link>

          <div className="text-center">
            <p className="text-sm font-semibold tracking-[0.42em] text-[#DDB45C]">
              ORANE
            </p>
            <p className="mt-1 text-[7px] uppercase tracking-[0.5em] text-white/30">
              ICKENHAM
            </p>
          </div>

          <div className="w-9 sm:w-[110px]" />
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-[#D4AF5A]/60 sm:w-14" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#D4AF5A]">
              THE ORANE GIFT COLLECTION
            </span>

            <span className="h-px w-8 bg-[#D4AF5A]/60 sm:w-14" />
          </div>

          <h1 className="font-serif text-5xl leading-[0.95] sm:text-7xl">
            Give the gift
            <br />
            <span className="text-[#D4AF5A]">
              of luxury.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
            Choose one or more signature ORANE
            experiences, or create a beautiful
            gift card with a value of your choice.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[9px] uppercase tracking-[0.22em] text-white/35">
            <span className="rounded-full border border-white/10 bg-white/[0.025] px-4 py-2">
              Instant digital delivery
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.025] px-4 py-2">
              Secure checkout
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.025] px-4 py-2">
              Valid for 2 years
            </span>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-7xl gap-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="overflow-hidden rounded-[30px] border border-white/[0.09] bg-white/[0.025] shadow-2xl shadow-black/30">
            <div className="border-b border-white/[0.08] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF5A] text-[10px] font-bold text-black">
                      01
                    </span>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
                      Choose your gift
                    </p>
                  </div>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/35">
                    Select a treatment voucher or
                    create your own flexible-value
                    gift card.
                  </p>
                </div>

                <Gift
                  size={22}
                  strokeWidth={1.5}
                  className="hidden text-[#DDB45C] sm:block"
                />
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    type: "service" as const,
                    icon: Sparkles,
                    title: "Service Gift Voucher",
                    text: "Gift one or multiple ORANE treatments.",
                  },
                  {
                    type: "custom" as const,
                    icon: Gift,
                    title: "Custom Gift Card",
                    text: "Choose any value from £25 to £500.",
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  const active =
                    giftType === option.type;

                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => {
                        setGiftType(option.type);
                        setError("");
                      }}
                      className={`group relative overflow-hidden rounded-[22px] border p-5 text-left transition-all duration-300 ${
                        active
                          ? "border-[#D4AF5A]/70 bg-[#C49A45]/10 shadow-lg shadow-[#C49A45]/5"
                          : "border-white/10 bg-white/[0.02] hover:border-[#D4AF5A]/35 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                            active
                              ? "border-[#D4AF5A]/40 bg-[#D4AF5A]/10"
                              : "border-white/10 bg-white/[0.025]"
                          }`}
                        >
                          <Icon
                            size={18}
                            strokeWidth={1.5}
                            className="text-[#DDB45C]"
                          />
                        </span>

                        {active && (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DDB45C] text-black">
                            <Check size={14} />
                          </span>
                        )}
                      </div>

                      <h2 className="mt-5 font-serif text-[22px]">
                        {option.title}
                      </h2>

                      <p className="mt-2 text-xs leading-5 text-white/35">
                        {option.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-b border-white/[0.08] p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[#DDB45C]">
                      02
                    </span>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
                      {giftType === "service"
                        ? "Select treatments"
                        : "Choose amount"}
                    </p>
                  </div>

                  {giftType === "service" && (
                    <p className="mt-4 text-xs text-white/35">
                      {selectedCount === 0
                        ? "Choose one or more experiences"
                        : `${selectedCount} treatment${selectedCount === 1 ? "" : "s"} selected`}
                    </p>
                  )}
                </div>

                {giftType === "service" &&
                  selectedCount > 0 && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35 transition hover:text-[#DDB45C]"
                    >
                      <X size={13} />
                      Clear
                    </button>
                  )}
              </div>

              {giftType === "service" ? (
                <div className="mt-7">
                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                    />

                    <input
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(
                          event.target.value
                        )
                      }
                      placeholder="Search treatments..."
                      className={`${inputClass} pl-11`}
                    />

                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearchQuery("")
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                                  <div className="mt-4 flex items-center gap-4">

                  <button
                    type="button"
                    onClick={() =>
                      scrollCategories("left")
                    }
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.025]
                      text-white/55
                      transition-all
                      duration-200
                      hover:border-[#D4AF5A]/50
                      hover:bg-[#D4AF5A]/10
                      hover:text-[#DDB45C]
                    "
                    aria-label="Scroll treatment categories left"
                  >
                    <ChevronLeft size={19} />
                  </button>

                  <div
                    ref={categoryScroller}
                    className="
                      flex
                      min-w-0
                      flex-1
                      items-center
                      gap-2
                      overflow-x-auto
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.018]
                      px-2
                      py-2
                      scroll-smooth
                      [-ms-overflow-style:none]
                      [scrollbar-width:none]
                      [&::-webkit-scrollbar]:hidden
                    "
                  >
                    {categories.map(
                      (category) => {
                        const active =
                          activeCategory ===
                          category;

                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() =>
                              setActiveCategory(
                                category
                              )
                            }
                            className={`shrink-0 rounded-full border px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] transition ${
                              active
                                ? "border-[#D4AF5A]/60 bg-[#D4AF5A] text-black"
                                : "border-white/10 bg-white/[0.025] text-white/40 hover:border-[#D4AF5A]/35 hover:text-white"
                            }`}
                          >
                            {category === "all"
                              ? "All treatments"
                              : category}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      scrollCategories("right")
                    }
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.025]
                      text-white/55
                      transition-all
                      duration-200
                      hover:border-[#D4AF5A]/50
                      hover:bg-[#D4AF5A]/10
                      hover:text-[#DDB45C]
                    "
                    aria-label="Scroll treatment categories right"
                  >
                    <ChevronRight size={19} />
                  </button>

                </div>

                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                      {filteredServices.length}{" "}
                      available
                    </p>

                    {selectedCount > 0 && (
                      <p className="text-[9px] uppercase tracking-[0.18em] text-[#DDB45C]">
                        £{serviceTotal.toFixed(2)}{" "}
                        selected
                      </p>
                    )}
                  </div>

                  {filteredServices.length === 0 ? (
                    <div className="mt-4 rounded-[22px] border border-dashed border-white/10 bg-white/[0.015] px-6 py-12 text-center">
                      <Search
                        size={22}
                        className="mx-auto text-white/20"
                      />
                      <p className="mt-4 font-serif text-xl">
                        No treatments found
                      </p>
                      <p className="mt-2 text-xs text-white/30">
                        Try another search or category.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                      {filteredServices.map(
                        (service) => {
                          const active =
                            selectedServiceIds.includes(
                              service.id
                            );

                          return (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => {
                                toggleService(
                                  service.id
                                );
                                setError("");
                              }}
                              className={`group flex min-h-[82px] items-center justify-between gap-4 rounded-[18px] border px-4 py-3.5 text-left transition-all duration-200 ${
                                active
                                  ? "border-[#D4AF5A]/65 bg-[#C49A45]/10 shadow-lg shadow-[#C49A45]/5"
                                  : "border-white/[0.09] bg-white/[0.018] hover:border-[#D4AF5A]/30 hover:bg-white/[0.035]"
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                                    active
                                      ? "border-[#DDB45C] bg-[#DDB45C] text-black"
                                      : "border-white/20 text-transparent group-hover:border-[#D4AF5A]/50"
                                  }`}
                                >
                                  <Check size={13} />
                                </span>

                                <div className="min-w-0">
                                  <span className="block truncate text-sm font-medium text-white/90">
                                    {cleanServiceText(
                                      service.name
                                    )}
                                  </span>

                                  <span className="mt-1 block truncate text-[8px] font-semibold uppercase tracking-[0.16em] text-white/25">
                                    {cleanServiceText(
                                      service.category
                                    )}
                                  </span>
                                </div>
                              </div>

                              <span className="shrink-0 font-serif text-base text-[#DDB45C]">
                                £
                                {Number(
                                  service.price
                                ).toFixed(2)}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-7">
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {customAmounts.map(
                      (value) => {
                        const active =
                          Number(customAmount) ===
                          value;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setCustomAmount(
                                String(value)
                              )
                            }
                            className={`rounded-[18px] border px-4 py-5 font-serif text-lg transition ${
                              active
                                ? "border-[#D4AF5A]/65 bg-[#C49A45]/10 text-[#DDB45C]"
                                : "border-white/10 bg-white/[0.02] text-white/70 hover:border-[#D4AF5A]/35"
                            }`}
                          >
                            £{value}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <div className="relative mt-4">
                    <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-serif text-xl text-[#DDB45C]">
                      £
                    </span>

                    <input
                      type="number"
                      min="25"
                      max="500"
                      value={customAmount}
                      onChange={(event) =>
                        setCustomAmount(
                          event.target.value
                        )
                      }
                      className={`${inputClass} pl-10 text-lg`}
                      placeholder="Enter custom amount"
                    />
                  </div>

                  <p className="mt-3 text-[10px] text-white/25">
                    Gift cards can be created from £25
                    up to £500.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[#DDB45C]">
                  03
                </span>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
                    Who is it for?
                  </p>
                  <p className="mt-1 text-xs text-white/25">
                    Tell us where to send your gift.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setRecipientType("self")
                  }
                  className={`rounded-[20px] border p-5 text-left transition ${
                    recipientType === "self"
                      ? "border-[#D4AF5A]/65 bg-[#C49A45]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-[#D4AF5A]/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <User
                      size={19}
                      className="text-[#DDB45C]"
                    />

                    {recipientType === "self" && (
                      <Check
                        size={16}
                        className="text-[#DDB45C]"
                      />
                    )}
                  </div>

                  <p className="mt-5 text-sm font-medium">
                    For myself
                  </p>

                  <p className="mt-1 text-[10px] text-white/30">
                    Send the gift directly to me.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setRecipientType("someone")
                  }
                  className={`rounded-[20px] border p-5 text-left transition ${
                    recipientType === "someone"
                      ? "border-[#D4AF5A]/65 bg-[#C49A45]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-[#D4AF5A]/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Heart
                      size={19}
                      className="text-[#DDB45C]"
                    />

                    {recipientType ===
                      "someone" && (
                      <Check
                        size={16}
                        className="text-[#DDB45C]"
                      />
                    )}
                  </div>

                  <p className="mt-5 text-sm font-medium">
                    Gift it to someone
                  </p>

                  <p className="mt-1 text-[10px] text-white/30">
                    Add their details and a message.
                  </p>
                </button>
              </div>

              {recipientType === "self" ? (
                <div className="mt-4">
                  <input
                    type="email"
                    value={purchaserEmail}
                    onChange={(event) =>
                      setPurchaserEmail(
                        event.target.value
                      )
                    }
                    placeholder="Your email address"
                    className={inputClass}
                  />
                </div>
              ) : (
                <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                  <input
                    value={recipientFirstName}
                    onChange={(event) =>
                      setRecipientFirstName(
                        event.target.value
                      )
                    }
                    placeholder="Recipient first name"
                    className={inputClass}
                  />

                  <input
                    value={recipientLastName}
                    onChange={(event) =>
                      setRecipientLastName(
                        event.target.value
                      )
                    }
                    placeholder="Recipient last name"
                    className={inputClass}
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
                    className={`${inputClass} sm:col-span-2`}
                  />

                  <textarea
                    value={personalMessage}
                    onChange={(event) =>
                      setPersonalMessage(
                        event.target.value
                      )
                    }
                    placeholder="Personal message (optional)"
                    rows={4}
                    className={`${inputClass} resize-none sm:col-span-2`}
                  />
                </div>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-[30px] border border-[#D4AF5A]/25 bg-[#0b0b0b]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="relative overflow-hidden border-b border-white/[0.08] p-7 sm:p-8">
                <div className="pointer-events-none absolute right-[-40px] top-[-50px] h-40 w-40 rounded-full bg-[#D4AF5A]/10 blur-[55px]" />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#DDB45C]">
                      ORANE ICKENHAM
                    </p>

                    <p className="mt-3 font-serif text-3xl">
                      Gift Card
                    </p>

                    <p className="mt-2 text-[10px] leading-5 text-white/30">
                      A little luxury, beautifully
                      gifted.
                    </p>
                  </div>

                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF5A]/25 bg-[#D4AF5A]/5">
                    <Gift
                      size={19}
                      strokeWidth={1.4}
                      className="text-[#DDB45C]"
                    />
                  </span>
                </div>
              </div>

              <div className="p-7 sm:p-8">
                <div className="space-y-5">
                  <div className="flex justify-between gap-5">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                      Gift type
                    </span>

                    <span className="text-right text-xs text-white/75">
                      {giftType === "service"
                        ? "Service Voucher"
                        : "Custom Gift Card"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-5">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                      Experience
                    </span>

                    <span className="max-w-[205px] text-right text-xs leading-5 text-white/75">
                      {giftType === "service"
                        ? selectedServices.length >
                          0
                          ? selectedServices
                              .map((service) =>
                                cleanServiceText(
                                  service.name
                                )
                              )
                              .join(", ")
                          : "No treatments selected"
                        : "Flexible value"}
                    </span>
                  </div>

                  {giftType === "service" &&
                    selectedCount > 0 && (
                      <div className="flex justify-between gap-5">
                        <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                          Treatments
                        </span>

                        <span className="text-xs text-[#DDB45C]">
                          {selectedCount}
                        </span>
                      </div>
                    )}
                </div>

                <div className="my-7 h-px bg-white/[0.08]" />

                <div className="rounded-[20px] border border-[#D4AF5A]/15 bg-[#D4AF5A]/[0.035] p-5">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/35">
                      Gift value
                    </span>

                    <span className="font-serif text-4xl text-[#DDB45C]">
                      £{amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-xs leading-5 text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={
                    amount <= 0 ||
                    isLoading ||
                    (giftType === "service" &&
                      selectedCount === 0)
                  }
                  className="group mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#DDB45C] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.17em] text-black shadow-lg shadow-[#DDB45C]/10 transition-all hover:bg-[#e5c36e] hover:shadow-xl hover:shadow-[#DDB45C]/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>
                    {isLoading
                      ? "Preparing checkout..."
                      : "Continue to secure checkout"}
                  </span>

                  {!isLoading && (
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </button>

                <div className="mt-5 grid gap-3">
                  <div className="flex items-center gap-3 text-[10px] text-white/30">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04]">
                      <Mail size={13} />
                    </span>
                    Secure digital delivery
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-white/30">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04]">
                      <Check
                        size={13}
                        className="text-[#DDB45C]"
                      />
                    </span>
                    Valid for 2 years from issue date
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}