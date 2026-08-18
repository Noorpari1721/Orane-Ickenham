"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const galleryImages = [
  {
    src: "/images/gallery/head-spa-1.jpg",
    alt: "Luxury Japanese Head Spa Treatment",
  },
  {
    src: "/images/gallery/head-spa-2.jpg",
    alt: "Relaxing Japanese Head Spa Experience",
  },
  {
    src: "/images/gallery/nails-1.jpg",
    alt: "Luxury Nail Treatment",
  },
  {
    src: "/images/gallery/nails-2.jpg",
    alt: "Beautiful Nail Design",
  },
  {
    src: "/images/gallery/lashes-1.jpg",
    alt: "Professional Lash Treatment",
  },
  {
    src: "/images/gallery/facial.jpg",
    alt: "Luxury Facial Treatment",
  },
  {
    src: "/images/gallery/massage.jpg",
    alt: "Relaxing Massage Treatment",
  },
  {
    src: "/images/gallery/beauty.jpg",
    alt: "Luxury Beauty Treatment",
  },
];

export default function Gallery() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % galleryImages.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const image = galleryImages[current];

  return (
    <section
      id="gallery"
      className="bg-[#F8F5F2] py-28"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mx-auto mb-5 h-[2px] w-20 bg-[#C49A45]" />

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.45em] text-[#C49A45]">
            OUR WORK
          </p>

          <h2 className="text-4xl font-medium text-[#1A1A1A] md:text-6xl">
            Beauty Created
            <br />
            With Precision
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Explore our latest beauty transformations and luxury salon
            experiences.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] shadow-xl md:aspect-[16/9]">

            {galleryImages.map((galleryImage, index) => (
              <div
                key={galleryImage.src}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === current
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <Image
                  src={galleryImage.src}
                  alt={galleryImage.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 1024px"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-black/0" />

                <div className="absolute bottom-0 left-0 h-1 w-full bg-[#C49A45]" />
              </div>
            ))}

          </div>

          <div className="mt-6 flex justify-center gap-3">
            {galleryImages.map((galleryImage, index) => (
              <button
                key={galleryImage.src}
                type="button"
                aria-label={`Show gallery image ${index + 1}`}
                onClick={() => setCurrent(index)}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  current === index
                    ? "w-8 bg-[#C49A45]"
                    : "w-2.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}