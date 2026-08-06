"use client";

import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
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
        className="mb-10 text-4xl font-semibold md:text-5xl"
      >
        Contact Us
      </motion.h1>

      <form className="mx-auto grid max-w-xl gap-4 text-left">
        <input
          type="text"
          placeholder="Your Name"
          className="rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C8A46A]"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C8A46A]"
        />
        <textarea
          placeholder="Your Message"
          rows={5}
          className="rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C8A46A]"
        />
        <button
          type="submit"
          className="mt-2 rounded-full bg-[#C8A46A] px-8 py-4 font-medium text-black transition hover:bg-[#b8925a]"
        >
          Send Message
        </button>
      </form>
    </section>
  );
}