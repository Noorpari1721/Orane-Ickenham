"use client";

import { useMemo } from "react";
import { Check, Clock3, Sun, Sunset, Moon } from "lucide-react";
import { motion } from "framer-motion";

import { useBooking } from "@/context/BookingContext";
import LuxuryButton from "@/components/ui/LuxuryButton";

type TimeSlot = {
  time: string;
  available: boolean;
};

const timeSlots: TimeSlot[] = [
  { time: "09:00", available: true },
  { time: "09:30", available: true },
  { time: "10:00", available: true },
  { time: "10:30", available: true },
  { time: "11:00", available: true },
  { time: "11:30", available: true },
  { time: "12:00", available: true },
  { time: "12:30", available: true },
  { time: "13:00", available: true },
  { time: "13:30", available: true },
  { time: "14:00", available: true },
  { time: "14:30", available: true },
  { time: "15:00", available: true },
  { time: "15:30", available: true },
  { time: "16:00", available: true },
  { time: "16:30", available: true },
  { time: "17:00", available: true },
  { time: "17:30", available: true },
  { time: "18:00", available: true },
  { time: "18:30", available: true },
  { time: "19:00", available: true },
  { time: "19:30", available: true },
];

function getHour(time: string) {
  return Number(time.split(":")[0]);
}

function formatTime(time: string) {
  const [hourString, minute] = time.split(":");
  const hour = Number(hourString);

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
}

function getPeriod(time: string) {
  const hour = getHour(time);

  if (hour < 12) {
    return "morning";
  }

  if (hour < 17) {
    return "afternoon";
  }

  return "evening";
}

const periods = [
  {
    id: "morning",
    label: "Morning",
    icon: Sun,
    description: "9:00 AM â€“ 11:30 AM",
  },
  {
    id: "afternoon",
    label: "Afternoon",
    icon: Sunset,
    description: "12:00 PM â€“ 4:30 PM",
  },
  {
    id: "evening",
    label: "Evening",
    icon: Moon,
    description: "5:00 PM â€“ 7:30 PM",
  },
] as const;

export default function Step4Time() {
  const {
    booking,
    setTime,
    previousStep,
    nextStep,
  } = useBooking();

  const selectedTime = booking.time;

  const selectedDateLabel = useMemo(() => {
    if (!booking.date) {
      return "Select a date first";
    }

    return booking.date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [booking.date]);

  const groupedSlots = periods.map((period) => ({
    ...period,
    slots: timeSlots.filter(
      (slot) => getPeriod(slot.time) === period.id
    ),
  }));

  return (
    <div>
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.4em] text-[#D4AF37]">
          Step 5
        </p>

        <h2 className="mt-3 text-4xl font-light text-white md:text-5xl">
          Choose Your Time
        </h2>

        <p className="mt-4 max-w-2xl text-white/50">
          Select an available appointment time for your treatment.
        </p>
      </div>

      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-5 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
          <Clock3 size={19} />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">
            Appointment Date
          </p>

          <p className="mt-1 text-white">
            {selectedDateLabel}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {groupedSlots.map((period) => {
          const Icon = period.icon;

          return (
            <div key={period.id}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#D4AF37]">
                  <Icon size={18} />
                </div>

                <div>
                  <h3 className="text-lg text-white">
                    {period.label}
                  </h3>

                  <p className="text-xs text-white/35">
                    {period.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {period.slots.map((slot) => {
                  const selected = selectedTime === slot.time;

                  return (
                    <motion.button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setTime(slot.time)}
                      whileHover={
                        slot.available ? { y: -2 } : undefined
                      }
                      whileTap={
                        slot.available
                          ? { scale: 0.97 }
                          : undefined
                      }
                      className={`relative flex min-h-[58px] items-center justify-center rounded-2xl border text-sm transition-all duration-300 ${
                        selected
                          ? "border-[#D4AF37] bg-[#D4AF37] text-black shadow-[0_8px_30px_rgba(212,175,55,0.2)]"
                          : slot.available
                          ? "border-white/10 bg-white/5 text-white/75 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 hover:text-white"
                          : "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/15"
                      }`}
                    >
                      {formatTime(slot.time)}

                      {selected && (
                        <span className="absolute right-2 top-2">
                          <Check size={12} />
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <motion.div
        initial={false}
        animate={{
          opacity: selectedTime ? 1 : 0.5,
        }}
        className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5"
      >
        <p className="text-xs uppercase tracking-[0.25em] text-white/35">
          Selected Time
        </p>

        <p
          className={`mt-2 text-lg ${
            selectedTime
              ? "text-[#D4AF37]"
              : "text-white/30"
          }`}
        >
          {selectedTime
            ? formatTime(selectedTime)
            : "Please select a time"}
        </p>
      </motion.div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <LuxuryButton
          onClick={previousStep}
          variant="glass"
        >
          â† Back
        </LuxuryButton>

        <LuxuryButton
          onClick={nextStep}
          disabled={!selectedTime}
        >
          Continue â†’
        </LuxuryButton>
      </div>
    </div>
  );
}
