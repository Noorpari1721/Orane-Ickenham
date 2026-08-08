"use client";

import { useBooking } from "@/context/BookingContext";
import { serviceCategories } from "@/data/services";
import {
  Clock3,
  PoundSterling,
  Sparkles,
} from "lucide-react";

export default function Step2Service() {
  const {
    booking,
    updateBooking,
    nextStep,
    goToStep,
  } = useBooking();

  const category = serviceCategories.find(
    (c) => c.id === booking.category
  );

  if (!category) return null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="uppercase tracking-[0.5em] text-[#D4AF37] text-sm">
          Step Two
        </p>

        <h2 className="mt-4 text-5xl font-light text-white">
          {category.title}
        </h2>

        <p className="mt-4 text-white/60">
          Select your preferred treatment.
        </p>
      </div>

      <div className="grid gap-6">
        {category.services.map((service) => {
          const active =
            booking.service?.id === service.id;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => {
                updateBooking({
                  service,
                  treatment: null,
                });

                setTimeout(() => {
                  if (booking.editingReview) {
                    updateBooking({
                      editingReview: false,
                      step: 7,
                    });
                  } else {
                    nextStep();
                  }
                }, 250);
              }}
              className={`group rounded-[28px] border transition-all duration-500 ${
                active
                  ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_50px_rgba(212,175,55,.2)]"
                  : "border-white/10 bg-white/5 hover:border-[#D4AF37]"
              }`}
            >
              <div className="flex items-center justify-between p-8">
                <div>
                  <div className="flex items-center gap-3">
                    <Sparkles
                      className="text-[#D4AF37]"
                      size={18}
                    />

                    <h3 className="text-2xl font-light text-white">
                      {service.name}
                    </h3>
                  </div>

                  <div className="mt-5 flex gap-8 text-white/60">
                    <div className="flex items-center gap-2">
                      <Clock3 size={16} />
                      {service.duration}
                    </div>

                    <div className="flex items-center gap-2">
                      <PoundSterling size={16} />
                      {service.price}
                    </div>
                  </div>
                </div>

                <div className="rounded-full border border-[#D4AF37]/30 px-6 py-3 text-[#D4AF37] transition group-hover:bg-[#D4AF37]/10">
                  Select
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

