"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();

  const isGiftCard =
    searchParams.get("gift_card") === "success";

  return (
    <main
      className="
        relative flex min-h-screen items-center justify-center
        overflow-hidden px-5 py-12
        bg-[#15120E]
        text-white
      "
    >
      {/* Luxury golden ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute left-1/2 top-[18%]
            h-[420px] w-[420px]
            -translate-x-1/2
            rounded-full
            bg-[#D4AF37]/[0.12]
            blur-[150px]
          "
        />

        <div
          className="
            absolute -bottom-32 -left-24
            h-[420px] w-[420px]
            rounded-full
            bg-[#C49A45]/[0.08]
            blur-[150px]
          "
        />

        <div
          className="
            absolute -right-24 top-1/3
            h-[360px] w-[360px]
            rounded-full
            bg-[#E0B85F]/[0.06]
            blur-[140px]
          "
        />
      </div>

      {/* Subtle luxury texture */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.025)_0,transparent_55%)]
        "
      />

      <div
        className="
          relative z-10 w-full max-w-2xl
          overflow-hidden rounded-[34px]
          border border-[#D4AF37]/25
          bg-[#211C15]/90
          shadow-[0_30px_100px_rgba(0,0,0,.38)]
          backdrop-blur-2xl
        "
      >
        {/* Top gold accent */}
        <div
          className="
            h-px w-full
            bg-gradient-to-r
            from-transparent
            via-[#D4AF37]
            to-transparent
          "
        />

        <div className="px-7 py-10 text-center sm:px-12 sm:py-14">
          {/* Success icon */}
          <div
            className="
              mx-auto flex h-24 w-24
              items-center justify-center
              rounded-full
              border border-[#D4AF37]/35
              bg-[#D4AF37]/[0.10]
              shadow-[0_0_45px_rgba(212,175,55,.12)]
            "
          >
            <div
              className="
                flex h-16 w-16
                items-center justify-center
                rounded-full
                border border-[#D4AF37]/25
                bg-[#D4AF37]/[0.08]
              "
            >
              <svg
                className="h-9 w-9 text-[#DDB45C]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {isGiftCard ? (
            <>
              <p
                className="
                  mt-8 text-[10px]
                  font-semibold uppercase
                  tracking-[0.4em]
                  text-[#DDB45C]
                "
              >
                ORANE ICKENHAM
              </p>

              <h1
                className="
                  mt-4 font-serif
                  text-4xl font-normal
                  text-white
                  sm:text-5xl
                "
              >
                Gift Card Purchased
              </h1>

              <div
                className="
                  mx-auto mt-6 h-px w-20
                  bg-gradient-to-r
                  from-transparent
                  via-[#D4AF37]
                  to-transparent
                "
              />

              <p
                className="
                  mx-auto mt-6 max-w-lg
                  text-[15px] leading-7
                  text-white/65
                "
              >
                Thank you for choosing ORANE Ickenham.
                Your Gift Card payment has been
                successfully completed.
              </p>

              <p
                className="
                  mx-auto mt-4 max-w-lg
                  text-sm leading-6
                  text-white/40
                "
              >
                Your Gift Card will be activated after
                payment confirmation. The digital Gift
                Card details will be sent using the email
                provided during checkout.
              </p>

              <div
                className="
                  mx-auto mt-8 max-w-md
                  rounded-2xl
                  border border-[#D4AF37]/15
                  bg-[#D4AF37]/[0.045]
                  px-6 py-5
                "
              >
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.3em]
                    text-[#DDB45C]
                  "
                >
                  Thank you
                </p>

                <p className="mt-2 text-sm text-white/50">
                  We look forward to welcoming you to
                  ORANE Ickenham.
                </p>
              </div>

              <Link
                href="/"
                className="
                  mt-9 inline-flex
                  items-center justify-center
                  rounded-full
                  border border-[#E0B85F]/60
                  bg-gradient-to-b
                  from-[#E0B85F]
                  via-[#D4AF37]
                  to-[#A87825]
                  px-9 py-4
                  text-sm font-semibold
                  uppercase tracking-[0.16em]
                  text-[#17120B]
                  shadow-[0_10px_35px_rgba(212,175,55,.16)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_14px_42px_rgba(212,175,55,.25)]
                "
              >
                Return Home
              </Link>
            </>
          ) : (
            <>
              <p
                className="
                  mt-8 text-[10px]
                  font-semibold uppercase
                  tracking-[0.4em]
                  text-[#DDB45C]
                "
              >
                ORANE ICKENHAM
              </p>

              <h1
                className="
                  mt-4 font-serif
                  text-4xl font-normal
                  text-white
                  sm:text-5xl
                "
              >
                Booking Confirmed
              </h1>

              <div
                className="
                  mx-auto mt-6 h-px w-20
                  bg-gradient-to-r
                  from-transparent
                  via-[#D4AF37]
                  to-transparent
                "
              />

              <p
                className="
                  mx-auto mt-6 max-w-lg
                  text-[15px] leading-7
                  text-white/65
                "
              >
                Thank you for choosing ORANE Ickenham.
                Your appointment has been successfully
                booked.
              </p>

              <div
                className="
                  mx-auto mt-8 max-w-md
                  rounded-2xl
                  border border-[#D4AF37]/15
                  bg-[#D4AF37]/[0.045]
                  px-6 py-5
                "
              >
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.3em]
                    text-[#DDB45C]
                  "
                >
                  Appointment Confirmed
                </p>

                <p className="mt-2 text-sm text-white/50">
                  We look forward to welcoming you to
                  ORANE Ickenham.
                </p>
              </div>

              <Link
                href="/"
                className="
                  mt-9 inline-flex
                  items-center justify-center
                  rounded-full
                  border border-[#E0B85F]/60
                  bg-gradient-to-b
                  from-[#E0B85F]
                  via-[#D4AF37]
                  to-[#A87825]
                  px-9 py-4
                  text-sm font-semibold
                  uppercase tracking-[0.16em]
                  text-[#17120B]
                  shadow-[0_10px_35px_rgba(212,175,55,.16)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_14px_42px_rgba(212,175,55,.25)]
                "
              >
                Return Home
              </Link>
            </>
          )}
        </div>

        {/* Bottom gold accent */}
        <div
          className="
            h-px w-full
            bg-gradient-to-r
            from-transparent
            via-[#D4AF37]/50
            to-transparent
          "
        />
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main
          className="
            flex min-h-screen
            items-center justify-center
            bg-[#15120E] px-6
          "
        >
          <div className="text-center text-white/50">
            Loading...
          </div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
