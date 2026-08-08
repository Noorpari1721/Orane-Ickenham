"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import GlassPill from "./GlassPill";
import NavLinks from "./NavLinks";
import ActionButtons from "./ActionButtons";

const links = [
  {
    name: "Home",
    href: "#home",
  },
  {
    name: "About",
    href: "#about",
  },
  {
    name: "Services",
    href: "#services",
  },
  {
    name: "Gallery",
    href: "#gallery",
  },
  {
    name: "Contact",
    href: "#contact",
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    onScroll();

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-6">

        <div
          className={`
            mt-5
            flex
            h-20
            items-center
            justify-between
            rounded-full
            px-7
            transition-all
            duration-500

            ${
              scrolled
                ? "border border-white/20 bg-white/15 shadow-[0_20px_45px_rgba(0,0,0,.18)] backdrop-blur-2xl"
                : "bg-transparent"
            }
          `}
        >

          {/* Logo */}

          <a
            href="#home"
            onClick={(e) => scrollToSection(e, "#home")}
            className={`
              text-3xl
              font-semibold
              tracking-[0.25em]
              transition-all
              duration-300

              ${
                scrolled
                  ? "text-[#C49A45]"
                  : "text-white"
              }

              hover:opacity-90
            `}
          >
            ORANE
          </a>

          {/* Navigation */}

          <div className="hidden lg:block">
            <GlassPill>

              <NavLinks
                links={links}
                scrolled={scrolled}
                onNavigate={scrollToSection}
              />

            </GlassPill>
          </div>

          {/* Right Buttons */}

          <ActionButtons
            scrolled={scrolled}
          />

          {/* Mobile */}

          <button
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              border
              border-white/20
              bg-white/10
              text-white
              backdrop-blur-xl
              lg:hidden
            "
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

        </div>

      </div>
    </header>
  );
}
