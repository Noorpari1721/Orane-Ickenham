"use client";

import { motion } from "framer-motion";

const testimonials = [
  { name: "Sarah M.", quote: "Absolutely stunning results every time. The team is so skilled and welcoming." },
  { name: "Priya K.", quote: "The Japanese Head Spa is pure bliss. I always leave feeling renewed." },
  { name: "Emily R.", quote: "Best lash extensions I've ever had. Professional and precise." },
];

export default function Testimonials() {
  return (
    <section className="bg-[#faf8f5] py-24 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C8A46A]"
        >
          Client Love
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16 text-4xl font-semibold md:text-5xl"
        >
          Testimonials
        </motion.h2>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="rounded-2xl bg-white p-8 shadow-sm"
            >
              <p className="mb-4 text-sm italic text-gray-600">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-sm font-medium">{t.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}