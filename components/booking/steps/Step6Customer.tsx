"use client";

import { useState } from "react";
import {
  ArrowRight,
  Mail,
  Phone,
  User,
  FileText,
} from "lucide-react";
import { useBooking } from "@/context/BookingContext";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
  const cleaned = phone.replace(/[\s\-().]/g, "");
  return /^(?:\+44|0)\d{9,10}$/.test(cleaned);
}

export default function Step6Customer() {
  const {
    booking,
    updateCustomer,
    nextStep,
  } = useBooking();

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const validate = () => {
    const nextErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    };

    const firstName = booking.customer.firstName.trim();
    const lastName = booking.customer.lastName.trim();
    const email = booking.customer.email.trim();
    const phone = booking.customer.phone.trim();

    if (!firstName) {
      nextErrors.firstName = "Please enter your first name.";
    } else if (firstName.length < 2) {
      nextErrors.firstName = "First name must be at least 2 characters.";
    }

    if (!lastName) {
      nextErrors.lastName = "Please enter your last name.";
    } else if (lastName.length < 2) {
      nextErrors.lastName = "Last name must be at least 2 characters.";
    }

    if (!email) {
      nextErrors.email = "Please enter your email address.";
    } else if (!validateEmail(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!phone) {
      nextErrors.phone = "Please enter your phone number.";
    } else if (!validatePhone(phone)) {
      nextErrors.phone = "Please enter a valid UK phone number.";
    }

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const handleContinue = () => {
    if (!validate()) return;

    updateCustomer({
      firstName: booking.customer.firstName.trim(),
      lastName: booking.customer.lastName.trim(),
      email: booking.customer.email.trim(),
      phone: booking.customer.phone.trim(),
      notes: booking.customer.notes.trim(),
    });

    nextStep();
  };

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 pl-12 text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-[#D4AF37]/70 focus:bg-white/[0.07] focus:shadow-[0_0_25px_rgba(212,175,55,.08)]";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Five
        </p>

        <h2 className="mt-4 text-5xl font-light text-white">
          Your Details
        </h2>

        <p className="mt-5 text-white/60">
          We only use your information to confirm your appointment.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/40">
              First Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/70"
              />

              <input
                type="text"
                autoComplete="given-name"
                placeholder="First Name"
                value={booking.customer.firstName}
                onChange={(e) => {
                  updateCustomer({ firstName: e.target.value });

                  if (errors.firstName) {
                    setErrors((prev) => ({
                      ...prev,
                      firstName: "",
                    }));
                  }
                }}
                className={inputClass}
              />
            </div>

            {errors.firstName && (
              <p className="mt-2 text-sm text-red-300">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/40">
              Last Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/70"
              />

              <input
                type="text"
                autoComplete="family-name"
                placeholder="Last Name"
                value={booking.customer.lastName}
                onChange={(e) => {
                  updateCustomer({ lastName: e.target.value });

                  if (errors.lastName) {
                    setErrors((prev) => ({
                      ...prev,
                      lastName: "",
                    }));
                  }
                }}
                className={inputClass}
              />
            </div>

            {errors.lastName && (
              <p className="mt-2 text-sm text-red-300">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/40">
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/70"
            />

            <input
              type="email"
              autoComplete="email"
              placeholder="Email Address"
              value={booking.customer.email}
              onChange={(e) => {
                updateCustomer({ email: e.target.value });

                if (errors.email) {
                  setErrors((prev) => ({
                    ...prev,
                    email: "",
                  }));
                }
              }}
              className={inputClass}
            />
          </div>

          {errors.email && (
            <p className="mt-2 text-sm text-red-300">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/40">
            Phone Number
          </label>

          <div className="relative">
            <Phone
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/70"
            />

            <input
              type="tel"
              autoComplete="tel"
              placeholder="Phone Number"
              value={booking.customer.phone}
              onChange={(e) => {
                updateCustomer({ phone: e.target.value });

                if (errors.phone) {
                  setErrors((prev) => ({
                    ...prev,
                    phone: "",
                  }));
                }
              }}
              className={inputClass}
            />
          </div>

          <p className="mt-2 text-xs text-white/30">
            UK number accepted, e.g. 07123 456789
          </p>

          {errors.phone && (
            <p className="mt-2 text-sm text-red-300">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/40">
            Special Requests
            <span className="ml-2 normal-case tracking-normal text-white/25">
              Optional
            </span>
          </label>

          <div className="relative">
            <FileText
              size={18}
              className="absolute left-4 top-5 text-[#D4AF37]/70"
            />

            <textarea
              placeholder="Anything you'd like us to know?"
              rows={5}
              value={booking.customer.notes}
              onChange={(e) =>
                updateCustomer({ notes: e.target.value })
              }
              className={`${inputClass} resize-none pl-12`}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#D4AF37]/10 bg-[#D4AF37]/5 px-5 py-4">
          <p className="text-sm leading-6 text-white/50">
            Your details are used only to manage and confirm your appointment.
          </p>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={handleContinue}
            className="group flex items-center gap-3 rounded-full bg-[#D4AF37] px-9 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_0_30px_rgba(212,175,55,.15)] transition-all duration-300 hover:scale-[1.03] hover:bg-[#e2c45a] hover:shadow-[0_0_40px_rgba(212,175,55,.28)]"
          >
            Continue

            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
