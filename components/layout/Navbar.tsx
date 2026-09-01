"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import GlassPill from "./GlassPill";
import NavLinks from "./NavLinks";
import ActionButtons from "./ActionButtons";

const links = [
  { name: "Home", href: "#home" },
  { name: "Services", href: "#services" },
  { name: "Gallery", href: "#gallery" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
  { name: "Gift Cards", href: "#gift-cards" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoOverMap, setLogoOverMap] = useState(false);

  const logoRef = useRef<HTMLAnchorElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateNavbar = () => {
      setScrolled(window.scrollY > 40);

      const logo = logoRef.current;
      const map = document.querySelector(
        'iframe[title="Orane Ickenham Location"]'
      );

      if (!logo || !map) {
        setLogoOverMap(false);
        return;
      }

      const logoRect = logo.getBoundingClientRect();
      const mapRect = map.getBoundingClientRect();

      const overlaps =
        logoRect.right > mapRect.left &&
        logoRect.left < mapRect.right &&
        logoRect.bottom > mapRect.top &&
        logoRect.top < mapRect.bottom;

      setLogoOverMap(overlaps);
    };

    updateNavbar();

    window.addEventListener("scroll", updateNavbar, { passive: true });
    window.addEventListener("resize", updateNavbar);

    return () => {
      window.removeEventListener("scroll", updateNavbar);
      window.removeEventListener("resize", updateNavbar);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      const clickedInsideMenu =
        mobileMenuRef.current?.contains(target);

      const clickedMenuButton =
        mobileMenuButtonRef.current?.contains(target);

      if (!clickedInsideMenu && !clickedMenuButton) {
        setMobileOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsidePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointerDown
      );
    };
  }, [mobileOpen]);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();

    const section = document.querySelector(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* MAIN NAVBAR */}

        <div
          className={`
            mt-4 sm:mt-5
            flex
            min-h-16 sm:h-20
            items-center
            justify-between
            rounded-full
            px-5 sm:px-7
            transition-all
            duration-500
            ${
              scrolled
                ? "border border-white/20 bg-white/15 shadow-[0_20px_45px_rgba(0,0,0,.18)] backdrop-blur-2xl"
                : "bg-transparent"
            }
          `}
        >

          {/* LOGO */}

          <a
            ref={logoRef}
            href="#home"
            onClick={(e) => scrollToSection(e, "#home")}
            className={`flex shrink-0 items-center rounded-full px-3 py-2 transition-all duration-300 hover:scale-[1.03] ${
              logoOverMap
                ? "border border-white/10 bg-black/55 shadow-[0_8px_30px_rgba(0,0,0,.45)] backdrop-blur-xl"
                : ""
            }`}
            aria-label="Orane Ickenham Home"
          >
            <img
              src="/images/logo/orane-logo.png"
              alt="Orane Ickenham"
              className="h-auto w-[135px] object-contain sm:w-[155px]"
            />
          </a>

          {/* DESKTOP NAVIGATION */}

          <div className="hidden lg:block">
            <GlassPill>
              <NavLinks
                links={links}
                scrolled={scrolled}
                onNavigate={scrollToSection}
              />
            </GlassPill>
          </div>

          {/* DESKTOP ACTIONS */}

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <ActionButtons scrolled={scrolled} />
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className={`
              group
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              backdrop-blur-xl
              transition-all
              duration-500
              ease-out
              hover:scale-110
              active:scale-95
              lg:hidden

              ${
                scrolled
                  ? `
                    border-black/15
                    bg-black/15
                    text-[#C49A45]
                    shadow-[0_8px_25px_rgba(0,0,0,.18)]
                    hover:border-[#C49A45]/40
                    hover:bg-black/20
                    hover:shadow-[0_10px_30px_rgba(196,154,69,.20)]
                  `
                  : `
                    border-white/25
                    bg-white/10
                    text-white
                    shadow-[0_8px_25px_rgba(0,0,0,.18)]
                    hover:border-white/40
                    hover:bg-white/20
                    hover:shadow-[0_10px_30px_rgba(255,255,255,.12)]
                  `
              }
            `}
          >
            {mobileOpen ? (
              <X
                size={20}
                strokeWidth={1.7}
                className="
                  transition-transform
                  duration-500
                  ease-out
                  group-hover:rotate-90
                "
              />
            ) : (
              <Menu
                size={20}
                strokeWidth={1.7}
                className="
                  transition-transform
                  duration-500
                  ease-out
                  group-hover:scale-110
                "
              />
            )}
          </button>

        </div>

        {/* APPLE GLASS MOBILE MENU */}

        <div
          ref={mobileMenuRef}
          className={`
            lg:hidden
            overflow-hidden
            transition-[max-height,margin]
            duration-500
            ease-[cubic-bezier(.22,1,.36,1)]
            ${
              mobileOpen
                ? "mt-2 max-h-[400px]"
                : "pointer-events-none mt-0 max-h-0"
            }
          `}
        >
          <div
            className="
              ml-auto
              mr-1
              w-[calc(100%-28px)]
              max-w-[305px]
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

            {/* LINKS */}

            <nav className="flex flex-col">
              {links.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`
                    group
                    relative
                    flex
                    h-10
                    items-center
                    rounded-xl
                    px-3
                    text-[12px]
                    font-medium
                    uppercase
                    tracking-[0.15em]
                    text-white/90
                    transition-all
                    duration-300
                    ease-out
                    hover:translate-x-1
                    hover:scale-[1.015]
                    hover:bg-white/[0.09]
                    hover:text-[#D5AC55]
                    active:scale-[0.98]
                    active:bg-white/[0.12]
                    ${
                      index !== links.length - 1
                        ? "border-b border-white/10"
                        : ""
                    }
                  `}
                >
                  <span
                    className="
                      absolute
                      left-0
                      h-0
                      w-[2px]
                      rounded-full
                      bg-[#C49A45]
                      opacity-0
                      shadow-[0_0_10px_rgba(196,154,69,.8)]
                      transition-all
                      duration-300
                      group-hover:h-5
                      group-hover:opacity-100
                    "
                  />

                  <span
                    className="
                      transition-all
                      duration-300
                      group-hover:translate-x-1
                    "
                  >
                    {link.name}
                  </span>
                </a>
              ))}
            </nav>

            {/* ACTIONS */}

            <div className="mt-3 grid grid-cols-2 gap-2">

              <a
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="
                  group
                  relative
                  flex
                  h-10
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-white/25
                  bg-white/10
                  px-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  text-white
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:scale-[1.025]
                  hover:border-white/45
                  hover:bg-white/20
                  hover:text-[#E1BC6A]
                  active:scale-95
                "
              >
                My Account
              </a>

              <a
                href="/booking"
                onClick={() => setMobileOpen(false)}
                className="
                  group
                  relative
                  flex
                  h-10
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-[#D7B15F]/50
                  bg-[#C49A45]/90
                  px-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-black
                  shadow-[0_6px_20px_rgba(196,154,69,.25)]
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:scale-[1.025]
                  hover:bg-[#D5AC55]
                  hover:shadow-[0_10px_30px_rgba(196,154,69,.45)]
                  active:scale-95
                "
              >
                Book Now
              </a>

            </div>

          </div>
        </div>

      </div>
    </header>
  );
}
