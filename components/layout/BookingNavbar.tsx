"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import GlassPill from "./GlassPill";
import MyAccountButton from "./MyAccountButton";

export default function BookingNavbar() {
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        !mobileMenuRef.current?.contains(target) &&
        !mobileMenuButtonRef.current?.contains(target)
      ) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointerDown
      );
    };
  }, [mobileOpen]);

  useEffect(() => {
    const TOP_THRESHOLD = 20;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setNavbarVisible(currentScrollY <= TOP_THRESHOLD);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.div
      className="
        fixed
        inset-x-0
        top-5
        z-[9999]
        flex
        justify-center
        px-4
        sm:px-6
        pointer-events-none
      "
      animate={{
        y: navbarVisible ? 0 : -140,
        opacity: navbarVisible ? 1 : 0,
      }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className="
          pointer-events-auto
          relative
          w-[calc(100vw-24px)]
          max-w-[980px]
          sm:w-[min(94vw,980px)]
        "
        animate={{
          y: [0, -5, 0],
        }}
        whileHover={{
          boxShadow: [
            "0 8px 30px rgba(0,0,0,0.18), 0 0 0 rgba(212,175,55,0)",
            "0 14px 38px rgba(0,0,0,0.24), 0 0 32px rgba(212,175,55,0.25)",
            "0 8px 30px rgba(0,0,0,0.18), 0 0 0 rgba(212,175,55,0)",
          ],
        }}
        transition={{
          y: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          },
          boxShadow: {
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <GlassPill>
          <div
            className="
              relative
              flex
              w-full
              items-center
              justify-between
              gap-2
              px-3
              py-1
              sm:justify-center
              sm:gap-10
              sm:px-12
              lg:gap-20
              lg:px-24
            "
          >
            {/* ORANE */}

            <Link
              href="/"
              aria-label="Orane Ickenham Home"
              className="
                shrink-0
                text-lg
                font-semibold
                tracking-[0.16em]
                text-white
                transition-all
                duration-500
                hover:-translate-y-0.5
                hover:text-[#D4AF37]
                hover:[text-shadow:0_0_22px_rgba(212,175,55,.55)]
                sm:text-2xl
                sm:tracking-[0.25em]
              "
            >
              ORANE
            </Link>

            {/* Desktop Home */}

            <Link
              href="/"
              className="
                hidden
                shrink-0
                rounded-full
                px-4
                py-2.5
                text-lg
                font-medium
                tracking-wide
                text-white/80
                transition-all
                duration-500
                hover:-translate-y-0.5
                hover:bg-white/10
                hover:text-[#D4AF37]
                hover:shadow-[0_0_28px_rgba(212,175,55,.24)]
                lg:block
              "
            >
              Home
            </Link>

            {/* Desktop Contact */}

            <Link
              href="/contact"
              className="
                hidden
                shrink-0
                rounded-full
                px-4
                py-2.5
                text-lg
                font-medium
                tracking-wide
                text-white/80
                transition-all
                duration-500
                hover:-translate-y-0.5
                hover:bg-white/10
                hover:text-[#D4AF37]
                hover:shadow-[0_0_28px_rgba(212,175,55,.24)]
                lg:block
              "
            >
              Contact
            </Link>

            {/* My Account */}

            <MyAccountButton variant="booking" />

            {/* Mobile Hamburger */}

            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                bg-white/10
                text-white
                backdrop-blur-xl
                transition-all
                duration-300
                active:scale-95
                lg:hidden
              "
            >
              {mobileOpen ? (
                <X size={20} strokeWidth={1.7} />
              ) : (
                <Menu size={20} strokeWidth={1.7} />
              )}
            </button>
          </div>
        </GlassPill>

        {/* MOBILE MENU */}

        <div
          ref={mobileMenuRef}
          className={`
            lg:hidden
            overflow-hidden
            transition-all
            duration-500
            ease-[cubic-bezier(.22,1,.36,1)]
            ${
              mobileOpen
                ? "mt-2 max-h-[180px] translate-y-0 opacity-100"
                : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
            }
          `}
        >
          <div
            className="
              ml-auto
              w-[calc(100%-8px)]
              max-w-[280px]
              overflow-hidden
              rounded-[24px]
              border
              border-white/20
              bg-black/40
              p-3
              shadow-[0_18px_55px_rgba(0,0,0,.35)]
              backdrop-blur-[28px]
              backdrop-saturate-150
            "
          >
            <nav className="flex flex-col">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="
                  flex
                  h-11
                  items-center
                  rounded-xl
                  px-3
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-white/90
                  transition-all
                  duration-300
                  hover:bg-white/[0.09]
                  hover:text-[#D5AC55]
                "
              >
                Home
              </Link>

              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="
                  flex
                  h-11
                  items-center
                  rounded-xl
                  px-3
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-white/90
                  transition-all
                  duration-300
                  hover:bg-white/[0.09]
                  hover:text-[#D5AC55]
                "
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>

        {/* Gold glow underneath capsule */}

        <motion.div
          className="
            pointer-events-none
            absolute
            -bottom-7
            left-1/2
            h-10
            w-[72%]
            -translate-x-1/2
            rounded-full
            bg-[#D4AF37]/20
            blur-2xl
          "
          animate={{
            opacity: [0.7, 1, 0.7],
            scaleX: [1, 1.06, 1],
          }}
          whileHover={{
            opacity: 1,
            scaleX: 1.12,
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>
  );
}