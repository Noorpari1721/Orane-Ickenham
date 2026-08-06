"use client";

import { motion } from "framer-motion";

const points = [
  { title: "Expert Artisans", desc: "Trained specialists with years of craft." },
  { title: "Premium Products", desc: "Only the finest, skin-safe formulations." },
  { title: "Serene Ambience", desc: "A calm, luxurious space to unwind." },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#faf8f5] py-24 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C8A46A]"
        >
          Why Orane Ickenham
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16 text-4xl font-semibold md:text-5xl"
        >
          Why Choose Us
        </motion.h2>

        <div className="grid gap-10 md:grid-cols-3">
          {points.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <h3 className="mb-3 text-xl font-medium">{p.title}</h3>
              <p className="text-sm text-gray-500">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}