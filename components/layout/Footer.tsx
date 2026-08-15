"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050505] text-white">

      {/* Ambient gold glow */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#D4AF37]/[0.06] blur-[120px]" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#D4AF37]/[0.05] blur-[130px]" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-10">

        {/* Brand */}
        <div>

          <h3 className="text-3xl font-semibold tracking-[0.3em] text-white">
            ORANE
          </h3>

          <div className="mt-4 h-[2px] w-16 bg-[#D4AF37]" />

          <p className="mt-6 max-w-sm leading-7 text-white/50">
            Luxury beauty treatments designed to help you relax,
            refresh and feel confident.
          </p>

          {/* Social Media */}
          <div className="mt-8 flex gap-3">

            <a
              href="#"
              aria-label="Instagram"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                bg-white/5
                text-xs
                font-semibold
                tracking-wider
                text-white/60
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#D4AF37]/60
                hover:bg-[#D4AF37]/10
                hover:text-[#D4AF37]
              "
            >
              IG
            </a>

            <a
              href="#"
              aria-label="Facebook"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                bg-white/5
                text-xs
                font-semibold
                tracking-wider
                text-white/60
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#D4AF37]/60
                hover:bg-[#D4AF37]/10
                hover:text-[#D4AF37]
              "
            >
              FB
            </a>

          </div>

        </div>

        {/* Explore */}
        <div>

          <h4 className="mb-6 text-lg font-medium text-white">
            Explore
          </h4>

          <ul className="space-y-4 text-white/50">

            <li>
              <Link
                href="/"
                className="transition-all duration-300 hover:pl-1 hover:text-[#D4AF37]"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                href="/#services"
                className="transition-all duration-300 hover:pl-1 hover:text-[#D4AF37]"
              >
                Services
              </Link>
            </li>

            <li>
              <Link
                href="/#gallery"
                className="transition-all duration-300 hover:pl-1 hover:text-[#D4AF37]"
              >
                Gallery
              </Link>
            </li>

            <li>
              <Link
                href="/contact"
                className="transition-all duration-300 hover:pl-1 hover:text-[#D4AF37]"
              >
                Contact
              </Link>
            </li>

            <li>
              <Link
                href="/booking"
                className="transition-all duration-300 hover:pl-1 hover:text-[#D4AF37]"
              >
                Book Appointment
              </Link>
            </li>

          </ul>

        </div>

        {/* Contact */}
        <div>

          <h4 className="mb-6 text-lg font-medium text-white">
            Contact
          </h4>

          <div className="space-y-5 text-white/50">

            <a
              href="tel:01895217151"
              className="flex gap-4 transition hover:text-[#D4AF37]"
            >
              <Phone
                size={19}
                className="mt-0.5 shrink-0 text-[#D4AF37]"
              />

              <span>
                01895 217151
              </span>
            </a>

            <a
              href="mailto:oraneickenham@gmail.com"
              className="flex gap-4 transition hover:text-[#D4AF37]"
            >
              <Mail
                size={19}
                className="mt-0.5 shrink-0 text-[#D4AF37]"
              />

              <span className="break-all">
                oraneickenham@gmail.com
              </span>
            </a>

            <div className="flex gap-4">

              <MapPin
                size={19}
                className="mt-0.5 shrink-0 text-[#D4AF37]"
              />

              <span>
                Ickenham,
                <br />
                United Kingdom
              </span>

            </div>

          </div>

        </div>

        {/* Opening Hours */}
        <div>

          <h4 className="mb-6 text-lg font-medium text-white">
            Opening Hours
          </h4>

          <div className="flex gap-4 text-white/50">

            <Clock
              size={19}
              className="mt-0.5 shrink-0 text-[#D4AF37]"
            />

            <div>

              <p>
                Monday – Saturday
              </p>

              <p className="mt-1">
                10:00 AM – 7:00 PM
              </p>

              <p className="mt-4 text-[#D4AF37]">
                Sunday · 9:00 AM – 5:00 PM
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom */}
      <div className="relative z-10 border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-white/35 md:flex-row md:items-center md:justify-between lg:px-10">

          <p>
            © {new Date().getFullYear()} ORANE Ickenham. All rights reserved.
          </p>

          <p>
            Luxury Beauty Salon
          </p>

        </div>

      </div>

    </footer>
  );
}
