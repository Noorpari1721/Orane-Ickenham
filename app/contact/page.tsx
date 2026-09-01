"use client";

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
          className="inline-flex items-center gap-3 rounded-full border border-[#C49A45]/50 bg-[#252525] px-5 py-3 text-sm font-medium text-[#E2C07D] transition duration-300 hover:border-[#C49A45] hover:bg-[#C49A45] hover:text-[#1d1d1d]"
        >
          <span className="text-lg leading-none">â†</span>
          Back to Home
        </Link>
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* CONTACT FORM */}
        <div className="mx-auto max-w-3xl pt-12 text-center md:pt-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C8A46A]"
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
              className="rounded-lg border border-[#C49A45]/30 bg-[#292929] px-4 py-3 text-white placeholder:text-gray-300 transition focus:border-[#C8A46A] focus:outline-none focus:ring-2 focus:ring-[#C8A46A]/20"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="rounded-lg border border-[#C49A45]/30 bg-[#292929] px-4 py-3 text-white placeholder:text-gray-300 transition focus:border-[#C8A46A] focus:outline-none focus:ring-2 focus:ring-[#C8A46A]/20"
            />

            <textarea
              placeholder="Your Message"
              rows={5}
              className="rounded-lg border border-[#C49A45]/30 bg-[#292929] px-4 py-3 text-white placeholder:text-gray-300 transition focus:border-[#C8A46A] focus:outline-none focus:ring-2 focus:ring-[#C8A46A]/20"
            />

            <button
              type="submit"
              className="mt-2 rounded-full bg-[#D2B06F] px-8 py-4 font-medium text-[#1d1d1d] transition duration-300 hover:scale-[1.02] hover:bg-[#E2C07D]"
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
                <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#C8A46A]">
                  Visit Our Salon
                </p>

                <h2 className="text-2xl font-semibold text-white md:text-3xl">
                  Orane Ickenham
                </h2>

                <p className="mt-3 text-sm leading-7 text-gray-400">
                  87 High Road, Ickenham, UB10 8LH, United Kingdom
                </p>
              </div>

              <div className="border-t border-[#C49A45]/20 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C8A46A]">
                  Getting Here
                </p>

                <div className="space-y-3 text-sm leading-7 text-gray-400">
                  <p>
                    <span className="font-medium text-white">
                      Nearest Underground:
                    </span>{" "}
                    West Ruislip Station – only 2 minutes&apos; walk.
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
                className="inline-flex rounded-full bg-[#D2B06F] px-7 py-3 text-sm font-medium text-[#1d1d1d] transition duration-300 hover:bg-[#E2C07D]"
              >
                Get Directions
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#C49A45]/40 shadow-2xl">
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