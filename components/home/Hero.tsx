"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f5f0]">
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4 uppercase tracking-[0.4em] text-sm"
        >
          Luxury Beauty Salon
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="text-5xl font-semibold md:text-7xl"
        >
          Beauty Crafted
          <br />
          To Perfection
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-gray-200"
        >
          Premium Nails • Lashes • Japanese Head Spa • Beauty Treatments
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="mt-10 rounded-full bg-[#C8A46A] px-8 py-4 font-medium text-black transition"
        >
          Book Appointment
        </motion.button>
      </div>
    </section>
  );
}