"use client";

import { useBooking } from "@/context/BookingContext";

export default function Step6Customer() {
  const { booking, updateBooking, nextStep } = useBooking();

  return (
    <div className="max-w-3xl mx-auto space-y-10">

      <div className="text-center">

        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Six
        </p>

        <h2 className="mt-4 text-5xl font-light text-white">
          Your Details
        </h2>

        <p className="mt-5 text-white/60">
          We only use your information to confirm your appointment.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <input
          placeholder="First Name"
          value={booking.customer.firstName}
          onChange={(e) =>
            updateBooking({
              customer: {
                ...booking.customer,
                firstName: e.target.value,
              },
            })
          }
          className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white outline-none focus:border-[#D4AF37]"
        />

        <input
          placeholder="Last Name"
          value={booking.customer.lastName}
          onChange={(e) =>
            updateBooking({
              customer: {
                ...booking.customer,
                lastName: e.target.value,
              },
            })
          }
          className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white outline-none focus:border-[#D4AF37]"
        />

      </div>

      <input
        placeholder="Email Address"
        type="email"
        value={booking.customer.email}
        onChange={(e) =>
          updateBooking({
            customer: {
              ...booking.customer,
              email: e.target.value,
            },
          })
        }
        className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-white outline-none focus:border-[#D4AF37]"
      />

      <input
        placeholder="Phone Number"
        value={booking.customer.phone}
        onChange={(e) =>
          updateBooking({
            customer: {
              ...booking.customer,
              phone: e.target.value,
            },
          })
        }
        className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-white outline-none focus:border-[#D4AF37]"
      />

      <textarea
        placeholder="Special Requests (Optional)"
        rows={5}
        value={booking.customer.notes}
        onChange={(e) =>
          updateBooking({
            customer: {
              ...booking.customer,
              notes: e.target.value,
            },
          })
        }
        className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-white outline-none focus:border-[#D4AF37]"
      />

      <div className="flex justify-end">

        <button
          onClick={nextStep}
          className="rounded-full bg-[#D4AF37] px-10 py-4 text-black font-semibold transition hover:scale-105"
        >
          Continue
        </button>

      </div>

    </div>
  );
}
