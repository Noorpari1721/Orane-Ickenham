"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { staff } from "@/data/staff";
import { useBooking } from "@/context/BookingContext";
import LuxuryButton from "@/components/ui/LuxuryButton";

export default function Step3Staff() {
  const {
    booking,
    setStaff,
    previousStep,
    nextStep,
  } = useBooking();

  const availableStaff = staff.filter(
    (member) => member.available
  );

  const selectedStaff = booking.staff;

  return (
    <div>
      {/* Heading */}
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.4em] text-[#D4AF37]">
          Step 3
        </p>

        <h2 className="mt-3 text-4xl font-light text-white md:text-5xl">
          Choose Your Specialist
        </h2>

        <p className="mt-4 max-w-2xl text-white/50">
          Select your preferred specialist, or let us choose the best
          available professional for your treatment.
        </p>
      </div>

      {/* Staff */}
      <div className="grid gap-6 sm:grid-cols-2">
        {availableStaff.map((member) => {
          const selected = selectedStaff?.id === member.id;

          return (
            <motion.button
              key={member.id}
              type="button"
              onClick={() => setStaff(member)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.25 }}
              className={`group relative overflow-hidden rounded-[28px] border text-left transition-all duration-500 ${
                selected
                  ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_20px_60px_rgba(212,175,55,0.10)]"
                  : "border-white/10 bg-white/5 hover:border-[#D4AF37]/40 hover:bg-white/[0.08]"
              }`}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover transition-transform duration-700 ${
                    selected
                      ? "scale-105"
                      : "group-hover:scale-105"
                  }`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* Selected */}
                {selected && (
                  <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] text-black shadow-lg">
                    <Check size={18} strokeWidth={2.5} />
                  </div>
                )}

                {/* Name */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-light text-white">
                    {member.name}
                  </h3>

                  <p className="mt-1 text-sm text-white/60">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Information */}
              <div className="flex items-center justify-between px-6 py-5">
                <span className="text-sm text-white/45">
                  {member.experience || "Flexible assignment"}
                </span>

                <span
                  className={`text-xs uppercase tracking-[0.18em] ${
                    selected
                      ? "text-[#D4AF37]"
                      : "text-white/30 group-hover:text-[#D4AF37]"
                  }`}
                >
                  {selected ? "Selected" : "Select"}
                </span>
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
          disabled={!selectedStaff}
        >
          Continue →
        </LuxuryButton>
      </div>
    </div>
  );
}
