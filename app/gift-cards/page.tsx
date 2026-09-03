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
    .replace(/\u00C2\u00A3/g, "\u00A3")
    .replace(/\u00C3\u201A\u00C2\u00A3/g, "\u00A3")
    .replace(/\u00C3\u201A\u00A3/g, "\u00A3")
    .replace(/\u00E2\u201A\u00AC/g, "\u00A3")
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

  const [sortOrder, setSortOrder] =
    useState<"default" | "low-high" | "high-low">("default");

  const categoryScroller =
    useRef<HTMLDivElement>(null);

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

        // Remove duplicate Gift Card treatments.
        // Some Massage records contain the same service twice with
        // different dash/encoding characters, so names are canonicalised
        // before comparing them.
        const uniqueGiftCardServices = activeServices.filter(
          (service, index, allServices) => {
            if (String(service.category || "").toLowerCase() !== "massage") {
              return true;
            }

            const canonicalName = String(service.name || "")
              .normalize("NFKC")
              .replace(/[^a-zA-Z0-9]+/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .toLowerCase();

            return (
              allServices.findIndex((candidate) => {
                if (
                  String(candidate.category || "").toLowerCase() !==
                  "massage"
                ) {
                  return false;
                }

                const candidateName = String(candidate.name || "")
                  .normalize("NFKC")
                  .replace(/[^a-zA-Z0-9]+/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .toLowerCase();

                return candidateName === canonicalName;
              }) === index
            );
          }
        );

        setServices(uniqueGiftCardServices);

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
    const preferredOrder = [
      "Japanese Head Spa",
      "Facials",
      "Massage",
      "Nails",
      "Manicure",
      "Pedicure",
      "Lashes",
      "Tint",
      "Waxing & Threading",
      "Packages",
    ];

    const unique = Array.from(
      new Set(
        services
          .map((service) =>
            String(service.category || "").trim()
          )
          .filter(Boolean)
      )
    );

    const ordered = preferredOrder.filter((category) =>
      unique.some(
        (existingCategory) =>
          existingCategory.toLowerCase() ===
          category.toLowerCase()
      )
    );

    const remaining = unique.filter(
      (category) =>
        !preferredOrder.some(
          (preferredCategory) =>
            preferredCategory.toLowerCase() ===
            category.toLowerCase()
        )
    );

    return ["all", ...ordered, ...remaining];
  }, [services]);

  const filteredServices = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    const filtered = services.filter((service) => {
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

    if (sortOrder === "low-high") {
      return [...filtered].sort(
        (a, b) =>
          Number(a.price) - Number(b.price)
      );
    }

    if (sortOrder === "high-low") {
      return [...filtered].sort(
        (a, b) =>
          Number(b.price) - Number(a.price)
      );
    }

    return filtered;
  }, [
    services,
    searchQuery,
    activeCategory,
    sortOrder,
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
    "w-full rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-sm text-white outline-none placeholder:text-white/60 transition focus:border-[#D4AF37]/60 focus:bg-white/[0.05]";

  const selectedCount =
    selectedServices.length;

  return (
    <main className="min-h-screen w-full min-w-0 max-w-none overflow-x-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[-15%] top-[5%] h-[520px] w-[520px] rounded-full bg-[#C49A45]/10 blur-[130px]" />
        <div className="absolute bottom-[5%] right-[-15%] h-[500px] w-[500px] rounded-full bg-[#C49A45]/8 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#090909,#030303_55%,#070707)]" />
      </div>

      <header className="relative z-20 border-b border-white/[0.08] bg-black/20 backdrop-blur-xl">
        <div className="w-full max-w-7xl mx-auto flex min-w-0 items-center justify-between px-4 py-5 sm:px-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50 transition hover:text-[#D4AF37]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition group-hover:border-[#D4AF37]/50">
              <ArrowLeft size={15} />
            </span>
            <span className="hidden sm:inline">
              Back to ORANE
            </span>
          </Link>

          <div className="text-center">
            <p className="text-sm font-semibold tracking-[0.42em] text-[#D4AF37]">
              ORANE
            </p>
            <p className="mt-1 text-[7px] uppercase tracking-[0.5em] text-white/65">
              ICKENHAM
            </p>
          </div>

          <div className="w-9 sm:w-[110px]" />
        </div>
      </header>

      <section className="relative z-10 w-full max-w-7xl mx-auto min-w-0 overflow-x-hidden px-4 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-16">
        <div className="w-full max-w-4xl mx-auto text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-[#D4AF37]/60 sm:w-14" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
              THE ORANE GIFT COLLECTION
            </span>

            <span className="h-px w-8 bg-[#D4AF37]/60 sm:w-14" />
          </div>

          <h1 className="font-serif text-[42px] leading-[0.95] sm:text-7xl">
            Give the gift
            <br />
            <span className="text-[#D4AF37]">
              of luxury.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
            Choose one or more signature ORANE
            experiences, or create a beautiful
            gift card with a value of your choice.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[9px] uppercase tracking-[0.22em] text-white/70">
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

        <div className="w-full max-w-7xl mx-auto mt-10 grid min-w-0 gap-5 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-7 lg:items-start">
          <div className="w-full min-w-0 max-w-none overflow-hidden rounded-[24px] border border-white/[0.09] bg-white/[0.025] shadow-2xl shadow-black/30 sm:rounded-[30px]">
            <div className="min-w-0 border-b border-white/[0.08] p-4 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-black">
                      01
                    </span>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">
                      Choose your gift
                    </p>
                  </div>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
                    Select a treatment voucher or
                    create your own flexible-value
                    gift card.
                  </p>
                </div>

                <Gift
                  size={22}
                  strokeWidth={1.5}
                  className="hidden text-[#D4AF37] sm:block"
                />
              </div>

              <div className="mt-6 grid w-full min-w-0 grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-2">
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
                      className={`group relative w-full min-w-0 overflow-hidden rounded-[20px] border p-5 text-left transition-all duration-300 ${
                        active
                          ? "border-[#D4AF37]/70 bg-[#C49A45]/10 shadow-lg shadow-[#C49A45]/5"
                          : "border-white/10 bg-white/[0.02] hover:border-[#D4AF37]/35 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                            active
                              ? "border-[#D4AF37]/40 bg-[#D4AF37]/10"
                              : "border-white/10 bg-white/[0.025]"
                          }`}
                        >
                          <Icon
                            size={18}
                            strokeWidth={1.5}
                            className="text-[#D4AF37]"
                          />
                        </span>

                        {active && (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4AF37] text-black">
                            <Check size={14} />
                          </span>
                        )}
                      </div>

                      <h2 className="mt-5 font-serif text-[22px]">
                        {option.title}
                      </h2>

                      <p className="mt-2 text-xs leading-5 text-white/70">
                        {option.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0 border-b border-white/[0.08] p-4 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[#D4AF37]">
                      02
                    </span>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">
                      {giftType === "service"
                        ? "Select treatments"
                        : "Choose amount"}
                    </p>
                  </div>

                  {giftType === "service" && (
                    <p className="mt-4 text-xs text-white/70">
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
                      className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:text-[#D4AF37]"
                    >
                      <X size={13} />
                      Clear
                    </button>
                  )}
              </div>

              {giftType === "service" ? (
                <div className="mt-6 w-full min-w-0 sm:mt-7">
                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/65 transition hover:text-white"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <div className="mt-4 min-w-0">
                    <div className="flex min-w-0 items-center gap-3">

                      {/* DESKTOP LEFT ARROW */}
                      <button
                        type="button"
                        onClick={() =>
                          categoryScroller.current?.scrollBy({
                            left: -280,
                            behavior: "smooth",
                          })
                        }
                        className="
                          hidden
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/10
                          bg-white/[0.025]
                          text-white/75
                          transition-all
                          duration-200
                          hover:border-[#D4AF37]/60
                          hover:bg-[#D4AF37]/10
                          hover:text-[#D4AF37]
                          lg:flex
                        "
                        aria-label="Scroll treatment categories left"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {/* CATEGORY SCROLLER */}
                      <div
                        ref={categoryScroller}
                        className="
                          flex
                          w-full
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
                        {categories.map((category) => {
                          const active =
                            activeCategory === category;

                          return (
                            <button
                              key={category}
                              type="button"
                              onClick={() =>
                                setActiveCategory(category)
                              }
                              className={`shrink-0 rounded-full border px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] transition ${
                                active
                                  ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                                  : "border-white/10 bg-white/[0.025] text-white/70 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
                              }`}
                            >
                              {category === "all"
                                ? "All treatments"
                                : category}
                            </button>
                          );
                        })}
                      </div>

                      {/* DESKTOP RIGHT ARROW */}
                      <button
                        type="button"
                        onClick={() =>
                          categoryScroller.current?.scrollBy({
                            left: 280,
                            behavior: "smooth",
                          })
                        }
                        className="
                          hidden
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/10
                          bg-white/[0.025]
                          text-white/75
                          transition-all
                          duration-200
                          hover:border-[#D4AF37]/60
                          hover:bg-[#D4AF37]/10
                          hover:text-[#D4AF37]
                          lg:flex
                        "
                        aria-label="Scroll treatment categories right"
                      >
                        <ChevronRight size={18} />
                      </button>

                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-white/60">
                      {filteredServices.length}{" "}
                      available
                    </p>

                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="gift-card-sort"
                        className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/60"
                      >
                        Sort by
                      </label>

                      <select
                        id="gift-card-sort"
                        value={sortOrder}
                        onChange={(event) =>
                          setSortOrder(
                            event.target.value as
                              | "default"
                              | "low-high"
                              | "high-low"
                          )
                        }
                        className="
                          rounded-full
                          border
                          border-white/10
                          bg-[#0b0b0b]
                          px-3
                          py-2
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.12em]
                          text-white/65
                          outline-none
                          transition
                          focus:border-[#D4AF37]/60
                        "
                      >
                        <option value="default">
                          Recommended
                        </option>
                        <option value="low-high">
                          Price: Low to High
                        </option>
                        <option value="high-low">
                          Price: High to Low
                        </option>
                      </select>

                      {selectedCount > 0 && (
                        <p className="text-[9px] uppercase tracking-[0.18em] text-[#D4AF37]">
                          £{serviceTotal.toFixed(2)}{" "}
                          selected
                        </p>
                      )}
                    </div>
                  </div>

                  {filteredServices.length === 0 ? (
                    <div className="mt-4 rounded-[22px] border border-dashed border-white/10 bg-white/[0.015] px-6 py-12 text-center">
                      <Search
                        size={22}
                        className="mx-auto text-white/55"
                      />
                      <p className="mt-4 font-serif text-xl">
                        No treatments found
                      </p>
                      <p className="mt-2 text-xs text-white/65">
                        Try another search or category.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 grid w-full min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {activeCategory === "Massage" ? (
                        [
                          { title: "Swedish Full Body Massage", ids: ["48", "49"] },
                          { title: "Deep Tissue Massage", ids: ["50", "51"] },
                          { title: "Indian Head Massage", ids: ["52", "53"] },
                        ].map((group) => {
                          const groupServices = filteredServices.filter((service) =>
  service.name
    .toLowerCase()
    .startsWith(group.title.toLowerCase())
);
                          if (!groupServices.length) return null;
                          return (
                            <div key={group.title} className="group w-full min-w-0 overflow-hidden rounded-[18px] border border-white/[0.09] bg-white/[0.018] p-4 transition-all duration-200 hover:border-[#D4AF37]/30 hover:bg-white/[0.035]">
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/35 text-[9px] font-semibold text-[#D4AF37]">{groupServices.length}</span>
                                <span className="truncate text-sm font-medium text-white/90">{group.title}</span>
                              </div>
                              <div className="mt-3 space-y-2">
                                {groupServices.map((service) => {
                                  const active = selectedServiceIds.includes(service.id);
                                  const variant = service.name.split("—")[1]?.trim() || service.name;
                                  return (
                                    <button key={service.id} type="button" onClick={() => { toggleService(service.id); setError(""); }} className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-[14px] border px-3 py-2.5 text-left transition-all duration-200 ${active ? "border-[#D4AF37]/65 bg-[#C49A45]/10" : "border-white/[0.08] bg-black/10 hover:border-[#D4AF37]/30"}`}>
                                      <div className="min-w-0"><span className="block truncate text-xs font-medium text-white/90">{cleanServiceText(variant)}</span><span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.12em] text-white/55">{cleanServiceText(variant)}</span></div>
                                      <div className="flex shrink-0 items-center gap-2"><span className="font-serif text-sm text-[#D4AF37]">£{Number(service.price).toFixed(2)}</span><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${active ? "border-[#D4AF37] bg-[#D4AF37] text-black" : "border-white/20 text-transparent"}`}><Check size={12} /></span></div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      ) /* MASSAGE_REMAINING_SERVICES_FIX */
                        .concat(
                          filteredServices
                            .filter(
                              (service) =>
                                ![
                                  "Swedish Full Body Massage",
                                  "Deep Tissue Massage",
                                  "Indian Head Massage",
                                ].some((groupTitle) =>
                                  String(service.name || "")
                                    .toLowerCase()
                                    .startsWith(groupTitle.toLowerCase())
                                )
                            )
                            .map((service) => {
                              const active =
                                selectedServiceIds.includes(service.id);

                              return (
                                <button
                                  key={`massage-individual-${service.id}`}
                                  type="button"
                                  onClick={() => {
                                    toggleService(service.id);
                                    setError("");
                                  }}
                                  className={`group flex w-full min-w-0 min-h-[82px] items-center justify-between gap-4 rounded-[18px] border px-4 py-3.5 text-left transition-all duration-200 ${
                                    active
                                      ? "border-[#D4AF37]/65 bg-[#C49A45]/10 shadow-lg shadow-[#C49A45]/5"
                                      : "border-white/[0.09] bg-white/[0.018] hover:border-[#D4AF37]/30 hover:bg-white/[0.035]"
                                  }`}
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    <span
                                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                                        active
                                          ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                          : "border-white/20 text-transparent group-hover:border-[#D4AF37]/50"
                                      }`}
                                    >
                                      <Check size={13} />
                                    </span>

                                    <div className="min-w-0">
                                      <span className="block truncate text-sm font-medium text-white/90">
                                        {cleanServiceText(service.name)}
                                      </span>

                                      <span className="mt-1 block truncate text-[8px] font-semibold uppercase tracking-[0.16em] text-white/60">
                                        {cleanServiceText(service.category)}
                                      </span>
                                    </div>
                                  </div>

                                  <span className="shrink-0 font-serif text-base text-[#D4AF37]">
                                    £{Number(service.price).toFixed(2)}
                                  </span>
                                </button>
                              );
                            })
                        )
                        : filteredServices.map(
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
                              className={`group flex w-full min-w-0 min-h-[82px] items-center justify-between gap-4 rounded-[18px] border px-4 py-3.5 text-left transition-all duration-200 ${
                                active
                                  ? "border-[#D4AF37]/65 bg-[#C49A45]/10 shadow-lg shadow-[#C49A45]/5"
                                  : "border-white/[0.09] bg-white/[0.018] hover:border-[#D4AF37]/30 hover:bg-white/[0.035]"
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                                    active
                                      ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                      : "border-white/20 text-transparent group-hover:border-[#D4AF37]/50"
                                  }`}
                                >
                                  <Check size={13} />
                                </span>

                                <div className="min-w-0">
                                  
                                  {/* ALL_TREATMENTS_MAIN_CATEGORY_HIERARCHY */}
                                  {activeCategory === "all" ? (
                                    <>
                                      <span className="block truncate text-sm font-semibold text-white">
                                        {cleanServiceText(
                                          service.category
                                        )}
                                      </span>

                                      <span className="mt-1 block truncate text-[9px] font-medium text-white/55">
                                        {cleanServiceText(
                                          service.name
                                        )}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="block truncate text-sm font-medium text-white/90">
                                        {cleanServiceText(
                                          service.name
                                        )}
                                      </span>

                                      <span className="mt-1 block truncate text-[8px] font-semibold uppercase tracking-[0.16em] text-white/60">
                                        {cleanServiceText(
                                          service.category
                                        )}
                                      </span>
                                    </>
                                  )}
</div>
                              </div>

                              <span className="shrink-0 font-serif text-base text-[#D4AF37]">
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
                <div className="mt-6 w-full min-w-0 sm:mt-7">
                  <div className="grid w-full min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-4">
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
                                ? "border-[#D4AF37]/65 bg-[#C49A45]/10 text-[#D4AF37]"
                                : "border-white/10 bg-white/[0.02] text-white/70 hover:border-[#D4AF37]/35"
                            }`}
                          >
                            £{value}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <div className="relative mt-4">
                    <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-serif text-xl text-[#D4AF37]">
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

                  <p className="mt-3 text-[10px] text-white/60">
                    Gift cards can be created from £25
                    up to £500.
                  </p>
                </div>
              )}
            </div>

            <div className="w-full min-w-0 p-4 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[#D4AF37]">
                  03
                </span>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">
                    Who is it for?
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Tell us where to send your gift.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid w-full min-w-0 grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setRecipientType("self")
                  }
                  className={`rounded-[20px] border p-5 text-left transition ${
                    recipientType === "self"
                      ? "border-[#D4AF37]/65 bg-[#C49A45]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-[#D4AF37]/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <User
                      size={19}
                      className="text-[#D4AF37]"
                    />

                    {recipientType === "self" && (
                      <Check
                        size={16}
                        className="text-[#D4AF37]"
                      />
                    )}
                  </div>

                  <p className="mt-5 text-sm font-medium">
                    For myself
                  </p>

                  <p className="mt-1 text-[10px] text-white/65">
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
                      ? "border-[#D4AF37]/65 bg-[#C49A45]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-[#D4AF37]/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Heart
                      size={19}
                      className="text-[#D4AF37]"
                    />

                    {recipientType ===
                      "someone" && (
                      <Check
                        size={16}
                        className="text-[#D4AF37]"
                      />
                    )}
                  </div>

                  <p className="mt-5 text-sm font-medium">
                    Gift it to someone
                  </p>

                  <p className="mt-1 text-[10px] text-white/65">
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
                <div className="mt-4 grid w-full min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2">
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

          <aside className="w-full min-w-0 max-w-none lg:sticky lg:top-6 lg:self-start">
            <div className="w-full min-w-0 overflow-hidden rounded-[24px] border border-[#D4AF37]/25 bg-[#0b0b0b]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="relative overflow-hidden border-b border-white/[0.08] p-7 sm:p-8">
                <div className="pointer-events-none absolute right-[-40px] top-[-50px] h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-[55px]" />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
                      ORANE ICKENHAM
                    </p>

                    <p className="mt-3 font-serif text-3xl">
                      Gift Card
                    </p>

                    <p className="mt-2 text-[10px] leading-5 text-white/65">
                      A little luxury, beautifully
                      gifted.
                    </p>
                  </div>

                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/5">
                    <Gift
                      size={19}
                      strokeWidth={1.4}
                      className="text-[#D4AF37]"
                    />
                  </span>
                </div>
              </div>

              <div className="p-7 sm:p-8">
                <div className="space-y-5">
                  <div className="flex justify-between gap-5">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-white/65">
                      Gift type
                    </span>

                    <span className="text-right text-xs text-white/75">
                      {giftType === "service"
                        ? "Service Voucher"
                        : "Custom Gift Card"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-5">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-white/65">
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
                        <span className="text-[10px] uppercase tracking-[0.16em] text-white/65">
                          Treatments
                        </span>

                        <span className="text-xs text-[#D4AF37]">
                          {selectedCount}
                        </span>
                      </div>
                    )}
                </div>

                <div className="my-7 h-px bg-white/[0.08]" />

                <div className="rounded-[20px] border border-[#D4AF37]/15 bg-[#D4AF37]/[0.035] p-5">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/70">
                      Gift value
                    </span>

                    <span className="font-serif text-4xl text-[#D4AF37]">
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
                  className="group mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#D4AF37] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.17em] text-black shadow-lg shadow-[#D4AF37]/10 transition-all hover:bg-[#e5c36e] hover:shadow-xl hover:shadow-[#D4AF37]/15 disabled:cursor-not-allowed disabled:opacity-40"
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
                  <div className="flex items-center gap-3 text-[10px] text-white/65">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04]">
                      <Mail size={13} />
                    </span>
                    Secure digital delivery
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-white/65">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04]">
                      <Check
                        size={13}
                        className="text-[#D4AF37]"
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



