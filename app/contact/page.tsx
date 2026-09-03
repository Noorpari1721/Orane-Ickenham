"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const MAP_QUERY =
  "87 High Road, Ickenham, UB10 8LH, United Kingdom";

export default function ContactPage() {
  const directionsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(MAP_QUERY);

  const mapUrl =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(MAP_QUERY) +
    "&output=embed";

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#1d1d1d] px-6 py-16 text-white md:py-24">
      {/* BACK TO HOME */}
      <div className="absolute left-6 top-6 z-10 md:left-10 md:top-10">
        <Link
  href="/"
  aria-label="Back to Home"
  className="group inline-flex w-fit items-center gap-2.5 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-5 py-2.5 text-sm font-medium text-[#D4AF37] shadow-[0_4px_18px_rgba(212,175,55,.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37]/75 hover:bg-[#D4AF37]/15 hover:shadow-[0_8px_25px_rgba(212,175,55,.14)]"
>
  <ArrowLeft
    size={16}
    strokeWidth={1.8}
    className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5"
  />
  <span>Back to Home</span>
</Link>
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* CONTACT FORM */}
        <div className="mx-auto max-w-3xl pt-12 text-center md:pt-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-3 text-sm uppercase tracking-[0.3em] text-[#D4AF37]"
          >
            Get In Touch
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10 text-4xl font-semibold text-white md:text-5xl"
          >
            Contact Us
          </motion.h1>

          <form className="mx-auto grid max-w-xl gap-4 text-left">
            <input
              type="text"
              placeholder="Your Name"
              className="rounded-lg border border-[#D4AF37]/30 bg-[#292929] px-4 py-3 text-white placeholder:text-gray-300 transition focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="rounded-lg border border-[#D4AF37]/30 bg-[#292929] px-4 py-3 text-white placeholder:text-gray-300 transition focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
            />

            <textarea
              placeholder="Your Message"
              rows={5}
              className="rounded-lg border border-[#D4AF37]/30 bg-[#292929] px-4 py-3 text-white placeholder:text-gray-300 transition focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
            />

            <button
              type="submit"
              className="mt-2 rounded-full bg-[#D4AF37] px-8 py-4 font-medium text-[#1d1d1d] transition duration-300 hover:scale-[1.02] hover:bg-[#e2c45a]"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* LOCATION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mx-auto mt-20 max-w-5xl"
        >
          <div className="mb-6">
            <div className="grid items-start gap-8 text-center md:grid-cols-2 md:text-left">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
                  Visit Our Salon
                </p>

                <h2 className="text-2xl font-semibold text-white md:text-3xl">
                  Orane Ickenham
                </h2>

                <p className="mt-3 text-sm leading-7 text-gray-400">
                  87 High Road, Ickenham, UB10 8LH, United Kingdom
                </p>
              </div>

              <div className="border-t border-[#D4AF37]/20 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
                  Getting Here
                </p>

                <div className="space-y-3 text-sm leading-7 text-gray-400">
                  {/* CONTACT_GETTING_HERE_FINAL */}

                  <p>
                    <span className="font-medium text-white">
                      Nearest Underground Station:
                    </span>{" "}
                    West Ruislip — 2 mins walk.
                  </p>

                  <p>
                    <span className="font-medium text-white">
                      Nearest Bus Stops:
                    </span>
                  </p>

                  <p>
                    <span className="font-medium text-white">
                      West Ruislip Station:
                    </span>{" "}
                    U1, U10, 278, E7
                  </p>

                  <p>
                    <span className="font-medium text-white">
                      Ickenham Pump / High Road:
                    </span>{" "}
                    U1, 278
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-[#D4AF37] px-7 py-3 text-sm font-medium text-[#1d1d1d] transition duration-300 hover:bg-[#e2c45a]"
              >
                Get Directions
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#D4AF37]/40 shadow-2xl">
            <iframe
              title="Orane Ickenham Location"
              src={mapUrl}
              className="h-[420px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}