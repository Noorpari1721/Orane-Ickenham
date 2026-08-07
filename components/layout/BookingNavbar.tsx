"use client";

import { useEffect, useState } from "react";
import DesktopNav from "./DesktopNav";

export default function BookingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`
        fixed
        top-0
        left-0
        right-0
        z-50
        transition-all
        duration-500

        ${
          scrolled
            ? `
              h-[72px]
              bg-black/45
              backdrop-blur-xl
              border-b
              border-white/10
              shadow-2xl
            `
            : `
              h-[88px]
              bg-transparent
            `
        }
      `}
    >
      <div
        className="
          mx-auto
          flex
          h-full
          max-w-7xl
          items-center
          px-6
          lg:px-10
        "
      >
        <DesktopNav />
      </div>
    </header>
  );
}