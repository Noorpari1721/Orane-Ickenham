"use client";

import Image from "next/image";
import { useBooking } from "@/context/BookingContext";
import { serviceCategories } from "@/data/services";

export default function Step1Category() {
  const {
    booking,
    updateBooking,
    nextStep,
  } = useBooking();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="uppercase tracking-[0.5em] text-[#D4AF37] text-sm">
          Step One
        </p>

        <h2 className="mt-4 text-5xl font-light text-white">
          Choose Your Experience
        </h2>

        <p className="mt-5 text-lg text-white/60">
          Every journey begins with selecting your luxury treatment.
        </p>
      </div>

      <div className="grid gap-8">
        {serviceCategories.map((category) => {
          const startingPrice = Math.min(
            ...category.services.map((s) => s.price)
          );

          const selected =
            booking.category === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                updateBooking({
                  category: category.id,
                  service: null,
                  treatment: null,
                  staff: null,
                  date: null,
                  time: "",
                });

                setTimeout(() => {
                  nextStep();
                }, 300);
              }}
              className={`group overflow-hidden rounded-[36px] border transition-all duration-500 ${
                selected
                  ? "border-[#D4AF37] shadow-[0_0_60px_rgba(212,175,55,.25)]"
                  : "border-white/10 hover:border-[#D4AF37]"
              }`}
            >
              <div className="grid lg:grid-cols-[340px_1fr]">
                <div className="relative h-[260px]">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/20 to-transparent" />
                </div>

                <div className="flex flex-col justify-center bg-white/5 p-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-light text-white">
                        {category.title}
                      </h3>

                      <p className="mt-3 text-white/60">
                        {category.services.length} Luxury Treatments
                      </p>
                    </div>

                    <div className="rounded-full bg-[#D4AF37]/10 px-6 py-3">
                      <span className="text-[#D4AF37]">
                        From £{startingPrice}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 h-[2px] w-0 bg-[#D4AF37] transition-all duration-500 group-hover:w-full" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

