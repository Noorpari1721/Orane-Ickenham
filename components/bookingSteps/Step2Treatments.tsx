"use client";

import { motion } from "framer-motion";
import { Check, Clock3 } from "lucide-react";

import { serviceCategories } from "@/data/services";
import { useBooking } from "@/context/BookingContext";
import LuxuryButton from "@/components/ui/LuxuryButton";

export default function Step2Treatments() {
  const {
    booking,
    setService,
    previousStep,
    nextStep,
  } = useBooking();

  const selectedCategory = serviceCategories.find(
    (category) => category.id === booking.category
  );

  const services = selectedCategory?.services ?? [];

  const selectedService = booking.service;

  return (
    <div>
      {/* Heading */}
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.4em] text-[#D4AF37]">
          Step 2
        </p>

        <h2 className="mt-3 text-4xl font-light text-white md:text-5xl">
          Choose Your Treatment
        </h2>

        <p className="mt-4 max-w-2xl text-white/50">
          Select the treatment that best suits your chosen service category.
        </p>

        {selectedCategory && (
          <div className="mt-5 inline-flex rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-5 py-2">
            <span className="text-sm text-[#D4AF37]">
              {selectedCategory.title}
            </span>
          </div>
        )}
      </div>

      {/* No category selected */}
      {!selectedCategory ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-white/60">
            Please select a service category first.
          </p>

          <div className="mt-6">
            <LuxuryButton onClick={previousStep} variant="glass">
              ← Back to Services
            </LuxuryButton>
          </div>
        </div>
      ) : (
        <>
          {/* Treatments */}
          <div className="space-y-4">
            {services.map((service) => {
              const selected = selectedService?.id === service.id;

              return (
                <motion.button
                  key={service.id}
                  type="button"
                  onClick={() => setService(service)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.2 }}
                  className={`group flex w-full items-center justify-between gap-6 rounded-[24px] border p-6 text-left transition-all duration-500 ${
                    selected
                      ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_15px_50px_rgba(212,175,55,0.08)]"
                      : "border-white/10 bg-white/5 hover:border-[#D4AF37]/40 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-white">
                        {service.name}
                      </h3>

                      {selected && (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-black">
                          <Check size={15} strokeWidth={2.5} />
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm text-white/45">
                      <Clock3 size={15} />
                      <span>{service.duration}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-light text-[#D4AF37]">
                      ?{service.price}
                    </p>

                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/30">
                      Treatment
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between gap-4">
            <LuxuryButton
              onClick={previousStep}
              variant="glass"
            >
              ← Back
            </LuxuryButton>

            <LuxuryButton
              onClick={nextStep}
              disabled={!selectedService}
            >
              Continue →
            </LuxuryButton>
          </div>
        </>
      )}
    </div>
  );
}

