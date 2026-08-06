"use client";

import { motion } from "framer-motion";

const images = [
  "/images/gallery/1.jpg",
  "/images/gallery/2.jpg",
  "/images/gallery/3.jpg",
  "/images/gallery/4.jpg",
];

export default function Gallery() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="mx-auto max-w-6xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-3 text-sm uppercase tracking-[0.3em] text-[#C8A46A]"
        >
          Our Work
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16 text-4xl font-semibold md:text-5xl"
        >
          Gallery
        </motion.h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="aspect-square overflow-hidden rounded-xl bg-gray-100"
            >
              {/* Placeholder block until real images are added */}
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                Image {i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}