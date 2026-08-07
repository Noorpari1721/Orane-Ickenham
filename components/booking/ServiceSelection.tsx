"use client";

import { useBooking } from "@/app/booking/context/BookingContext";
import LuxuryButton from "@/components/ui/LuxuryButton";

const services = [
  {
    id: "head-spa",
    name: "Japanese Head Spa",
    duration: "60 min",
    price: "£85",
    image: "/images/services/head-spa.jpg",
  },
  {
    id: "facial",
    name: "Luxury Facial",
    duration: "60 min",
    price: "£70",
    image: "/images/services/facial.jpg",
  },
  {
    id: "lashes",
    name: "Lash Extensions",
    duration: "90 min",
    price: "£75",
    image: "/images/services/lashes.jpg",
  },
  {
    id: "nails",
    name: "Luxury Nails",
    duration: "75 min",
    price: "£55",
    image: "/images/services/nails.jpg",
  },
  {
    id: "massage",
    name: "Relaxing Massage",
    duration: "60 min",
    price: "£80",
    image: "/images/services/massage.jpg",
  },
  {
    id: "beauty",
    name: "Beauty Treatment",
    duration: "45 min",
    price: "£50",
    image: "/images/services/beauty.jpg",
  },
];

export default function ServiceSelection() {
  const { booking, updateBooking, nextStep } = useBooking();

  return (
    <div>
      <div className="mb-14 text-center">
        <p className="mb-4 uppercase tracking-[0.45em] text-[#C49A45] text-sm">
          STEP 1
        </p>

        <h1 className="text-5xl font-light text-white">
          Choose Your Service
        </h1>

        <p className="mt-5 text-gray-400">
          Select the luxury treatment you'd like to book.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() =>
              updateBooking({
                service: service.id,
              })
            }
            className={`
              overflow-hidden rounded-3xl border transition-all duration-500
              ${
                booking.service === service.id
                  ? "border-[#C49A45] bg-white/10 scale-[1.02]"
                  : "border-white/10 bg-white/5 hover:border-[#C49A45]/50 hover:bg-white/10"
              }
            `}
          >
            <img
              src={service.image}
              alt={service.name}
              className="h-56 w-full object-cover"
            />

            <div className="p-6 text-left">
              <h3 className="text-2xl text-white">
                {service.name}
              </h3>

              <div className="mt-4 flex justify-between text-sm text-gray-400">
                <span>{service.duration}</span>
                <span>{service.price}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-14 flex justify-end">
        <LuxuryButton
          onClick={nextStep}
          disabled={!booking.service}
        >
          Continue →
        </LuxuryButton>
      </div>
    </div>
  );
}