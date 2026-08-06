"use client";

import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="bg-black py-24 px-6 text-center text-white">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 text-4xl font-semibold md:text-5xl"
      >
        Ready for Your Transformation?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mx-auto mb-10 max-w-xl text-gray-300"
      >
        Book your appointment today and experience luxury beauty care crafted just for you.
      </motion.p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-full bg-[#C8A46A] px-8 py-4 font-medium text-black transition hover:bg-[#b8925a]"
      >
        Book Appointment
      </motion.button>
    </section>
  );
}