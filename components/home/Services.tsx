"use client";

import { motion } from "framer-motion";

const services = [
  { name: "Premium Nails", desc: "Gel, acrylic & nail art crafted to perfection." },
  { name: "Lashes", desc: "Classic, hybrid & volume lash extensions." },
  { name: "Japanese Head Spa", desc: "A deeply relaxing scalp & hair ritual." },
  { name: "Beauty Treatments", desc: "Facials, waxing & skin care essentials." },
];

export default function Services() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="mx-auto max-w-6xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C8A46A]"
        >
          What We Offer
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16 text-4xl font-semibold md:text-5xl"
        >
          Our Services
        </motion.h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-gray-100 p-8 shadow-sm transition hover:shadow-lg"
            >
              <h3 className="mb-3 text-xl font-medium">{s.name}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}