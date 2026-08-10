"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { serviceCategories } from "@/data/services";
import { useBooking } from "@/context/BookingContext";
import LuxuryButton from "@/components/ui/LuxuryButton";

export default function Step1Services() {
  const { booking, updateBooking, nextStep } = useBooking();

  const selectedCategory = serviceCategories.find(
    (category) => category.id === booking.category
  );

  const handleCategorySelect = (categoryId: string) => {
    updateBooking({
      category: categoryId,
      service: null,
      treatment: null,
      staff: null,
    });
  };

  return (
    <div>
      {/* Heading */}
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.4em] text-[#D4AF37]">
          Step 1
        </p>

        <h2 className="mt-3 text-4xl font-light text-white md:text-5xl">
          Choose Your Service
        </h2>

        <p className="mt-4 max-w-2xl text-white/50">
          Begin your luxury experience by selecting the treatment category
          you'd like to explore.
        </p>
      </div>

      {/* Categories */}
      <div className="grid gap-6 sm:grid-cols-2">
        {serviceCategories.map((category) => {
          const selected = booking.category === category.id;

          return (
            <motion.button
              key={category.id}
              type="button"
              onClick={() => handleCategorySelect(category.id)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.985 }}
              transition={{
                duration: 0.25,
              }}
              className={`group relative overflow-hidden rounded-[28px] border text-left transition-all duration-500 ${
                selected
                  ? "border-[#D4AF37] bg-white/10 shadow-[0_20px_60px_rgba(212,175,55,0.12)]"
                  : "border-white/10 bg-white/5 hover:border-[#D4AF37]/50 hover:bg-white/[0.08]"
              }`}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover transition-transform duration-700 ${
                    selected
                      ? "scale-105"
                      : "group-hover:scale-105"
                  }`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Selected indicator */}
                {selected && (
                  <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] text-black shadow-lg">
                    <Check size={18} strokeWidth={2.5} />
                  </div>
                )}

                {/* Category title */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-light text-white">
                    {category.title}
                  </h3>
                </div>
              </div>

              {/* Bottom information */}
              <div className="flex items-center justify-between px-6 py-5">
                <span className="text-sm text-white/50">
                  {category.services.length}{" "}
                  {category.services.length === 1
                    ? "treatment"
                    : "treatments"}
                </span>

                <span
                  className={`text-xs uppercase tracking-[0.2em] transition-colors ${
                    selected
                      ? "text-[#D4AF37]"
                      : "text-white/40 group-hover:text-[#D4AF37]"
                  }`}
                >
                  {selected ? "Selected" : "Explore"}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Continue */}
      <div className="mt-10 flex justify-end">
        <LuxuryButton
          onClick={nextStep}
          disabled={!selectedCategory}
        >
          Continue →
        </LuxuryButton>
      </div>
    </div>
  );
}
