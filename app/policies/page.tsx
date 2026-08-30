"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type PolicySection = {
  title: string;
  category: string;
  content: React.ReactNode;
};

function PolicyCard({
  title,
  category,
  content,
  isOpen,
  onClick,
}: PolicySection & {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition hover:border-[#D4AF37]/30">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-5 p-6 text-left sm:p-8"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#D4AF37]">
            {category}
          </p>

          <h2 className="mt-3 text-xl font-light text-white sm:text-2xl">
            {title}
          </h2>
        </div>

        <ChevronDown
          size={22}
          className={`shrink-0 text-[#D4AF37] transition-transform duration-300 ${
            isOpen
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-white/10 px-6 pb-7 pt-6 text-sm leading-7 text-white/65 sm:px-8 sm:pb-9 sm:pt-7 sm:text-[15px]">
          {content}
        </div>
      )}
    </article>
  );
}

export default function PoliciesPage() {
  const [openPolicy, setOpenPolicy] =
    useState(0);

  const policies: PolicySection[] = [
    {
      category: "Nail Care",
      title: "Nail Polish Guarantee Policy",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-white">
              Normal Polish
            </h3>

            <p className="mt-2">
              We do not offer a guarantee on normal nail polish due to its natural tendency to chip, smudge or wear.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-white">
              Shellac / Gel Polish
            </h3>

            <p className="mt-2">
              We offer a 48-hour guarantee from the time of your appointment. If you experience lifting, peeling or chipping within 48 hours, please contact us and we will arrange a complimentary repair.
            </p>
          </div>

          <p className="border-t border-white/10 pt-5 text-white/50">
            Damage caused by accidents, misuse or normal wear and tear is not covered.
          </p>
        </div>
      ),
    },
    {
      category: "Nail Care",
      title: "Nail Extension Guarantee Policy",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-white">
              Acrylic Extensions, Builder Gel & BIAB
            </h3>

            <p className="mt-2">
              We offer a 5-day guarantee from the date of your appointment for lifting or chipping.
            </p>
          </div>

          <p>
            If you experience lifting or chipping within 5 days, please contact us and we will arrange a complimentary repair.
          </p>

          <p className="border-t border-white/10 pt-5 text-white/50">
            Damage caused by accidents, misuse, picking, biting or normal wear and tear is not covered.
          </p>
        </div>
      ),
    },
    {
      category: "Waxing",
      title: "Waxing - During & Aftercare",
      content: (
        <div className="space-y-7">
          <div>
            <h3 className="font-medium text-white">
              During Your Treatment
            </h3>

            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Please inform your therapist of any allergies, skin conditions, medications or recent skin treatments.
              </li>
              <li>
                Avoid waxing over broken, irritated, sunburnt or damaged skin.
              </li>
              <li>
                Some redness and sensitivity immediately after waxing is normal.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-white">
              Aftercare - First 24-48 Hours
            </h3>

            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Avoid hot baths, saunas, steam rooms and swimming.
              </li>
              <li>
                Avoid intense exercise and excessive sweating.
              </li>
              <li>
                Avoid sunbeds and direct sun exposure.
              </li>
              <li>
                Do not apply perfumed products, deodorants or harsh skincare to the waxed area.
              </li>
              <li>
                Wear loose, clean clothing where possible.
              </li>
              <li>
                Avoid touching, scratching or rubbing the area.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-white">
              Ongoing Care
            </h3>

            <p className="mt-2">
              After 48 hours, gently exfoliate 2-3 times a week and moisturise regularly to help reduce ingrown hairs and keep the skin smooth.
            </p>
          </div>

          <p className="border-t border-white/10 pt-5 text-white/50">
            If you experience persistent irritation or an unusual skin reaction, please seek appropriate medical advice.
          </p>
        </div>
      ),
    },
    {
      category: "Lashes",
      title: "Eyelash Extension Aftercare",
      content: (
        <div>
          <p>
            To keep your lashes looking beautiful and lasting longer:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              Keep lashes dry for the first 24 hours after application.
            </li>
            <li>
              Avoid steam, saunas and excessive heat for the first 24-48 hours.
            </li>
            <li>
              Do not rub, pull or pick your extensions.
            </li>
            <li>
              Avoid oil-based products around the eyes, as they can weaken the adhesive.
            </li>
            <li>
              Clean your lashes regularly using a lash-safe cleanser and gently brush them with a clean lash brush.
            </li>
            <li>
              Avoid waterproof mascara and eyelash curlers.
            </li>
            <li>
              Sleep carefully and avoid pressing or rubbing your lashes against the pillow.
            </li>
            <li>
              Never attempt to remove extensions yourself - please book a professional removal.
            </li>
            <li>
              Regular infills every 2-3 weeks are recommended to maintain a full look.
            </li>
          </ul>

          <p className="mt-6 border-t border-white/10 pt-5 text-white/50">
            Please note: Natural lash shedding is normal, so a small number of extensions will naturally fall out over time.
          </p>
        </div>
      ),
    },
    {
      category: "Massage",
      title: "Massage - During & Aftercare",
      content: (
        <div className="space-y-7">
          <div>
            <h3 className="font-medium text-white">
              During Your Massage
            </h3>

            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Please inform your therapist of any medical conditions, injuries, allergies, pregnancy or medication before treatment.
              </li>
              <li>
                Let your therapist know immediately if the pressure, temperature or positioning feels uncomfortable.
              </li>
              <li>
                Areas with cuts, bruising, inflammation or injury may need to be avoided.
              </li>
              <li>
                Your comfort and privacy will be maintained throughout the treatment.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-white">
              Aftercare
            </h3>

            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Drink plenty of water and stay hydrated.
              </li>
              <li>
                Avoid alcohol and excessive caffeine for the rest of the day.
              </li>
              <li>
                Avoid strenuous exercise immediately after your massage.
              </li>
              <li>
                A warm bath or shower and gentle stretching can help you continue to relax.
              </li>
              <li>
                Mild tenderness or tiredness can occasionally occur after a deep massage and should usually settle.
              </li>
              <li>
                Allow yourself time to rest and relax after your treatment.
              </li>
            </ul>
          </div>

          <p className="border-t border-white/10 pt-5 text-white/50">
            If you experience persistent or unusual pain or discomfort following your massage, please seek appropriate medical advice.
          </p>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-[#080808] px-4 pb-20 pt-28 sm:px-6 md:pt-36">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <a
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-white/70 transition-all duration-300 hover:-translate-x-1 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Back to Home
          </a>
        </div>

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
            <ShieldCheck size={26} />
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.42em] text-[#D4AF37]">
            ORANE ICKENHAM
          </p>

          <h1 className="mt-5 text-4xl font-light text-white sm:text-5xl md:text-6xl">
            Policies & Aftercare
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Everything you need to know about our guarantees, treatments and recommended aftercare.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-5">
          {policies.map(
            (policy, index) => (
              <PolicyCard
                key={policy.title}
                {...policy}
                isOpen={
                  openPolicy === index
                }
                onClick={() =>
                  setOpenPolicy(
                    openPolicy === index
                      ? -1
                      : index
                  )
                }
              />
            )
          )}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-center text-xs uppercase tracking-[0.2em] text-white/35 sm:mt-16">
          <Sparkles
            size={14}
            className="text-[#D4AF37]"
          />

          Luxury Care, Clear Guidance
        </div>
      </div>
    </main>
  );
}