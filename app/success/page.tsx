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
      className={`min-h-screen flex items-center justify-center px-6 ${
        isGiftCard
          ? "bg-[#050505] text-white"
          : "bg-[#F9F6F2]"
      }`}
    >
      <div
        className={`w-full max-w-xl rounded-3xl p-10 text-center shadow-xl ${
          isGiftCard
            ? "border border-[#D4AF5A]/25 bg-white/[0.035] backdrop-blur-xl"
            : "bg-white"
        }`}
      >
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
            isGiftCard
              ? "border border-[#D4AF5A]/30 bg-[#C49A45]/10"
              : "bg-green-100"
          }`}
        >
          <svg
            className={`h-10 w-10 ${
              isGiftCard
                ? "text-[#DDB45C]"
                : "text-green-600"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {isGiftCard ? (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#DDB45C]">
              ORANE ICKENHAM
            </p>

            <h1 className="mt-4 font-serif text-4xl text-white">
              Gift Card Purchased
            </h1>

            <p className="mt-5 leading-7 text-white/50">
              Thank you for choosing ORANE Ickenham.
              Your Gift Card payment has been
              successfully completed.
            </p>

            <p className="mt-4 text-sm leading-6 text-white/35">
              Your Gift Card will be activated after
              payment confirmation. The digital Gift
              Card details will be sent using the email
              provided during checkout.
            </p>

            <div className="mt-8 rounded-2xl border border-[#D4AF5A]/15 bg-[#C49A45]/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#DDB45C]">
                Thank you
              </p>

              <p className="mt-2 text-sm text-white/50">
                We look forward to welcoming you to
                ORANE Ickenham.
              </p>
            </div>

            <Link
              href="/"
              className="mt-8 inline-flex rounded-full border border-[#D4AF5A]/60 bg-gradient-to-b from-[#E0B85F] to-[#A87825] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[#080808] transition hover:-translate-y-0.5"
            >
              Return Home
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">
              Booking Confirmed
            </h1>

            <p className="mt-4 text-gray-600">
              Thank you for choosing ORANE Ickenham.
              Your appointment has been successfully
              booked.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-[#C49A45] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-[#B58A39]"
            >
              Return Home
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#F9F6F2] px-6">
          <div className="text-center text-gray-600">
            Loading...
          </div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}