"use client";

import { motion } from "framer-motion";
import { User, Mail, Phone, MessageSquare } from "lucide-react";

import { useBooking } from "@/context/BookingContext";
import LuxuryButton from "@/components/ui/LuxuryButton";
import LuxuryInput from "@/components/ui/LuxuryInput";

export default function Step5Details() {
  const {
    booking,
    updateCustomer,
    previousStep,
    nextStep,
  } = useBooking();

  const customer = booking.customer;

  const isValid =
    customer.firstName.trim() &&
    customer.lastName.trim() &&
    customer.email.trim() &&
    customer.phone.trim();

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.4em] text-[#D4AF37]">
          Step 6
        </p>

        <h2 className="mt-3 text-4xl font-light text-white md:text-5xl">
          Your Details
        </h2>

        <p className="mt-4 max-w-2xl text-white/50">
          Please provide your details so we can confirm your appointment.
        </p>
      </div>


      {/* Form */}
      <div className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">

        <div className="grid gap-6 md:grid-cols-2">

          <LuxuryInput
            label="First Name"
            placeholder="Enter your first name"
            value={customer.firstName}
            icon={<User size={18} />}
            onChange={(e) =>
              updateCustomer({
                firstName: e.target.value,
              })
            }
          />


          <LuxuryInput
            label="Last Name"
            placeholder="Enter your last name"
            value={customer.lastName}
            icon={<User size={18} />}
            onChange={(e) =>
              updateCustomer({
                lastName: e.target.value,
              })
            }
          />

        </div>


        <LuxuryInput
          label="Email Address"
          placeholder="your@email.com"
          type="email"
          value={customer.email}
          icon={<Mail size={18} />}
          onChange={(e) =>
            updateCustomer({
              email: e.target.value,
            })
          }
        />


        <LuxuryInput
          label="Phone Number"
          placeholder="+44 XXXXX XXXXX"
          type="tel"
          value={customer.phone}
          icon={<Phone size={18} />}
          onChange={(e) =>
            updateCustomer({
              phone: e.target.value,
            })
          }
        />


        <div>
          <label className="mb-3 block text-xs uppercase tracking-[0.25em] text-white/40">
            Special Requests
          </label>

          <div className="relative">

            <MessageSquare
              size={18}
              className="absolute left-5 top-5 text-[#D4AF37]"
            />

            <textarea
              value={customer.notes}
              onChange={(e) =>
                updateCustomer({
                  notes: e.target.value,
                })
              }
              placeholder="Any preferences or notes for your appointment..."
              rows={5}
              className="
              w-full
              rounded-3xl
              border border-white/10
              bg-white/5
              py-4
              pl-14
              pr-5
              text-white
              outline-none
              transition-all
              placeholder:text-white/30
              focus:border-[#D4AF37]/60
              "
            />

          </div>
        </div>

      </div>


      {/* Confirmation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-5"
      >
        <p className="text-sm text-white/70">
          Your information is only used for appointment confirmation.
        </p>
      </motion.div>


      {/* Navigation */}
      <div className="mt-10 flex justify-between gap-4">

        <LuxuryButton
          variant="glass"
          onClick={previousStep}
        >
          ← Back
        </LuxuryButton>


        <LuxuryButton
          onClick={nextStep}
          disabled={!isValid}
        >
          Continue →
        </LuxuryButton>

      </div>

    </div>
  );
}
