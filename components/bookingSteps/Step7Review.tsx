"use client";

import { CalendarDays, Clock, User, Mail, Phone, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { useBooking } from "@/context/BookingContext";
import LuxuryButton from "@/components/ui/LuxuryButton";

export default function Step6Review() {
  const {
    booking,
    previousStep,
    nextStep,
  } = useBooking();

  return (
    <div>

      {/* Header */}
      <div className="mb-10">

        <p className="text-sm uppercase tracking-[0.4em] text-[#D4AF37]">
          Step 7
        </p>

        <h2 className="mt-3 text-4xl font-light text-white md:text-5xl">
          Review Your Booking
        </h2>

        <p className="mt-4 text-white/50">
          Please check your appointment details before continuing.
        </p>

      </div>


      {/* Booking Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
        space-y-6
        rounded-[32px]
        border
        border-white/10
        bg-white/5
        p-8
        backdrop-blur-xl
        "
      >

        <ReviewItem
          icon={<Sparkles size={18} />}
          title="Treatment"
          value={
            booking.service?.name ||
            "Not selected"
          }
        />


        <ReviewItem
          icon={<User size={18} />}
          title="Specialist"
          value={
            booking.staff?.name ||
            "No preference"
          }
        />


        <ReviewItem
          icon={<CalendarDays size={18} />}
          title="Date"
          value={
            booking.date
              ? booking.date.toLocaleDateString(
                  "en-GB",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )
              : "Not selected"
          }
        />


        <ReviewItem
          icon={<Clock size={18} />}
          title="Time"
          value={
            booking.time ||
            "Not selected"
          }
        />


        <div className="my-6 h-px bg-white/10" />


        <ReviewItem
          icon={<User size={18} />}
          title="Customer"
          value={
            `${booking.customer.firstName} ${booking.customer.lastName}`
          }
        />


        <ReviewItem
          icon={<Mail size={18} />}
          title="Email"
          value={
            booking.customer.email
          }
        />


        <ReviewItem
          icon={<Phone size={18} />}
          title="Phone"
          value={
            booking.customer.phone
          }
        />


      </motion.div>


      {/* Price */}
      <div
        className="
        mt-8
        flex
        items-center
        justify-between
        rounded-3xl
        border
        border-[#D4AF37]/20
        bg-[#D4AF37]/5
        p-6
        "
      >

        <span className="text-sm uppercase tracking-[0.25em] text-white/50">
          Total
        </span>


        <span className="text-3xl font-light text-[#D4AF37]">
          £{booking.service?.price ?? 0}
        </span>

      </div>



      {/* Navigation */}
      <div className="mt-10 flex justify-between gap-4">

        <LuxuryButton
          variant="glass"
          onClick={previousStep}
        >
          Ã¢â€ Â Back
        </LuxuryButton>


        <LuxuryButton
          onClick={nextStep}
        >
          Proceed To Payment Ã¢â€ â€™
        </LuxuryButton>

      </div>


    </div>
  );
}



function ReviewItem({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {

  return (
    <div className="flex gap-4">

      <div className="
      flex
      h-10
      w-10
      items-center
      justify-center
      rounded-full
      bg-[#D4AF37]/10
      text-[#D4AF37]
      ">
        {icon}
      </div>


      <div>

        <p className="
        text-xs
        uppercase
        tracking-[0.25em]
        text-white/40
        ">
          {title}
        </p>


        <p className="mt-1 text-white">
          {value}
        </p>

      </div>

    </div>
  );
}

