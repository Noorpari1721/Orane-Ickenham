"use client";

import { useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Minus,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

import { useBooking } from "@/context/BookingContext";
import { serviceCategories } from "@/data/services";

export default function Step1Services() {
  const {
    booking,
    toggleService,
    removeService,
    updateBooking,
  } = useBooking();

  const categoryScroller = useRef<HTMLDivElement | null>(null);
  /*
   * BookingContext is the single source of truth for the
   * currently selected category.
   *
   * This is intentionally derived from booking.category
   * instead of maintaining a second local category state.
   *
   * Therefore:
   * Home Services -> category -> treatment -> Book Now
   * will always open the same category here on both
   * mobile and desktop.
   */
  /*
   * FINAL CATEGORY RESOLUTION
   *
   * Priority:
   *
   * 1. booking.category
   * 2. If booking.category does not match the selected
   *    service, derive the category from that service.
   * 3. Fall back to the first category only when there
   *    is no usable booking/service category.
   *
   * This prevents:
   *
   * Home Services
   * -> Category
   * -> Treatment
   * -> Book Now
   *
   * from opening the correct treatment while displaying
   * the wrong active category capsule.
   */
  const selectedServices =
    booking.services?.length
      ? booking.services
      : booking.service
        ? [booking.service]
        : [];

  const selectedService =
    selectedServices.length === 1
      ? selectedServices[0]
      : null;

  const activeCategoryId =
    booking.category ||
    serviceCategories[0]?.id ||
    "";
  // Only one treatment card can be expanded at a time.
  const [expandedServiceId, setExpandedServiceId] = useState<number | string | null>(null);

  const [catalogueFilter, setCatalogueFilter] = useState<string>("");

  const [packageSavingsPopup, setPackageSavingsPopup] = useState<{
    packageName: string;
    individualTotal: number;
    packagePrice: number;
    savings: number;
  } | null>(null);

  const activeCategory =
    serviceCategories.find(
      (category) => category.id === activeCategoryId
    ) || serviceCategories[0];

  const NAIL_ADD_ONS = new Set([
    "Nail Art",
    "Nail Repair",
    "Big Toe Fix",
    "French Tips (Toes)",
    "Chrome / Glitter / Cat Eye",
    "French Tips",
    "Remove Gel/Shellac from Toes Only",
    "Apply Normal Polish Only",
    "Remove Gel Polish/Shellac Only",
    "Extensions Removal",
  ]);

  const PEDICURE_ADD_ONS = new Set([
    "Remove Gel/Shellac from Toes Only",
    "French Tips (Toes)",
    "Big Toe Fix",
  ]);

  const isNailsCategory =
    activeCategory?.title?.trim().toLowerCase() === "nails";

  const isWaxingThreadingCategory =
    activeCategory?.title?.trim().toLowerCase() === "waxing & threading";

  const isPedicureCategory =
    activeCategory?.title?.trim().toLowerCase() === "pedicure";

  const isAddOnService = (service: (typeof selectedServices)[number]) => {
    const name = String(service.name || "").trim();

    if (isNailsCategory) {
      return NAIL_ADD_ONS.has(name);
    }

    if (isPedicureCategory) {
      return PEDICURE_ADD_ONS.has(name);
    }

    if (isWaxingThreadingCategory) {
      return /add[\s-]?on|additional/i.test(name);
    }

    return false;
  };

  const filteredActiveServices = useMemo(() => {
    const services = activeCategory?.services ?? [];

    if (isNailsCategory) {
      const mainServices = services
        .filter((service) => !NAIL_ADD_ONS.has(service.name))
        .filter((service) => {
          const name = service.name.trim().toLowerCase();

          if (catalogueFilter === "acrylic") {
            return name.includes("acrylic");
          }

          if (catalogueFilter === "biab") {
            return name.includes("biab");
          }

          if (catalogueFilter === "builder-gel") {
            return name.includes("builder gel");
          }

          return false;
        })
        .sort(
          (a, b) =>
            Number(a.price || 0) -
            Number(b.price || 0)
        );

      const addOns = services
        .filter((service) => NAIL_ADD_ONS.has(service.name))
        .sort(
          (a, b) =>
            Number(a.price || 0) -
            Number(b.price || 0)
        );

      return [...mainServices, ...addOns];
    }

    if (isWaxingThreadingCategory) {
      return services
        .filter((service) => {
          const name = service.name.trim().toLowerCase();

          if (catalogueFilter === "threading") {
            return name.includes("threading");
          }

          return name.includes("wax");
        })
        .sort(
          (a, b) =>
            Number(a.price || 0) -
            Number(b.price || 0)
        );
    }

    return services.sort(
      (a, b) =>
        Number(a.price || 0) -
        Number(b.price || 0)
    );
  }, [
    activeCategory,
    catalogueFilter,
    isNailsCategory,
    isWaxingThreadingCategory,
    isPedicureCategory,
  ]);


  const packageHighlightCategoryIds = new Set([
    "nails",
    "manicure",
    "pedicure",
  ]);

  const shouldHighlightPackages = packageHighlightCategoryIds.has(
    activeCategoryId
  );

  const packageCategory = serviceCategories.find(
    (category) => category.id === "packages"
  );

  const recommendedPackages = useMemo(() => {
    if (!shouldHighlightPackages) return [];

    const adultPackages = [...(packageCategory?.services ?? [])].filter(
      (service) => {
        const name = String(service.name || "").trim().toLowerCase();

        return (
          !name.includes("kid") &&
          !name.includes("child") &&
          !name.includes("junior") &&
          name !== "kids mani & pedi combo"
        );
      }
    );

    return adultPackages
      .sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      )
      .slice(0, 3);
  }, [packageCategory, shouldHighlightPackages]);

  const selectedIds = useMemo(
    () => new Set(selectedServices.map((service) => service.id)),
    [selectedServices]
  );

  const totalPrice = useMemo(
    () =>
      selectedServices.reduce(
        (total, service) => total + Number(service.price || 0),
        0
      ),
    [selectedServices]
  );

  const totalMinutes = useMemo(() => {
    return selectedServices.reduce((total, service) => {
      const value = String(service.duration || "")
        .toLowerCase()
        .trim();

      let minutes = 0;

      const hourMatch = value.match(/(\d+(?:\.\d+)?)\s*hr/);
      const minuteMatch = value.match(/(\d+)\s*min/);

      if (hourMatch) {
        minutes += Math.round(Number(hourMatch[1]) * 60);
      }

      if (minuteMatch) {
        minutes += Number(minuteMatch[1]);
      }

      return total + minutes;
    }, 0);
  }, [selectedServices]);

  const totalDuration = useMemo(() => {
    if (!totalMinutes) return "0 min";

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (!hours) return `${minutes} min`;
    if (!minutes) return `${hours} hr`;

    return `${hours} hr ${minutes} min`;
  }, [totalMinutes]);

  const selectCategory = (categoryId: string) => {
    setExpandedServiceId(null);

    // Lock the current document position while React swaps
    // the category content. This prevents the browser from
    // applying its own scroll anchoring during the layout change.
    const scrollY = window.scrollY;

    document.documentElement.style.scrollBehavior = "auto";
    document.documentElement.style.overflowAnchor = "none";

    if (categoryId === "nails") {
      setCatalogueFilter("acrylic");
    } else if (categoryId === "waxing-threading") {
      setCatalogueFilter("waxing");
    } else {
      setCatalogueFilter("");
    }

    updateBooking({
      category: categoryId,
    });

    window.scrollTo(0, scrollY);

    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
        document.documentElement.style.overflowAnchor = "";
      });
    });
  };

  const scrollCategories = (direction: "left" | "right") => {
    const container = categoryScroller.current;

    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  const handleServiceToggle = (service: (typeof selectedServices)[number]) => {
    toggleService(service);
  };

  const handlePackageSelect = (packageService: (typeof selectedServices)[number]) => {
    const packageId = Number(packageService.id);

    const packageMatches: Record<number, number[]> = {
      99: [29, 42],
      100: [30, 43],
      101: [32, 41],
      102: [33, 40],
      103: [36, 44],
      104: [37, 45],
    };

    const matchedIds = packageMatches[packageId] ?? [];

    const allServices = serviceCategories.flatMap((category) => category.services);

    const matchedServices = allServices.filter((item) =>
      matchedIds.includes(Number(item.id))
    );

    const individualTotal = matchedServices.reduce(
      (total, item) => total + Number(item.price || 0),
      0
    );

    const packagePrice = Number(packageService.price || 0);
    const savings = Math.max(0, individualTotal - packagePrice);

    matchedIds.forEach((id) => {
      if (selectedServices.some((item) => Number(item.id) === id)) {
        removeService(id);
      }
    });

    if (selectedServices.some((item) => Number(item.id) === packageId)) {
      handleServiceToggle(packageService);
      return;
    }

    toggleService(packageService);

    if (savings > 0) {
      setPackageSavingsPopup({
        packageName: packageService.name,
        individualTotal,
        packagePrice,
        savings,
      });
    }
  };

  return (
    <div className="w-full space-y-8 lg:space-y-10">

      {/* INTRO */}
      <div className="mx-auto max-w-3xl text-center">

<p className="text-[10px] uppercase tracking-[0.38em] text-[#D4AF37] sm:text-xs sm:tracking-[0.45em]">
          Step One
        </p>

        <h2 className="mt-4 text-3xl font-light tracking-tight text-white sm:text-4xl lg:text-5xl">
          Curate Your Experience
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
          Select one or more treatments from any category and create your
          personalised luxury experience.
        </p>
      </div>

      {/* CATEGORY NAVIGATION */}
      <div className="flex items-center gap-3 sm:gap-4">

        <button
          type="button"
          onClick={() => scrollCategories("left")}
          className="hidden md:flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/75 transition-all duration-300 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
          aria-label="Scroll categories left"
        >
          <ChevronLeft size={19} />
        </button>

        <div className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.025] p-2.5 sm:p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.035)]">
          <div
            ref={categoryScroller}
            className="flex gap-1.5 overflow-x-auto overscroll-x-contain scroll-smooth pb-0.5 sm:gap-2 sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {serviceCategories.map((category) => {
              const active = activeCategoryId === category.id;

              const selectedCount = category.services.filter(
                (service) => selectedIds.has(service.id)
              ).length;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.id)}
                  className={`
                    inline-flex shrink-0 items-center gap-2 rounded-full border
                    px-4 py-3 text-sm transition-all duration-300 sm:px-5 sm:py-2.5
                    ${
                      active
                        ? "border-[#D4AF37] bg-[#D4AF37]/12 text-[#E7C95D] shadow-[0_0_25px_rgba(212,175,55,.10)]"
                        : "border-transparent text-white/55 hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >
                  <span>{category.title}</span>

                  {selectedCount > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-1.5 py-0.5 text-[10px] text-[#D4AF37]">
                      {selectedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => scrollCategories("right")}
          className="hidden md:flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/75 transition-all duration-300 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
          aria-label="Scroll categories right"
        >
          <ChevronRight size={19} />
        </button>

      </div>

      {/* ACTIVE CATEGORY */}
      {activeCategory && (
        <section>

          <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">
                Treatment Collection
              </p>

              <div className="flex items-center gap-3">
                <div className="h-[105px] w-[150px] shrink-0 overflow-hidden rounded-[22px] border border-[#D4AF37]/30 bg-black/20 shadow-[0_8px_25px_rgba(0,0,0,0.25)]">
                  <img
                    src={activeCategory.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                <h3 className="text-2xl font-light tracking-tight text-white sm:text-3xl">
                  {activeCategory.title}
                </h3>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                {activeCategory.description}
              </p>
            </div>

            <p className="shrink-0 text-xs uppercase tracking-[0.18em] text-white/70">
              {filteredActiveServices.length} treatments
            </p>
          </div>

          {(isNailsCategory || isWaxingThreadingCategory) && (
            <div className="mb-5 flex flex-wrap gap-2">

              {isNailsCategory && (
                <>
                  <button
                    type="button"
                    onClick={() => setCatalogueFilter("acrylic")}
                    className={
                      catalogueFilter === "acrylic"
                        ? "rounded-full border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black shadow-[0_0_20px_rgba(212,175,55,.18)]"
                        : "rounded-full border border-white/15 bg-white/[0.025] px-4 py-2 text-sm font-medium text-white/65 transition-all hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
                    }
                  >
                    Acrylic
                  </button>

                  <button
                    type="button"
                    onClick={() => setCatalogueFilter("biab")}
                    className={
                      catalogueFilter === "biab"
                        ? "rounded-full border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black shadow-[0_0_20px_rgba(212,175,55,.18)]"
                        : "rounded-full border border-white/15 bg-white/[0.025] px-4 py-2 text-sm font-medium text-white/65 transition-all hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
                    }
                  >
                    BIAB
                  </button>

                  <button
                    type="button"
                    onClick={() => setCatalogueFilter("builder-gel")}
                    className={
                      catalogueFilter === "builder-gel"
                        ? "rounded-full border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black shadow-[0_0_20px_rgba(212,175,55,.18)]"
                        : "rounded-full border border-white/15 bg-white/[0.025] px-4 py-2 text-sm font-medium text-white/65 transition-all hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
                    }
                  >
                    Builder Gel
                  </button>
                </>
              )}

              {isWaxingThreadingCategory && (
                <>
                  <button
                    type="button"
                    onClick={() => setCatalogueFilter("waxing")}
                    className={
                      catalogueFilter === "waxing"
                        ? "rounded-full border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black shadow-[0_0_20px_rgba(212,175,55,.18)]"
                        : "rounded-full border border-white/15 bg-white/[0.025] px-4 py-2 text-sm font-medium text-white/65 transition-all hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
                    }
                  >
                    Waxing
                  </button>

                  <button
                    type="button"
                    onClick={() => setCatalogueFilter("threading")}
                    className={
                      catalogueFilter === "threading"
                        ? "rounded-full border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black shadow-[0_0_20px_rgba(212,175,55,.18)]"
                        : "rounded-full border border-white/15 bg-white/[0.025] px-4 py-2 text-sm font-medium text-white/65 transition-all hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
                    }
                  >
                    Threading
                  </button>
                </>
              )}

            </div>
          )}
          <div className="grid gap-3 lg:grid-cols-2">
            {activeCategoryId === "massage" ? (
              [
                { title: "Swedish Full Body Massage", ids: [48, 49] },
                { title: "Deep Tissue Massage", ids: [50, 51] },
                { title: "Indian Head Massage", ids: [52, 53] },
              ].map((group) => {
                const groupServices = filteredActiveServices.filter((service) =>
                  group.ids.includes(Number(service.id))
                );
                if (!groupServices.length) return null;
                return (
                  <div key={group.title} className="group relative w-full overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.018] p-5 transition-all duration-300 hover:border-[#D4AF37]/45 hover:bg-white/[0.035] hover:shadow-[0_12px_35px_rgba(212,175,55,0.18)]">
                    <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full bg-[#D4AF37]/70" />
                    <h4 className="text-base font-medium text-white sm:text-lg">{group.title}</h4>
                    <div className="mt-4 space-y-2">
                      {groupServices.map((service) => {
                        const selected = selectedIds.has(service.id);
                        const variant = service.name.split("—")[1]?.trim() || service.name;
                        return (
                          <button key={service.id} type="button" onClick={() => handleServiceToggle(service)} className={`flex w-full items-center justify-between gap-3 rounded-[16px] border px-3.5 py-3 text-left transition-all duration-200 ${selected ? "border-[#D4AF37]/65 bg-[#D4AF37]/[0.08]" : "border-white/10 bg-black/10 hover:border-[#D4AF37]/35"}`}>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white">{variant}</p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-white/60"><Clock3 size={13} className="text-[#D4AF37]" /><span>{service.duration}</span><span>•</span><span className="text-[#D4AF37]">£{Number(service.price).toFixed(2)}</span></div>
                            </div>
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[#D4AF37] bg-[#D4AF37] text-black" : "border-white/15 text-transparent"}`}>{selected ? <Check size={16} /> : <Plus size={16} />}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) /* MASSAGE_REMAINING_SERVICES_FIX */
              .concat(
                filteredActiveServices
                  .filter(
                    (service) =>
                      ![
                        48,
                        49,
                        50,
                        51,
                        52,
                        53,
                      ].includes(Number(service.id))
                  )
                  .map((service) => {
                    const selected = selectedIds.has(service.id);

                    return (
                      <button
                        key={`massage-individual-${service.id}`}
                        type="button"
                        onClick={() => handleServiceToggle(service)}
                        className={`
                          group relative flex min-h-[118px] w-full items-center gap-4
                          overflow-hidden rounded-[22px] border p-5 text-left
                          transition-all duration-300 sm:p-5
                          ${
                            selected
                              ? "border-[#D4AF37]/70 bg-[#D4AF37]/[0.065] shadow-[0_0_35px_rgba(212,175,55,.08)]"
                              : "border-white/10 bg-white/[0.018] hover:-translate-y-[2px] hover:border-[#D4AF37]/45 hover:bg-white/[0.035] hover:shadow-[0_12px_35px_rgba(212,175,55,0.18)]"
                          }
                        `}
                      >
                        <div
                          className={`
                            absolute left-0 top-4 bottom-4 w-[2px] rounded-full
                            transition-all duration-300
                            ${
                              selected
                                ? "bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,.7)]"
                                : "bg-transparent"
                            }
                          `}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="text-base font-medium text-white sm:text-lg">
                                {service.name}
                              </h4>

                              <p
                                className={`mt-1 text-xs leading-5 text-white/75 sm:text-sm ${
                                  expandedServiceId === service.id
                                    ? ""
                                    : "line-clamp-2"
                                }`}
                              >
                                {service.description}
                              </p>

                              {service.description.length > 95 && (
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setExpandedServiceId(
                                      expandedServiceId === service.id
                                        ? null
                                        : service.id
                                    );
                                  }}
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === "Enter" ||
                                      event.key === " "
                                    ) {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      setExpandedServiceId(
                                        expandedServiceId === service.id
                                          ? null
                                          : service.id
                                      );
                                    }
                                  }}
                                  className="mt-1 inline-flex cursor-pointer select-none text-[11px] font-medium text-[#D4AF37] transition-colors hover:text-[#E7C95D]"
                                >
                                  {expandedServiceId === service.id
                                    ? "Read less"
                                    : "Read more"}
                                </span>
                              )}
                            </div>

                            <span className="shrink-0 text-base font-medium text-[#D4AF37]">
                              {"\u00A3"}
                              {Number(service.price).toFixed(2)}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-2 text-xs text-white/75">
                            <Clock3 size={14} className="text-[#D4AF37]" />
                            <span>{service.duration}</span>
                          </div>
                        </div>

                        <div
                          className={`
                            flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                            border transition-all duration-300
                            ${
                              selected
                                ? "border-[#D4AF37] bg-[#D4AF37] text-black shadow-[0_0_18px_rgba(212,175,55,.20)]"
                                : "border-white/15 text-transparent group-hover:border-white/30"
                            }
                          `}
                        >
                          {selected ? <Check size={18} /> : <Plus size={18} />}
                        </div>
                      </button>
                    );
                  })
              )
              : filteredActiveServices.filter((service) => !isAddOnService(service)).map((service) => {
              const selected = selectedIds.has(service.id);

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceToggle(service)}
                  className={`
                    group relative flex min-h-[118px] w-full items-center gap-4
                    overflow-hidden rounded-[22px] border p-5 text-left
                    transition-all duration-300 sm:p-5
                    ${
                      selected
                        ? "border-[#D4AF37]/70 bg-[#D4AF37]/[0.065] shadow-[0_0_35px_rgba(212,175,55,.08)]"
                        : "border-white/10 bg-white/[0.018] hover:-translate-y-[2px] hover:border-[#D4AF37]/45 hover:bg-white/[0.035] hover:shadow-[0_12px_35px_rgba(212,175,55,0.18)]"
                    }
                  `}
                >

                  {/* GOLD ACCENT */}
                  <div
                    className={`
                      absolute left-0 top-4 bottom-4 w-[2px] rounded-full
                      transition-all duration-300
                      ${
                        selected
                          ? "bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,.7)]"
                          : "bg-transparent"
                      }
                    `}
                  />


                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-base font-medium text-white sm:text-lg">
                          {service.name}
                        </h4>

                                                <p
                          className={`mt-1 text-xs leading-5 text-white/75 sm:text-sm ${
                            expandedServiceId === service.id
                              ? ""
                              : "line-clamp-2"
                          }`}
                        >
                          {service.description}
                        </p>

                        {service.description.length > 95 && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              setExpandedServiceId(
                                expandedServiceId === service.id
                                  ? null
                                  : service.id
                              );
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                event.preventDefault();
                                event.stopPropagation();
                                setExpandedServiceId(
                                  expandedServiceId === service.id
                                    ? null
                                    : service.id
                                );
                              }
                            }}
                            className="mt-1 inline-flex cursor-pointer select-none text-[11px] font-medium text-[#D4AF37] transition-colors hover:text-[#E7C95D]"
                          >
                            {expandedServiceId === service.id
                              ? "Read less"
                              : "Read more"}
                          </span>
                        )}
                      </div>

                      <span className="shrink-0 text-base font-medium text-[#D4AF37]">
                        {"\u00A3"}
                        {Number(service.price).toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-white/75">
                      <Clock3 size={14} className="text-[#D4AF37]" />
                      <span>{service.duration}</span>
                    </div>

                  </div>

                  {/* SELECT CONTROL */}
                  <div
                    className={`
                      flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                      border transition-all duration-300
                      ${
                        selected
                          ? "border-[#D4AF37] bg-[#D4AF37] text-black shadow-[0_0_18px_rgba(212,175,55,.20)]"
                          : "border-white/15 text-transparent group-hover:border-white/30"
                      }
                    `}
                  >
                    {selected ? <Check size={18} /> : <Plus size={18} />}
                  </div>

                </button>
              );
            })}
          </div>



          {(isNailsCategory || isPedicureCategory || isWaxingThreadingCategory) &&
            filteredActiveServices.some((service) => isAddOnService(service)) && (
              <div className="mt-8">
                <div className="mb-4">
                  <h4 className="text-sm font-medium uppercase tracking-[0.24em] text-[#D4AF37]">
                    Add-ons
                  </h4>

                  <div className="mt-2 h-px w-full bg-gradient-to-r from-[#D4AF37]/60 via-[#D4AF37]/20 to-transparent" />
                </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {filteredActiveServices.filter((service) => isAddOnService(service)).map((service) => {
              const selected = selectedIds.has(service.id);

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceToggle(service)}
                  className={`
                    group relative flex min-h-[118px] w-full items-center gap-4
                    overflow-hidden rounded-[22px] border p-5 text-left
                    transition-all duration-300 sm:p-5
                    ${
                      selected
                        ? "border-[#D4AF37]/70 bg-[#D4AF37]/[0.065] shadow-[0_0_35px_rgba(212,175,55,.08)]"
                        : "border-white/10 bg-white/[0.018] hover:-translate-y-[2px] hover:border-[#D4AF37]/45 hover:bg-white/[0.035] hover:shadow-[0_12px_35px_rgba(212,175,55,0.18)]"
                    }
                  `}
                >

                  {/* GOLD ACCENT */}
                  <div
                    className={`
                      absolute left-0 top-4 bottom-4 w-[2px] rounded-full
                      transition-all duration-300
                      ${
                        selected
                          ? "bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,.7)]"
                          : "bg-transparent"
                      }
                    `}
                  />


                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-base font-medium text-white sm:text-lg">
                          {service.name}
                        </h4>

                                                <p
                          className={`mt-1 text-xs leading-5 text-white/75 sm:text-sm ${
                            expandedServiceId === service.id
                              ? ""
                              : "line-clamp-2"
                          }`}
                        >
                          {service.description}
                        </p>

                        {service.description.length > 95 && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              setExpandedServiceId(
                                expandedServiceId === service.id
                                  ? null
                                  : service.id
                              );
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                event.preventDefault();
                                event.stopPropagation();
                                setExpandedServiceId(
                                  expandedServiceId === service.id
                                    ? null
                                    : service.id
                                );
                              }
                            }}
                            className="mt-1 inline-flex cursor-pointer select-none text-[11px] font-medium text-[#D4AF37] transition-colors hover:text-[#E7C95D]"
                          >
                            {expandedServiceId === service.id
                              ? "Read less"
                              : "Read more"}
                          </span>
                        )}
                      </div>

                      <span className="shrink-0 text-base font-medium text-[#D4AF37]">
                        {"\u00A3"}
                        {Number(service.price).toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-white/75">
                      <Clock3 size={14} className="text-[#D4AF37]" />
                      <span>{service.duration}</span>
                    </div>

                  </div>

                  {/* SELECT CONTROL */}
                  <div
                    className={`
                      flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                      border transition-all duration-300
                      ${
                        selected
                          ? "border-[#D4AF37] bg-[#D4AF37] text-black shadow-[0_0_18px_rgba(212,175,55,.20)]"
                          : "border-white/15 text-transparent group-hover:border-white/30"
                      }
                    `}
                  >
                    {selected ? <Check size={18} /> : <Plus size={18} />}
                  </div>

                </button>
              );
            })}
          </div>


              </div>
            )}
          {shouldHighlightPackages && recommendedPackages.length > 0 && (
            <div className="mt-8 rounded-[24px] border border-[#D4AF37]/25 bg-[#D4AF37]/[0.035] p-4 shadow-[0_10px_35px_rgba(212,175,55,.06)] sm:p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Sparkles size={17} />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">
                    Recommended For You
                  </p>

                  <h4 className="mt-1 text-lg font-light text-white sm:text-xl">
                    Explore Our Packages
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-white/55 sm:text-sm">
                    Complete your experience with one of our curated packages.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                {recommendedPackages.map((service) => {
                  const selected = selectedIds.has(service.id);

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handlePackageSelect(service)}
                      className={`
                        group relative flex min-h-[112px] w-full flex-col justify-between
                        rounded-[20px] border p-4 text-left transition-all duration-300
                        ${
                          selected
                            ? "border-[#D4AF37]/70 bg-[#D4AF37]/[0.10] shadow-[0_0_30px_rgba(212,175,55,.10)]"
                            : "border-white/10 bg-white/[0.018] hover:-translate-y-[2px] hover:border-[#D4AF37]/45 hover:bg-white/[0.035]"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h5 className="text-sm font-medium text-white">
                            {service.name}
                          </h5>

                          {service.description && (
                            <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/55">
                              {service.description}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 text-sm font-medium text-[#D4AF37]">
                          {"\u00A3"}
                          {Number(service.price).toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 text-[11px] text-white/60">
                          <Clock3 size={12} className="text-[#D4AF37]" />
                          {service.duration}
                        </span>

                        <span
                          className={`
                            flex h-7 w-7 items-center justify-center rounded-full border
                            transition-all duration-300
                            ${
                              selected
                                ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                : "border-white/15 text-white/50 group-hover:border-[#D4AF37]/50 group-hover:text-[#D4AF37]"
                            }
                          `}
                        >
                          {selected ? <Check size={15} /> : <Plus size={15} />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}        </section>
      )}

      {/* SELECTION SUMMARY */}
      

      {/* PACKAGE SAVINGS POPUP */}
      {packageSavingsPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Package savings"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#D4AF37]/35 bg-[#11100F] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.65)] sm:p-8">
            <button
              type="button"
              onClick={() => setPackageSavingsPopup(null)}
              aria-label="Close package savings"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-[#D4AF37]/50 hover:text-white"
            >
              <X size={17} />
            </button>

            <div className="pr-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#D4AF37]">
                Exclusive Package Saving
              </p>

              <h3 className="mt-3 text-2xl font-medium tracking-tight text-white sm:text-3xl">
                {packageSavingsPopup.packageName}
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Your package replaces the matching individual treatments, so you are not charged twice.
              </p>
            </div>

            <div className="mt-7 space-y-3 rounded-[20px] border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-white/60">
                  Individual treatments total
                </span>
                <span className="text-sm font-medium text-white">
                  {"\u00A3"}{packageSavingsPopup.individualTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-white/60">
                  Package price
                </span>
                <span className="text-sm font-medium text-[#D4AF37]">
                  {"\u00A3"}{packageSavingsPopup.packagePrice.toFixed(2)}
                </span>
              </div>

              <div className="my-2 h-px bg-white/10" />

              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-medium text-white">
                  You save
                </span>
                <span className="text-xl font-semibold text-[#D4AF37]">
                  {"\u00A3"}{packageSavingsPopup.savings.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPackageSavingsPopup(null)}
              className="mt-6 w-full rounded-full bg-[#D4AF37] px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-[#e2c45b] active:scale-[0.99]"
            >
              Continue with Package
            </button>
          </div>
        </div>
      )}
{/* MOBILE SELECTION INDICATOR */}
      {selectedServices.length > 0 && (
        <div className="sticky bottom-3 z-20 lg:hidden">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#D4AF37]/25 bg-[#0b0b0b]/95 px-4 py-3 shadow-[0_15px_50px_rgba(0,0,0,.55)] backdrop-blur-xl">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">
                Selected
              </p>
              <p className="mt-1 text-sm text-white">
                {selectedServices.length} treatment
                {selectedServices.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-white/70">{totalDuration}</p>
              <p className="text-lg font-medium text-[#E7C95D]">
                {"\u00A3"}
                {totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}






