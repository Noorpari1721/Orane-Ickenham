import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Gift,
  Heart,
  Sparkles,
} from "lucide-react";

export default function GiftCards() {
  return (
    <section
      id="gift-cards"
      className="
        relative
        isolate
        overflow-hidden
        bg-[#050505]
        py-20
        text-white
        sm:py-24
        lg:py-28
      "
    >
      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_18%_48%,rgba(196,154,69,0.18),transparent_32%),radial-gradient(circle_at_78%_42%,rgba(196,154,69,0.06),transparent_28%),linear-gradient(115deg,#080706_0%,#050505_48%,#020202_100%)]
        "
      />

      {/* Gold atmospheric glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[-10%]
          top-[25%]
          h-[360px]
          w-[360px]
          rounded-full
          bg-[#C49A45]/10
          blur-[130px]
          sm:h-[500px]
          sm:w-[500px]
        "
      />

      {/* =========================================================
          GOLD CSS PARTICLES
      ========================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[3%]
          top-[18%]
          h-1
          w-1
          rounded-full
          bg-[#E2B85C]
          shadow-[40px_70px_0_1px_rgba(226,184,92,.65),90px_25px_0_0_rgba(226,184,92,.35),135px_115px_0_1px_rgba(226,184,92,.7),180px_55px_0_0_rgba(226,184,92,.4),230px_145px_0_1px_rgba(226,184,92,.55),275px_70px_0_0_rgba(226,184,92,.35),320px_165px_0_1px_rgba(226,184,92,.65),365px_45px_0_0_rgba(226,184,92,.45)]
          opacity-80
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[8%]
          top-[42%]
          h-2
          w-2
          rounded-full
          bg-[#C49A45]/60
          blur-[1px]
          shadow-[55px_100px_0_1px_rgba(196,154,69,.35),120px_35px_0_0_rgba(196,154,69,.6),180px_125px_0_1px_rgba(196,154,69,.4),250px_55px_0_0_rgba(196,154,69,.5)]
        "
      />

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        <div
          className="
            grid
            items-center
            gap-16
            lg:grid-cols-[1.08fr_0.92fr]
            lg:gap-20
          "
        >

          {/* =====================================================
              LEFT — FLOATING GIFT CARD
          ===================================================== */}

          <div className="relative flex min-h-[360px] items-center justify-center sm:min-h-[470px] lg:min-h-[560px]">

            {/* Large golden atmosphere behind card */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[8%]
                top-[20%]
                h-[230px]
                w-[230px]
                rounded-full
                bg-[#C49A45]/20
                blur-[100px]
                sm:h-[340px]
                sm:w-[340px]
              "
            />

            {/* =================================================
                FLOATING CARD WRAPPER
            ================================================= */}

            <div
              className="
                relative
                w-[94%]
                max-w-[570px]
                rotate-0
                transition-transform
                duration-700
                hover:-translate-y-3
                hover:rotate-0
                sm:w-[88%]
              "
            >

              {/* Black floating shadow */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  -bottom-16
                  left-[8%]
                  h-[70px]
                  w-[84%]
                  rounded-[50%]
                  bg-black
                  opacity-90
                  blur-[28px]
                "
              />

              {/* Golden floor reflection */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  -bottom-10
                  left-[15%]
                  h-[35px]
                  w-[70%]
                  rounded-[50%]
                  bg-[#C49A45]/45
                  blur-[28px]
                "
              />

              {/* =================================================
                  CARD
              ================================================= */}

              <div
                className="
                  group
                  relative
                  aspect-[1.62/1]
                  w-full
                  overflow-hidden
                  rounded-[24px]
                  border
                  border-[#D4AF5A]/70
                  bg-[linear-gradient(135deg,#34322E_0%,#181816_34%,#080808_68%,#11100E_100%)]
                  shadow-[0_30px_70px_rgba(0,0,0,.75),0_0_45px_rgba(196,154,69,.16),inset_0_1px_1px_rgba(255,255,255,.18),inset_0_-20px_40px_rgba(0,0,0,.7)]
                  sm:rounded-[30px]
                "
              >

                {/* Card top highlight */}
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    left-[5%]
                    right-[5%]
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-white/60
                    to-transparent
                  "
                />

                {/* Gold outer glow */}
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-[24px]
                    shadow-[inset_0_0_35px_rgba(196,154,69,.13)]
                    sm:rounded-[30px]
                  "
                />

                {/* =================================================
                    CARD DIAGONAL REFLECTION
                ================================================= */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    -left-[40%]
                    -top-[90%]
                    h-[260%]
                    w-[42%]
                    rotate-[24deg]
                    bg-gradient-to-r
                    from-transparent
                    via-white/[0.10]
                    to-transparent
                    blur-lg
                    transition-transform
                    duration-[1400ms]
                    ease-out
                    group-hover:translate-x-[500%]
                  "
                />

                {/* Soft gold diagonal light */}
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    -left-[20%]
                    bottom-[-30%]
                    h-[150%]
                    w-[30%]
                    rotate-[35deg]
                    bg-gradient-to-r
                    from-transparent
                    via-[#D4AF5A]/10
                    to-transparent
                    blur-xl
                  "
                />

                {/* =================================================
                    CARD CIRCULAR DETAIL
                ================================================= */}

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    -right-16
                    -top-16
                    h-48
                    w-48
                    rounded-full
                    border
                    border-white/[0.10]
                    bg-gradient-to-br
                    from-white/[0.05]
                    to-transparent
                    sm:h-64
                    sm:w-64
                  "
                />

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    -right-5
                    -top-5
                    h-32
                    w-32
                    rounded-full
                    border
                    border-[#C49A45]/30
                    bg-[#C49A45]/[0.03]
                    sm:h-40
                    sm:w-40
                  "
                />

                {/* =================================================
                    CARD CONTENT
                ================================================= */}

                <div className="relative z-10 flex h-full flex-col p-6 sm:p-8 lg:p-10">

                  {/* Top */}
                  <div className="flex items-start justify-between">

                    <div>
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.45em]
                          text-[#DDB45C]
                          sm:text-xs
                        "
                      >
                        ORANE
                      </p>

                      <p
                        className="
                          mt-1
                          text-[7px]
                          uppercase
                          tracking-[0.35em]
                          text-white/45
                          sm:text-[9px]
                        "
                      >
                        ICKENHAM
                      </p>
                    </div>

                    {/* Gift icon */}
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#D4AF5A]/40
                        bg-black/20
                        shadow-[inset_0_1px_5px_rgba(255,255,255,.08),0_0_20px_rgba(196,154,69,.10)]
                        sm:h-12
                        sm:w-12
                      "
                    >
                      <Gift
                        size={20}
                        strokeWidth={1.25}
                        className="text-[#DDB45C] sm:h-[22px] sm:w-[22px]"
                      />
                    </div>
                  </div>

                  {/* Centre */}
                  <div className="flex flex-1 flex-col items-center justify-center text-center">

                    <Sparkles
                      size={16}
                      strokeWidth={1.2}
                      className="
                        mb-3
                        text-[#DDB45C]
                        drop-shadow-[0_0_8px_rgba(221,180,92,.6)]
                      "
                    />

                    <h3
                      className="
                        font-serif
                        text-3xl
                        text-white
                        drop-shadow-[0_3px_10px_rgba(0,0,0,.7)]
                        sm:text-4xl
                        lg:text-5xl
                      "
                    >
                      Gift Card
                    </h3>

                    <p
                      className="
                        mt-3
                        max-w-[300px]
                        text-[7px]
                        uppercase
                        leading-5
                        tracking-[0.32em]
                        text-white/55
                        sm:text-[9px]
                        sm:leading-6
                      "
                    >
                      A beautiful experience for
                      <br />
                      someone special
                    </p>
                  </div>

                  {/* Bottom */}
                  <div className="flex items-end justify-between">

                    <p
                      className="
                        text-[6px]
                        uppercase
                        tracking-[0.24em]
                        text-white/40
                        sm:text-[8px]
                      "
                    >
                      BEAUTY • WELLNESS • RELAXATION
                    </p>

                    <p
                      className="
                        font-serif
                        text-lg
                        text-[#DDB45C]
                        drop-shadow-[0_0_8px_rgba(196,154,69,.35)]
                        sm:text-xl
                      "
                    >
                      ORANE
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT — CONTENT
          ===================================================== */}

          <div className="relative z-10 text-center lg:text-left">

            {/* Eyebrow */}
            <div className="mb-6 flex items-center justify-center gap-4 lg:justify-start">

              <span className="h-px w-10 bg-[#D4AF5A]" />

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.35em]
                  text-[#D4AF5A]
                  sm:text-xs
                "
              >
                THE PERFECT GIFT
              </span>

            </div>

            {/* Heading */}
            <h2
              className="
                font-serif
                text-5xl
                leading-[0.98]
                tracking-[-0.02em]
                text-white
                sm:text-6xl
                lg:text-7xl
              "
            >
              Give the gift
              <br />
              <span className="text-[#D4AF5A]">
                of luxury.
              </span>
            </h2>

            {/* Gold divider */}
            <div className="mx-auto mt-7 flex items-center justify-center gap-3 lg:mx-0 lg:justify-start">
              <span className="h-px w-20 bg-gradient-to-r from-[#D4AF5A] to-transparent" />

              <Sparkles
                size={16}
                strokeWidth={1}
                className="
                  text-[#D4AF5A]
                  drop-shadow-[0_0_8px_rgba(212,175,90,.7)]
                "
              />
            </div>

            {/* Description */}
            <p
              className="
                mx-auto
                mt-7
                max-w-xl
                text-sm
                leading-7
                text-white/55
                sm:text-base
                sm:leading-8
                lg:mx-0
              "
            >
              Treat someone special to an ORANE experience.
              From beautiful nails and lashes to Japanese Head Spa,
              waxing, threading and beauty treatments, make their
              next visit something to remember.
            </p>

            {/* Buttons */}
            <div
              className="
                mt-8
                flex
                flex-col
                items-center
                justify-center
                gap-3
                sm:flex-row
                lg:justify-start
              "
            >

              <Link
                href="/gift-cards"
                className="
                  group
                  inline-flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-full
                  border
                  border-[#E0B85F]/70
                  bg-gradient-to-b
                  from-[#E0B85F]
                  to-[#A87825]
                  px-7
                  py-3.5
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#090909]
                  shadow-[0_12px_35px_rgba(196,154,69,.28),inset_0_1px_1px_rgba(255,255,255,.55)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_18px_45px_rgba(196,154,69,.4),0_0_25px_rgba(196,154,69,.2)]
                  sm:w-auto
                "
              >
                <Gift size={17} />

                Gift Cards

                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#services"
                className="
                  inline-flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#D4AF5A]/70
                  bg-transparent
                  px-7
                  py-3.5
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-[#D4AF5A]/10
                  hover:text-[#E5C575]
                  sm:w-auto
                "
              >
                Explore Treatments
              </a>
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM FEATURE BAR
        ========================================================= */}

        <div
          className="
            mt-16
            border-t
            border-white/10
            pt-8
            sm:mt-20
            sm:pt-10
            lg:mt-24
          "
        >
          <div
            className="
              grid
              grid-cols-2
              gap-y-8
              md:grid-cols-4
              md:gap-0
            "
          >

            {/* Feature 1 */}
            <div
              className="
                flex
                items-center
                justify-center
                gap-3
                border-white/10
                px-3
                md:border-r
              "
            >
              <Gift
                size={28}
                strokeWidth={1}
                className="shrink-0 text-[#D4AF5A]"
              />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:text-xs">
                  Beautiful Gift
                </p>

                <p className="mt-1 text-[9px] text-white/40 sm:text-[11px]">
                  Perfect for any occasion
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div
              className="
                flex
                items-center
                justify-center
                gap-3
                border-white/10
                px-3
                md:border-r
              "
            >
              <Sparkles
                size={28}
                strokeWidth={1}
                className="shrink-0 text-[#D4AF5A]"
              />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:text-xs">
                  Premium Experience
                </p>

                <p className="mt-1 text-[9px] text-white/40 sm:text-[11px]">
                  Luxury treatments & care
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div
              className="
                flex
                items-center
                justify-center
                gap-3
                border-white/10
                px-3
                md:border-r
              "
            >
              <Heart
                size={28}
                strokeWidth={1}
                className="shrink-0 text-[#D4AF5A]"
              />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:text-xs">
                  Thoughtful Gesture
                </p>

                <p className="mt-1 text-[9px] text-white/40 sm:text-[11px]">
                  Show you care
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center justify-center gap-3 px-3">
              <CreditCard
                size={28}
                strokeWidth={1}
                className="shrink-0 text-[#D4AF5A]"
              />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:text-xs">
                  Instant Delivery
                </p>

                <p className="mt-1 text-[9px] text-white/40 sm:text-[11px]">
                  Digital gift cards available
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


