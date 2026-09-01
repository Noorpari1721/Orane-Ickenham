"use client";

import { motion } from "framer-motion";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
} from "lucide-react";

import { useBooking } from "@/context/BookingContext";
import { getSelectedCategoryTitle } from "@/components/booking/bookingCategoryUtils";
import { serviceCategories } from "@/data/services";

function durationToMinutes(
  duration: unknown
): number {
  if (
    typeof duration === "number" &&
    Number.isFinite(duration)
  ) {
    return duration;
  }

  const raw =
    String(duration ?? "")
      .toLowerCase()
      .trim();

  if (!raw) {
    return 0;
  }

  let total = 0;

  const hoursMatch =
    raw.match(
      /(\d+(?:\.\d+)?)\s*(?:hr|hrs|hour|hours)\b/
    );

  const minutesMatch =
    raw.match(
      /(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes)\b/
    );

  if (hoursMatch) {
    total +=
      Number(hoursMatch[1]) * 60;
  }

  if (minutesMatch) {
    total +=
      Number(minutesMatch[1]);
  }

  if (
    !hoursMatch &&
    !minutesMatch
  ) {
    total =
      Number.parseInt(
        raw,
        10
      ) || 0;
  }

  return total;
}

export default function Step6Review() {
  const {
    booking,
    updateBooking,
  } = useBooking();

  const selectedServices =
    booking.services?.length
      ? booking.services
      : booking.service
        ? [booking.service]
        : [];
  const categoryTitle = getSelectedCategoryTitle(
    selectedServices,
    booking.category
  );

  const totalPrice =
    selectedServices.reduce(
      (total, service) =>
        total +
        Number(
          service.price ?? 0
        ),
      0
    );

  const totalDuration =
    selectedServices.reduce(
      (total, service) =>
        total +
        durationToMinutes(
          service.duration
        ),
      0
    );

  const formattedDate =
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
      : "Not selected";

  const editStep =
    (step: number) => {
      updateBooking({
        step,
        editingReview: true,
      });
    };

  const customerName =
    `${booking.customer.firstName} ${booking.customer.lastName}`.trim();

  const consultation =
    booking.consultationStatus;

  const consultationDetails = {
    online: {
      title:
        "Online Consultation",
      description:
        "Your consultation information will be completed online.",
      icon:
        FileText,
    },

    salon: {
      title:
        "Consultation at Salon",
      description:
        "You chose to complete your consultation at the salon before your treatment begins.",
      icon:
        MapPin,
    },

    "existing-unchanged": {
      title:
        "Existing Consultation Confirmed",
      description:
        "You confirmed that your relevant consultation information remains unchanged.",
      icon:
        CheckCircle2,
    },

    "update-required": {
      title:
        "Consultation Update Required",
      description:
        "You indicated that your consultation information has changed and will need to be reviewed.",
      icon:
        FileText,
    },
  } as const;

  const consultationInfo =
    consultation
      ? consultationDetails[
          consultation
        ]
      : null;

  const ConsultationIcon =
    consultationInfo?.icon;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Six
        </p>

        <h2 className="mt-4 text-3xl font-normal leading-tight text-white sm:text-4xl md:text-5xl">
          Review Your Booking
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/80 sm:mt-4">
          Please check everything before
          continuing to secure payment.
        </p>
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
        className="overflow-hidden rounded-[22px] sm:rounded-[28px] border border-[#D4AF37]/20 bg-white/5 shadow-[0_0_45px_rgba(212,175,55,.08)]"
      >
        <div className="border-b border-white/10 p-4 sm:p-7">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-[#D4AF37]/10 p-3 text-[#D4AF37]">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/75">
                  Category
                </p>

                <p className="mt-2 text-lg font-light text-white">
                  {categoryTitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                editStep(1)
              }
              className="shrink-0 rounded-full border border-[#D4AF37]/30 px-5 py-2.5 text-sm text-[#D4AF37] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              Change
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-7">
          <div className="flex items-start justify-between gap-3 sm:gap-6">
            <div className="flex min-w-0 items-start gap-4">
              <div className="shrink-0 rounded-full bg-[#D4AF37]/10 p-3 text-[#D4AF37]">
                <Sparkles size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] text-white/75">
                  Selected Services
                </p>

                <div className="mt-4 space-y-3">
                  {selectedServices.map(
                    (service) => (
                      <div
                        key={service.id}
                        className="flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-lg text-white">
                            {service.name}
                          </p>

                          <p className="mt-1 text-sm text-white/75">
                            {
                              durationToMinutes(
                                service.duration
                              )
                            } minutes
                          </p>
                        </div>

                        <p className="text-[#D4AF37]">
                          £{Number(
                            service.price
                          ).toFixed(2)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                editStep(1)
              }
              className="shrink-0 rounded-full border border-[#D4AF37]/30 px-5 py-2.5 text-sm text-[#D4AF37] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              Change
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          delay: 0.08,
        }}
        className="rounded-[22px] sm:rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-7"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
          Appointment Details
        </p>

        <div className="mt-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <ReviewItem
              icon={
                <CalendarDays
                  size={18}
                />
              }
              label="Date"
              value={formattedDate}
            />

            <button
              type="button"
              onClick={() =>
                editStep(2)
              }
              className="shrink-0 rounded-full border border-[#D4AF37]/30 px-4 py-2 text-xs text-[#D4AF37] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              Change
            </button>
          </div>

          <div className="flex items-start justify-between gap-4">
            <ReviewItem
              icon={
                <Clock3 size={18} />
              }
              label="Time"
              value={
                booking.time ||
                "Not selected"
              }
            />

            <button
              type="button"
              onClick={() =>
                editStep(3)
              }
              className="shrink-0 rounded-full border border-[#D4AF37]/30 px-4 py-2 text-xs text-[#D4AF37] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              Change
            </button>
          </div>

          <ReviewItem
            icon={
              <Clock3 size={18} />
            }
            label="Total Duration"
            value={
              `${totalDuration} minutes`
            }
          />
        </div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          delay: 0.12,
        }}
        className="rounded-[22px] sm:rounded-[28px] border border-[#D4AF37]/20 bg-[#D4AF37]/[0.04] p-4 sm:p-7"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Consultation
          </p>

          <button
            type="button"
            onClick={() =>
              editStep(4)
            }
            className="shrink-0 rounded-full border border-[#D4AF37]/30 px-4 py-2 text-xs text-[#D4AF37] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Change
          </button>
        </div>

        {consultationInfo &&
          ConsultationIcon ? (
          <div className="mt-6 flex items-start gap-4">
            <div className="rounded-full bg-[#D4AF37]/10 p-3 text-[#D4AF37]">
              <ConsultationIcon
                size={20}
              />
            </div>

            <div>
              <p className="text-lg text-white">
                {
                  consultationInfo.title
                }
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                {
                  consultationInfo.description
                }
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-white/70">
            Consultation preference has not been selected.
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          delay: 0.16,
        }}
        className="rounded-[22px] sm:rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-7"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Your Details
          </p>

          <button
            type="button"
            onClick={() =>
              editStep(4)
            }
            className="shrink-0 rounded-full border border-[#D4AF37]/30 px-4 py-2 text-xs text-[#D4AF37] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Change
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <ReviewItem
            icon={<User size={18} />}
            label="Name"
            value={
              customerName ||
              "Not provided"
            }
          />

          <ReviewItem
            icon={<Mail size={18} />}
            label="Email"
            value={
              booking.customer.email ||
              "Not provided"
            }
          />

          <ReviewItem
            icon={
              <Phone size={18} />
            }
            label="Phone"
            value={
              booking.customer.phone ||
              "Not provided"
            }
          />

          {booking.customer.notes.trim() && (
            <ReviewItem
              icon={
                <FileText
                  size={18}
                />
              }
              label="Special Requests"
              value={
                booking.customer.notes
              }
            />
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          delay: 0.22,
        }}
        className="rounded-[22px] sm:rounded-[28px] border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4 sm:p-7"
      >
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/75">
              Appointment Total
            </p>

            <p className="mt-2 text-sm text-white/70">
              {selectedServices.length} treatment
              {selectedServices.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <p className="text-3xl font-light text-[#D4AF37]">
            £{totalPrice.toFixed(2)}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function ReviewItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 shrink-0 text-[#D4AF37]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-white/75">
          {label}
        </p>

        <p className="mt-1 break-words text-white">
          {value}
        </p>
      </div>
    </div>
  );
}




