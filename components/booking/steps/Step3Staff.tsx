"use client";

import Image from "next/image";
import { Star, CheckCircle } from "lucide-react";

import { useBooking } from "@/context/BookingContext";
import { staff } from "@/data/staff";

export default function Step3Staff() {
  const {
    booking,
    updateBooking,
    nextStep,
  } = useBooking();

  const getStaff = () => {
    switch (booking.category) {
      case "head-spa":
        return staff.filter((s) =>
          ["any", "priya", "emma"].includes(s.id)
        );

      case "nails":
        return staff.filter((s) =>
          ["any", "simran", "olivia"].includes(s.id)
        );

      case "facials":
        return staff.filter((s) =>
          ["any", "jessica", "emma"].includes(s.id)
        );

      default:
        return staff;
    }
  };

  return (
    <div className="space-y-10">

      <div className="text-center">

        <p className="uppercase tracking-[0.5em] text-[#D4AF37] text-sm">
          Step Three
        </p>

        <h2 className="mt-4 text-5xl font-light text-white">
          Choose Your Specialist
        </h2>

        <p className="mt-5 text-white/60">
          Select your preferred beauty expert.
        </p>

      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

        {getStaff().map((person) => {

          const active =
            booking.staff?.id === person.id;

          return (

            <button
              key={person.id}
              onClick={() => {

                updateBooking({
                  staff: person,
                });

                setTimeout(() => {
                  nextStep();
                }, 250);

              }}
              className={`booking-card group overflow-hidden rounded-[30px] border transition-all duration-500

              ${
                active
                  ? "booking-card-active border-[#D4AF37] shadow-[0_0_50px_rgba(212,175,55,.25)]"
                  : "border-white/10 hover:border-[#D4AF37]"
              }`}
            >

              <div className="relative h-80">

                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {person.available && (

                  <div className="absolute right-5 top-5 rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white">

                    Available

                  </div>

                )}

              </div>

              <div className="space-y-4 bg-white/5 p-6 text-left">

                <h3 className="text-2xl font-light text-white">
                  {person.name}
                </h3>

                <p className="text-[#D4AF37]">
                  {person.role}
                </p>

                {person.experience && (
                  <p className="text-white/60">
                    {person.experience}
                  </p>
                )}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <Star
                      size={16}
                      fill="#D4AF37"
                      color="#D4AF37"
                    />

                    <span className="text-white">
                      4.9
                    </span>

                    <span className="text-white/50">
                      (250+)
                    </span>

                  </div>

                  {active && (
                    <CheckCircle
                      size={22}
                      className="text-[#D4AF37]"
                    />
                  )}

                </div>

              </div>

            </button>

          );

        })}

      </div>

    </div>
  );
}


