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

  const [activeCategoryId, setActiveCategoryId] = useState(
    booking.category ||
      serviceCategories[0]?.id ||
      ""
  );

  // Only one treatment card can be expanded at a time.
  const [expandedServiceId, setExpandedServiceId] = useState<number | string | null>(null);

  const activeCategory =
    serviceCategories.find(
      (category) => category.id === activeCategoryId
    ) || serviceCategories[0];

  // Display treatments from lowest price to highest
  // within the currently selected category.
  const sortedActiveServices = useMemo(
    () =>
      activeCategory
        ? [...activeCategory.services].sort(
            (a, b) =>
              Number(a.price || 0) -
              Number(b.price || 0)
          )
        : [],
    [activeCategory]
  );

  const selectedServices =
    booking.services?.length
      ? booking.services
      : booking.service
        ? [booking.service]
        : [];

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
    setActiveCategoryId(categoryId);
    setExpandedServiceId(null);

    updateBooking({
      category: categoryId,
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
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/60 transition-all duration-300 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
          aria-label="Scroll categories left"
        >
          <ChevronLeft size={19} />
        </button>

        <div className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.025] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.035)]">
          <div
            ref={categoryScroller}
            className="flex gap-2 overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                    px-5 py-2.5 text-sm transition-all duration-300
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
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/60 transition-all duration-300 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
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
              <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]/70">
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

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                {activeCategory.description}
              </p>
            </div>

            <p className="shrink-0 text-xs uppercase tracking-[0.18em] text-white/35">
              {activeCategory.services.length} treatments
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {sortedActiveServices.map((service) => {
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
                          className={`mt-1 text-xs leading-5 text-white/45 sm:text-sm ${
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

                    <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
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

        </section>
      )}

      {/* SELECTION SUMMARY */}
      

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
              <p className="text-xs text-white/35">{totalDuration}</p>
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

