"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  PoundSterling,
} from "lucide-react";
import { serviceCategories } from "@/data/services";

type Service = (typeof serviceCategories)[number]["services"][number];

const nailAddOns = new Set([
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

function ServiceCard({
  service,
  index,
  categoryId,
}: {
  service: Service;
  index: number;
  categoryId: string;
}) {
  return (
    <article className="group rounded-[28px] border border-white/10 bg-white/[0.035] p-6 transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-white/[0.055] md:p-8">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-5">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 text-xs text-[#D4AF37] sm:flex">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div className="min-w-0">
            <h3 className="font-serif text-2xl font-light text-white md:text-3xl">
              {service.name}
            </h3>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
              {service.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-5 text-sm text-white/60">
              <span className="inline-flex items-center gap-2">
                <Clock3 size={15} className="text-[#D4AF37]" />
                {service.duration}
              </span>

              <span className="inline-flex items-center gap-2">
                <PoundSterling size={15} className="text-[#D4AF37]" />
                {service.price}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/booking?category=${encodeURIComponent(categoryId)}&service=${service.id}`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03]"
        >
          Book Now
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

export function NailsCatalogue({
  services,
}: {
  services: Service[];
}) {
  const [filter, setFilter] = useState<"acrylic" | "biab" | "builder">(
    "acrylic"
  );

  const mainServices = services
    .filter((service) => {
      const name = service.name.toLowerCase();

      if (nailAddOns.has(service.name)) return false;

      if (filter === "acrylic") return name.includes("acrylic");
      if (filter === "biab") return name.includes("biab");

      return name.includes("builder gel");
    })
    .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));

  const addOnServices = services
    .filter((service) => nailAddOns.has(service.name))
    .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-3">
        {[
          ["acrylic", "Acrylic"],
          ["biab", "BIAB"],
          ["builder", "Builder Gel"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() =>
              setFilter(id as "acrylic" | "biab" | "builder")
            }
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
              filter === id
                ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                : "border-white/15 bg-white/[0.035] text-white/70 hover:border-[#D4AF37]/60 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {mainServices.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            index={index}
            categoryId="nails"
          />
        ))}
      </div>

      {addOnServices.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-5 inline-block border-b border-[#D4AF37] pb-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
            ADD-ONS
          </h3>

          <div className="space-y-5">
            {addOnServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                categoryId="nails"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function PedicureCatalogue({
  services,
}: {
  services: Service[];
}) {
  const pedicureAddOns = new Set([
    "Remove Gel/Shellac from Toes Only",
    "French Tips (Toes)",
    "Big Toe Fix",
  ]);

  const mainServices = services
    .filter((service) => !pedicureAddOns.has(service.name))
    .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));

  const addOnServices = services
    .filter((service) => pedicureAddOns.has(service.name))
    .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));

  return (
    <>
      <div className="space-y-5">
        {mainServices.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            index={index}
            categoryId="pedicure"
          />
        ))}
      </div>

      {addOnServices.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-5 inline-block border-b border-[#D4AF37] pb-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
            ADD-ONS
          </h3>

          <div className="space-y-5">
            {addOnServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                categoryId="pedicure"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
export function WaxingThreadingCatalogue({
  services,
}: {
  services: Service[];
}) {
  const [filter, setFilter] = useState<"waxing" | "threading">("waxing");

  const filteredServices = services
    .filter((service) => {
      const name = service.name.toLowerCase();

      if (filter === "threading") {
        return name.includes("threading");
      }

      return (
        name.includes("wax") ||
        name.includes("strip") ||
        name.includes("non-strip")
      );
    })
    .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setFilter("waxing")}
          className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
            filter === "waxing"
              ? "border-[#D4AF37] bg-[#D4AF37] text-black"
              : "border-white/15 bg-white/[0.035] text-white/70 hover:border-[#D4AF37]/60 hover:text-white"
          }`}
        >
          Waxing
        </button>

        <button
          type="button"
          onClick={() => setFilter("threading")}
          className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
            filter === "threading"
              ? "border-[#D4AF37] bg-[#D4AF37] text-black"
              : "border-white/15 bg-white/[0.035] text-white/70 hover:border-[#D4AF37]/60 hover:text-white"
          }`}
        >
          Threading
        </button>
      </div>

      <div className="space-y-5">
        {filteredServices.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            index={index}
            categoryId="waxing-threading"
          />
        ))}
      </div>
    </>
  );
}

